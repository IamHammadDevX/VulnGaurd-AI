import { Router, type IRouter, type Request, type Response } from "express";
import { db, scansTable, teamsTable, teamMembersTable, usersTable } from "@workspace/db";
import { eq, and, desc, gte, sql, count, avg, ilike, asc } from "drizzle-orm";

function param(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] : (val ?? "");
}

const router: IRouter = Router();

router.get("/user/dashboard/stats", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const allScans = await db
    .select({
      id: scansTable.id,
      riskScore: scansTable.riskScore,
      vulnerabilities: scansTable.vulnerabilities,
      createdAt: scansTable.createdAt,
    })
    .from(scansTable)
    .where(eq(scansTable.userId, userId));

  const thisMonthScans = allScans.filter(
    (s) => new Date(s.createdAt) >= monthStart,
  );

  let totalVulns = 0;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const scan of allScans) {
    const vulns = Array.isArray(scan.vulnerabilities)
      ? scan.vulnerabilities
      : [];
    totalVulns += vulns.length;
    for (const v of vulns as Array<{ severity?: string }>) {
      const sev = (v.severity ?? "").toUpperCase();
      if (sev === "CRITICAL") criticalCount++;
      else if (sev === "HIGH") highCount++;
      else if (sev === "MEDIUM") mediumCount++;
      else if (sev === "LOW") lowCount++;
    }
  }

  const avgRisk =
    allScans.length > 0
      ? Math.round(
          allScans.reduce((s, sc) => s + sc.riskScore, 0) / allScans.length,
        )
      : 0;

  const teamMemberships = await db
    .select({ teamId: teamMembersTable.teamId })
    .from(teamMembersTable)
    .where(eq(teamMembersTable.userId, userId));

  let teamMemberCount = 0;
  for (const tm of teamMemberships) {
    const members = await db
      .select({ id: teamMembersTable.id })
      .from(teamMembersTable)
      .where(eq(teamMembersTable.teamId, tm.teamId));
    teamMemberCount += members.length;
  }

  const estimatedCostSaved = allScans.length * 150;

  res.json({
    stats: {
      totalScansThisMonth: thisMonthScans.length,
      totalScansAllTime: allScans.length,
      totalVulnerabilities: totalVulns,
      averageRiskScore: avgRisk,
      criticalIssues: criticalCount,
      highIssues: highCount,
      mediumIssues: mediumCount,
      lowIssues: lowCount,
      teamMembers: teamMemberCount,
      apiCallsUsed: allScans.length,
      costSaved: estimatedCostSaved,
    },
  });
});

router.get("/user/dashboard/trend", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentScans = await db
    .select({
      vulnerabilities: scansTable.vulnerabilities,
      riskScore: scansTable.riskScore,
      createdAt: scansTable.createdAt,
    })
    .from(scansTable)
    .where(
      and(eq(scansTable.userId, userId), gte(scansTable.createdAt, thirtyDaysAgo)),
    )
    .orderBy(asc(scansTable.createdAt));

  const dayMap: Record<
    string,
    { date: string; critical: number; high: number; medium: number; low: number; total: number; avgRisk: number; scanCount: number; riskSum: number }
  > = {};

  for (let i = 0; i < 30; i++) {
    const d = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
    const key = d.toISOString().split("T")[0];
    dayMap[key] = {
      date: key,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      total: 0,
      avgRisk: 0,
      scanCount: 0,
      riskSum: 0,
    };
  }

  for (const scan of recentScans) {
    const key = new Date(scan.createdAt).toISOString().split("T")[0];
    if (!dayMap[key]) continue;
    const vulns = Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities : [];
    dayMap[key].scanCount++;
    dayMap[key].riskSum += scan.riskScore;
    for (const v of vulns as Array<{ severity?: string }>) {
      const sev = (v.severity ?? "").toUpperCase();
      dayMap[key].total++;
      if (sev === "CRITICAL") dayMap[key].critical++;
      else if (sev === "HIGH") dayMap[key].high++;
      else if (sev === "MEDIUM") dayMap[key].medium++;
      else if (sev === "LOW") dayMap[key].low++;
    }
  }

  const trend = Object.values(dayMap).map((d) => ({
    date: d.date,
    critical: d.critical,
    high: d.high,
    medium: d.medium,
    low: d.low,
    total: d.total,
    avgRisk: d.scanCount > 0 ? Math.round(d.riskSum / d.scanCount) : 0,
  }));

  res.json({ trend });
});

