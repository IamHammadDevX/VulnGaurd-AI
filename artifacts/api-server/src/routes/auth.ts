import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

function normalizeAuthUser(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const value = input as Record<string, unknown>;

  const id = typeof value.id === "string" ? value.id : "";
  const email = typeof value.email === "string" ? value.email : null;
  const firstName = typeof value.firstName === "string" ? value.firstName : null;
  const lastName = typeof value.lastName === "string" ? value.lastName : null;
  const profileImageUrl =
    typeof value.profileImageUrl === "string" ? value.profileImageUrl : null;

  if (!id) return null;

  return {
    id,
    email,
    firstName,
    lastName,
    profileImageUrl,
  };
}

router.get("/auth/user", (req: Request, res: Response) => {
  const user = req.isAuthenticated() ? normalizeAuthUser(req.user) : null;
  const payload = { user };

  const parsed = GetCurrentAuthUserResponse.safeParse(payload);
  if (!parsed.success) {
    res.json({ user: null });
    return;
  }

  res.json(parsed.data);
});

router.patch("/auth/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = req.body as {
    email?: unknown;
    firstName?: unknown;
    lastName?: unknown;
    profileImageUrl?: unknown;
  };

  const email =
    typeof payload.email === "string" && payload.email.trim().length > 0
      ? payload.email.trim().toLowerCase()
      : undefined;

  const firstName =
    typeof payload.firstName === "string" ? payload.firstName.trim() : undefined;
  const lastName =
    typeof payload.lastName === "string" ? payload.lastName.trim() : undefined;
  const profileImageUrl =
    typeof payload.profileImageUrl === "string"
      ? payload.profileImageUrl.trim()
      : undefined;

  await db
    .update(usersTable)
    .set({
      email: email ?? req.user.email ?? null,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
      profileImageUrl: profileImageUrl ?? null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, req.user.id));

  const [updated] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id));

  res.json({
    user: {
      id: updated?.id ?? req.user.id,
      email: updated?.email ?? req.user.email,
      firstName: updated?.firstName ?? req.user.firstName,
      lastName: updated?.lastName ?? req.user.lastName,
      profileImageUrl: updated?.profileImageUrl ?? req.user.profileImageUrl,
    },
  });
});

router.get("/login", (_req: Request, res: Response) => {
  res.redirect("/login");
});

router.get("/logout", (_req: Request, res: Response) => {
  res.clearCookie("sb-access-token", { path: "/" });
  res.json({ success: true });
});

export default router;
