import { Router, type IRouter, type Request, type Response } from "express";
import { db, teamsTable, teamMembersTable, usersTable, scansTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

function param(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : (val ?? "");
}

const router: IRouter = Router();

router.get("/teams", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const memberships = await db
    .select({
      id: teamsTable.id,
      name: teamsTable.name,
      slug: teamsTable.slug,
      image: teamsTable.image,
      ownerId: teamsTable.ownerId,
      role: teamMembersTable.role,
      createdAt: teamsTable.createdAt,
    })
    .from(teamMembersTable)
    .innerJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
    .where(eq(teamMembersTable.userId, req.user.id));

  res.json({ teams: memberships });
});

router.post("/teams", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { name } = req.body;
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({ error: "Team name is required" });
    return;
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);

  const existingSlug = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.slug, slug));

  if (existingSlug.length > 0) {
    res.status(409).json({ error: "A team with this name already exists" });
    return;
  }

  const [team] = await db
    .insert(teamsTable)
    .values({
      name: name.trim(),
      slug,
      ownerId: req.user.id,
    })
    .returning();

  await db.insert(teamMembersTable).values({
    teamId: team.id,
    userId: req.user.id,
    role: "admin",
  });

  res.status(201).json({ team });
});

router.get("/teams/:teamId/members", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teamId = param(req.params.teamId);

  const membership = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, req.user.id),
      ),
    );

  if (membership.length === 0) {
    res.status(403).json({ error: "Not a member of this team" });
    return;
  }

  const members = await db
    .select({
      id: teamMembersTable.id,
      userId: teamMembersTable.userId,
      role: teamMembersTable.role,
      createdAt: teamMembersTable.createdAt,
      email: usersTable.email,
      firstName: usersTable.firstName,
      lastName: usersTable.lastName,
      profileImageUrl: usersTable.profileImageUrl,
    })
    .from(teamMembersTable)
    .innerJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
    .where(eq(teamMembersTable.teamId, teamId));

  res.json({ members });
});

router.post("/teams/:teamId/members", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teamId = param(req.params.teamId);
  const { email, role } = req.body;

  if (!email || typeof email !== "string") {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const callerMembership = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, req.user.id),
      ),
    );

  if (
    callerMembership.length === 0 ||
    callerMembership[0].role !== "admin"
  ) {
    res.status(403).json({ error: "Only admins can invite members" });
    return;
  }

  const [targetUser] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  if (!targetUser) {
    res.status(404).json({ error: "User not found. They must sign in first." });
    return;
  }

  const existingMember = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, targetUser.id),
      ),
    );

  if (existingMember.length > 0) {
    res.status(409).json({ error: "User is already a member" });
    return;
  }

  const validRoles = ["admin", "editor", "viewer"];
  const memberRole = validRoles.includes(role) ? role : "viewer";

  const [member] = await db
    .insert(teamMembersTable)
    .values({
      teamId,
      userId: targetUser.id,
      role: memberRole,
    })
    .returning();

  res.status(201).json({ member: { ...member, email: targetUser.email, firstName: targetUser.firstName, lastName: targetUser.lastName } });
});

router.patch("/teams/:teamId/members/:memberId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teamId = param(req.params.teamId);
  const memberId = param(req.params.memberId);
  const { role } = req.body;

  const callerMembership = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, req.user.id),
      ),
    );

  if (
    callerMembership.length === 0 ||
    callerMembership[0].role !== "admin"
  ) {
    res.status(403).json({ error: "Only admins can change roles" });
    return;
  }

  const validRoles = ["admin", "editor", "viewer"];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }

  const [target] = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.id, memberId),
        eq(teamMembersTable.teamId, teamId),
      ),
    );

  if (!target) {
    res.status(404).json({ error: "Member not found in this team" });
    return;
  }

  await db
    .update(teamMembersTable)
    .set({ role })
    .where(
      and(
        eq(teamMembersTable.id, memberId),
        eq(teamMembersTable.teamId, teamId),
      ),
    );

  res.json({ success: true });
});

router.delete("/teams/:teamId/members/:memberId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teamId = param(req.params.teamId);
  const memberId = param(req.params.memberId);

  const callerMembership = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.teamId, teamId),
        eq(teamMembersTable.userId, req.user.id),
      ),
    );

  if (
    callerMembership.length === 0 ||
    callerMembership[0].role !== "admin"
  ) {
    res.status(403).json({ error: "Only admins can remove members" });
    return;
  }

  const [targetMember] = await db
    .select()
    .from(teamMembersTable)
    .where(
      and(
        eq(teamMembersTable.id, memberId),
        eq(teamMembersTable.teamId, teamId),
      ),
    );

  if (!targetMember) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  const [team] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId));

  if (team && targetMember.userId === team.ownerId) {
    res.status(400).json({ error: "Cannot remove the team owner" });
    return;
  }

  await db.delete(teamMembersTable).where(
    and(
      eq(teamMembersTable.id, memberId),
      eq(teamMembersTable.teamId, teamId),
    ),
  );

  res.json({ success: true });
});

router.delete("/teams/:teamId", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const teamId = param(req.params.teamId);

  const [team] = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.id, teamId));

  if (!team) {
    res.status(404).json({ error: "Team not found" });
    return;
  }

  if (team.ownerId !== req.user.id) {
    res.status(403).json({ error: "Only the team owner can delete the team" });
    return;
  }

  await db.delete(teamsTable).where(eq(teamsTable.id, teamId));

  res.json({ success: true });
});

router.get("/user/profile", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.user.id));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const userScans = await db
    .select()
    .from(scansTable)
    .where(eq(scansTable.userId, req.user.id));

  res.json({
    user: {
      ...user,
      totalScans: userScans.length,
    },
  });
});

export default router;