router.get("/user/dashboard/activity", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  const userTeamIds = await db
    .select({ teamId: teamMembersTable.teamId })
    .from(teamMembersTable)
    .where(eq(teamMembersTable.userId, userId));

  const teamIds = userTeamIds.map((t) => t.teamId);

  const activities: Array<{
    id: string;
    type: string;
    message: string;
    timestamp: string;
    meta?: Record<string, unknown>;
  }> = [];

  const recentScans = await db
    .select({
      id: scansTable.id,
      contractName: scansTable.contractName,
      riskScore: scansTable.riskScore,
      vulnerabilities: scansTable.vulnerabilities,
      createdAt: scansTable.createdAt,
      userId: scansTable.userId,
    })
    .from(scansTable)
    .where(eq(scansTable.userId, userId))
    .orderBy(desc(scansTable.createdAt))
    .limit(20);

  for (const scan of recentScans) {
    const vulnCount = Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities.length : 0;
    activities.push({
      id: `scan-${scan.id}`,
      type: "scan",
      message: `Scanned ${scan.contractName} — ${vulnCount} vulnerabilities found (risk: ${scan.riskScore})`,
      timestamp: scan.createdAt.toISOString(),
      meta: { scanId: scan.id, riskScore: scan.riskScore, vulnCount },
    });
  }

  if (teamIds.length > 0) {
    for (const teamId of teamIds) {
      const recentMembers = await db
        .select({
          id: teamMembersTable.id,
          userId: teamMembersTable.userId,
          role: teamMembersTable.role,
          createdAt: teamMembersTable.createdAt,
          teamName: teamsTable.name,
          firstName: usersTable.firstName,
          email: usersTable.email,
        })
        .from(teamMembersTable)
        .innerJoin(teamsTable, eq(teamMembersTable.teamId, teamsTable.id))
        .innerJoin(usersTable, eq(teamMembersTable.userId, usersTable.id))
        .where(eq(teamMembersTable.teamId, teamId))
        .orderBy(desc(teamMembersTable.createdAt))
        .limit(10);

      for (const member of recentMembers) {
        activities.push({
          id: `member-${member.id}`,
          type: "team_join",
          message: `${member.firstName ?? member.email} joined ${member.teamName} as ${member.role}`,
          timestamp: member.createdAt.toISOString(),
          meta: { teamId, role: member.role },
        });
      }

      const teamScans = await db
        .select({
          id: scansTable.id,
          contractName: scansTable.contractName,
          riskScore: scansTable.riskScore,
          vulnerabilities: scansTable.vulnerabilities,
          createdAt: scansTable.createdAt,
          firstName: usersTable.firstName,
          email: usersTable.email,
        })
        .from(scansTable)
        .innerJoin(usersTable, eq(scansTable.userId, usersTable.id))
        .where(eq(scansTable.teamId, teamId))
        .orderBy(desc(scansTable.createdAt))
        .limit(10);

      for (const scan of teamScans) {
        const vulnCount = Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities.length : 0;
        activities.push({
          id: `team-scan-${scan.id}`,
          type: "team_scan",
          message: `${scan.firstName ?? scan.email} scanned ${scan.contractName} — ${vulnCount} issues`,
          timestamp: scan.createdAt.toISOString(),
          meta: { scanId: scan.id, riskScore: scan.riskScore },
        });
      }
    }
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ activities: activities.slice(0, 30) });
});

