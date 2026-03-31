import * as oidc from "openid-client";
import { type Request, type Response, type NextFunction } from "express";
import type { AuthUser } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { getSupabaseAdminClient } from "../lib/supabase";
import {
  clearSession,
  getOidcConfig,
  getSession,
  updateSession,
  SESSION_COOKIE,
  type SessionData,
} from "../lib/auth";

declare global {
  namespace Express {
    interface User extends AuthUser {}

    interface Request {
      isAuthenticated(): this is AuthedRequest;

      user?: User | undefined;
    }

    export interface AuthedRequest {
      user: User;
    }
  }
}

async function refreshIfExpired(
  sid: string,
  session: SessionData,
): Promise<SessionData | null> {
  const now = Math.floor(Date.now() / 1000);
  if (!session.expires_at || now <= session.expires_at) return session;

  if (!session.refresh_token) return null;

  try {
    const config = await getOidcConfig();
    const tokens = await oidc.refreshTokenGrant(
      config,
      session.refresh_token,
    );
    session.access_token = tokens.access_token;
    session.refresh_token = tokens.refresh_token ?? session.refresh_token;
    session.expires_at = tokens.expiresIn()
      ? now + tokens.expiresIn()!
      : session.expires_at;
    await updateSession(sid, session);
    return session;
  } catch {
    return null;
  }
}

function getSupabaseToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookieToken = req.cookies?.["sb-access-token"];
  return typeof cookieToken === "string" ? cookieToken : null;
}

async function authenticateWithSupabase(req: Request): Promise<AuthUser | null> {
  const token = getSupabaseToken(req);
  if (!token) return null;

  const supabase = getSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }

  const metadata = (data.user.user_metadata ?? {}) as Record<string, unknown>;
  const userData = {
    id: data.user.id,
    email: data.user.email ?? null,
    firstName:
      (typeof metadata["first_name"] === "string" && metadata["first_name"]) ||
      (typeof metadata["full_name"] === "string" && metadata["full_name"].split(" ")[0]) ||
      null,
    lastName:
      (typeof metadata["last_name"] === "string" && metadata["last_name"]) ||
      null,
    profileImageUrl:
      (typeof metadata["avatar_url"] === "string" && metadata["avatar_url"]) ||
      null,
  };

  // Keep auth resilient: avoid crashing requests when legacy rows already own the same email.
  let dbUser:
    | {
        id: string;
        email: string | null;
        firstName: string | null;
        lastName: string | null;
        profileImageUrl: string | null;
      }
    | undefined;

  const [existingById] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userData.id));

  if (existingById) {
    await db
      .update(usersTable)
      .set({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userData.id));

    dbUser = {
      id: existingById.id,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      profileImageUrl: userData.profileImageUrl,
    };
  } else if (userData.email) {
    const [existingByEmail] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, userData.email));

    if (existingByEmail) {
      await db
        .update(usersTable)
        .set({
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, existingByEmail.id));

      // Preserve existing PK to avoid FK breakage from legacy rows.
      dbUser = {
        id: existingByEmail.id,
        email: existingByEmail.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
      };
    }
  }

  if (!dbUser) {
    await db
      .insert(usersTable)
      .values(userData)
      .onConflictDoUpdate({
        target: usersTable.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      });

    const [inserted] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userData.id));
    dbUser = inserted;
  }

  if (!dbUser) return null;

  return {
    id: dbUser.id,
    email: dbUser.email,
    firstName: dbUser.firstName,
    lastName: dbUser.lastName,
    profileImageUrl: dbUser.profileImageUrl,
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.isAuthenticated = function (this: Request) {
    return this.user != null;
  } as Request["isAuthenticated"];

  let supabaseUser: AuthUser | null = null;
  try {
    supabaseUser = await authenticateWithSupabase(req);
  } catch (err) {
    req.log.warn({ err }, "Supabase auth sync failed; continuing without auth");
  }

  if (supabaseUser) {
    req.user = supabaseUser;
    next();
    return;
  }

  // Legacy session store should only read its own cookie sid, never Bearer JWTs.
  const sidValue = req.cookies?.[SESSION_COOKIE];
  const sid = typeof sidValue === "string" ? sidValue : undefined;
  if (!sid) {
    next();
    return;
  }

  let session: SessionData | null = null;
  try {
    session = await getSession(sid);
  } catch (err) {
    req.log.warn({ err }, "Legacy session lookup failed; continuing without auth");
    next();
    return;
  }

  if (!session?.user?.id) {
    try {
      await clearSession(res, sid);
    } catch (err) {
      req.log.warn({ err }, "Failed to clear legacy session cookie");
    }
    next();
    return;
  }

  let refreshed: SessionData | null = null;
  try {
    refreshed = await refreshIfExpired(sid, session);
  } catch (err) {
    req.log.warn({ err }, "Legacy session refresh failed; continuing without auth");
  }

  if (!refreshed) {
    try {
      await clearSession(res, sid);
    } catch (err) {
      req.log.warn({ err }, "Failed to clear legacy session cookie");
    }
    next();
    return;
  }

  req.user = refreshed.user;
  next();
}