router.get("/user/scans", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;
  const page = Math.max(1, parseInt(param(req.query.page as string) || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(param(req.query.limit as string) || "10", 10)));
  const search = param(req.query.search as string) || "";
  const sortBy = param(req.query.sortBy as string) || "date";
  const sortDir = param(req.query.sortDir as string) || "desc";
  const minRisk = parseInt(param(req.query.minRisk as string) || "0", 10);
  const maxRisk = parseInt(param(req.query.maxRisk as string) || "100", 10);

  const conditions = [eq(scansTable.userId, userId)];

  if (search) {
    conditions.push(ilike(scansTable.contractName, `%${search}%`));
  }
  if (minRisk > 0) {
    conditions.push(gte(scansTable.riskScore, minRisk));
  }
  if (maxRisk < 100) {
    const { lte } = await import("drizzle-orm");
    conditions.push(lte(scansTable.riskScore, maxRisk));
  }

  const whereClause = and(...conditions);

  const [{ total }] = await db
    .select({ total: count() })
    .from(scansTable)
    .where(whereClause);

  const orderCol =
    sortBy === "risk" ? scansTable.riskScore : scansTable.createdAt;
  const orderFn = sortDir === "asc" ? asc : desc;

  const scans = await db
    .select({
      id: scansTable.id,
      contractName: scansTable.contractName,
      contractHash: scansTable.contractHash,
      riskScore: scansTable.riskScore,
      status: scansTable.status,
      vulnerabilities: scansTable.vulnerabilities,
      executionTime: scansTable.executionTime,
      createdAt: scansTable.createdAt,
    })
    .from(scansTable)
    .where(whereClause)
    .orderBy(orderFn(orderCol))
    .limit(limit)
    .offset((page - 1) * limit);

  const scansWithCounts = scans.map((scan) => {
    const vulns = Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities : [];
    let critical = 0,
      high = 0,
      medium = 0,
      low = 0;
    for (const v of vulns as Array<{ severity?: string }>) {
      const sev = (v.severity ?? "").toUpperCase();
      if (sev === "CRITICAL") critical++;
      else if (sev === "HIGH") high++;
      else if (sev === "MEDIUM") medium++;
      else if (sev === "LOW") low++;
    }
    return {
      ...scan,
      issueCount: vulns.length,
      critical,
      high,
      medium,
      low,
    };
  });

  res.json({
    scans: scansWithCounts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

router.get("/user/scans/export", async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const userId = req.user.id;

  const scans = await db
    .select({
      id: scansTable.id,
      contractName: scansTable.contractName,
      contractHash: scansTable.contractHash,
      riskScore: scansTable.riskScore,
      status: scansTable.status,
      vulnerabilities: scansTable.vulnerabilities,
      executionTime: scansTable.executionTime,
      createdAt: scansTable.createdAt,
    })
    .from(scansTable)
    .where(eq(scansTable.userId, userId))
    .orderBy(desc(scansTable.createdAt));

  const headers = [
    "ID",
    "Contract Name",
    "Risk Score",
    "Status",
    "Issues",
    "Critical",
    "High",
    "Medium",
    "Low",
    "Execution Time (ms)",
    "Date",
  ];

  const rows = scans.map((scan) => {
    const vulns = Array.isArray(scan.vulnerabilities) ? scan.vulnerabilities : [];
    let critical = 0, high = 0, medium = 0, low = 0;
    for (const v of vulns as Array<{ severity?: string }>) {
      const sev = (v.severity ?? "").toUpperCase();
      if (sev === "CRITICAL") critical++;
      else if (sev === "HIGH") high++;
      else if (sev === "MEDIUM") medium++;
      else if (sev === "LOW") low++;
    }
    return [
      scan.id,
      `"${(scan.contractName ?? "").replace(/"/g, '""')}"`,
      scan.riskScore,
      scan.status,
      vulns.length,
      critical,
      high,
      medium,
      low,
      scan.executionTime ?? "",
      new Date(scan.createdAt).toISOString(),
    ].join(",");
  });

  const csv = [headers.join(","), ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="vulnguard-scans-${new Date().toISOString().split("T")[0]}.csv"`,
  );
  res.send(csv);
});

export default router;
