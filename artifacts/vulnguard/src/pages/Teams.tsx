import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Eye, Pencil, Plus, Shield, Trash2, UserPlus, Users, X } from "lucide-react";

interface Team {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  role: string;
  createdAt: string;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}

const ROLE_ICON: Record<string, typeof Crown> = {
  admin: Crown,
  editor: Pencil,
  viewer: Eye,
};

const ROLE_COLOR: Record<string, string> = {
  admin: "border-amber-500/25 bg-amber-500/12 text-amber-300",
  editor: "border-zinc-700 bg-white/[0.04] text-zinc-200",
  viewer: "border-emerald-500/25 bg-emerald-500/12 text-emerald-300",
};

export default function Teams() {
  const { user, isLoading, isAuthenticated, login } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [error, setError] = useState("");

  const fetchTeams = useCallback(() => {
    fetch("/api/teams", { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => {});
  }, []);

  const fetchMembers = useCallback((teamId: string) => {
    fetch(`/api/teams/${teamId}/members`, { credentials: "include" })
      .then((response) => response.json())
      .then((data) => setMembers(data.members ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchTeams();
  }, [isAuthenticated, fetchTeams]);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam, fetchMembers]);

  const createTeam = async () => {
    setError("");
    const response = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newTeamName }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to create team");
      return;
    }
    setShowCreate(false);
    setNewTeamName("");
    fetchTeams();
  };

  const inviteMember = async () => {
    if (!selectedTeam) return;
    setError("");
    const response = await fetch(`/api/teams/${selectedTeam.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to invite member");
      return;
    }
    setShowInvite(false);
    setInviteEmail("");
    fetchMembers(selectedTeam.id);
  };

  const removeMember = async (memberId: string) => {
    if (!selectedTeam) return;
    await fetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, {
      method: "DELETE",
      credentials: "include",
    });
    fetchMembers(selectedTeam.id);
  };

  const changeRole = async (memberId: string, role: string) => {
    if (!selectedTeam) return;
    await fetch(`/api/teams/${selectedTeam.id}/members/${memberId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ role }),
    });
    fetchMembers(selectedTeam.id);
  };

  const deleteTeam = async () => {
    if (!selectedTeam) return;
    const confirmed = window.confirm(`Delete team "${selectedTeam.name}"? This cannot be undone.`);
    if (!confirmed) return;
    await fetch(`/api/teams/${selectedTeam.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setSelectedTeam(null);
    setMembers([]);
    fetchTeams();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-300" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="app-shell-panel max-w-sm rounded-[32px] p-8 text-center">
          <Users className="app-shell-heading mx-auto h-12 w-12" />
          <h2 className="app-shell-heading mt-4 text-2xl font-semibold">Sign in to manage teams</h2>
          <button
            onClick={login}
            className="mt-6 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5"
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="app-shell-panel flex flex-col gap-4 rounded-[32px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Governance</p>
          <h1 className="app-shell-heading mt-2 text-3xl font-semibold tracking-tight">Manage secure collaboration</h1>
          <p className="app-shell-copy mt-3 max-w-2xl text-base leading-7">
            Teams now sit inside the same premium workspace aesthetic. Add members, control roles, and keep access decisions easy to review.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/14 px-5 py-3 text-sm font-semibold text-emerald-200 transition-all hover:-translate-y-0.5 sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          New team
        </button>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="app-shell-panel rounded-[32px] p-6 sm:p-8">
          <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Your teams</p>
          <div className="mt-5 space-y-3">
            {teams.length === 0 ? (
              <div className="app-shell-panel-soft rounded-2xl p-8 text-center">
                <Users className="app-shell-muted mx-auto h-8 w-8" />
                <p className="app-shell-copy mt-3 text-sm">No teams yet</p>
              </div>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition-all ${
                    selectedTeam?.id === team.id
                      ? "border-emerald-500/25 bg-emerald-500/10"
                      : "app-shell-panel-soft hover:-translate-y-0.5 hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="app-shell-heading text-base font-semibold">{team.name}</p>
                  <p className="app-shell-muted mt-1 text-sm">{team.role === "admin" ? "Owner" : team.role}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className="app-shell-panel rounded-[32px]">
          {selectedTeam ? (
            <>
              <div className="flex flex-col gap-4 border-b border-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                <div>
                  <p className="app-shell-muted text-[11px] font-semibold uppercase tracking-[0.24em]">Selected workspace</p>
                  <h2 className="app-shell-heading mt-1 text-2xl font-semibold">{selectedTeam.name}</h2>
                  <p className="app-shell-copy text-sm">{members.length} member{members.length !== 1 ? "s" : ""}</p>
                </div>
                {selectedTeam.role === "admin" && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => setShowInvite(true)}
                      className="app-shell-button inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:-translate-y-0.5"
                    >
                      <UserPlus className="h-4 w-4" />
                      Invite
                    </button>
                    <button
                      onClick={deleteTeam}
                      className="inline-flex items-center gap-2 rounded-full border border-rose-500/25 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-200 transition-all hover:-translate-y-0.5"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>

              <div className="divide-y divide-border">
                {members.map((member, index) => {
                  const RoleIcon = ROLE_ICON[member.role] ?? Eye;
                  return (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.35 }}
                      className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {member.profileImageUrl ? (
                          <img src={member.profileImageUrl} alt="" className="h-11 w-11 rounded-2xl border border-zinc-800 object-cover" />
                        ) : (
                          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-100">
                            {(member.firstName?.[0] ?? member.email?.[0] ?? "?").toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-zinc-100">
                            {member.firstName ?? ""} {member.lastName ?? ""}
                            {!member.firstName && !member.lastName && (member.email ?? "Unknown")}
                          </p>
                          <p className="break-all text-sm text-zinc-500">{member.email}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${ROLE_COLOR[member.role]}`}>
                          <RoleIcon className="h-3.5 w-3.5" />
                          {member.role}
                        </span>

                        {selectedTeam.role === "admin" && member.userId !== user?.id && (
                          <div className="flex items-center gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => changeRole(member.id, e.target.value)}
                              className="rounded-full border border-zinc-800 bg-white/[0.03] px-3 py-2 text-xs text-zinc-200 outline-none"
                            >
                              <option value="admin">admin</option>
                              <option value="editor">editor</option>
                              <option value="viewer">viewer</option>
                            </select>
                            <button
                              onClick={() => removeMember(member.id)}
                              className="grid h-9 w-9 place-items-center rounded-full border border-rose-500/25 bg-rose-500/10 text-rose-200 transition-all hover:-translate-y-0.5"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 text-center sm:px-8">
              <Shield className="h-12 w-12 text-zinc-600" />
              <h2 className="mt-4 text-2xl font-semibold text-zinc-50">Select a team</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">Choose a workspace from the left to review members, roles, and governance actions.</p>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950/96 p-6 shadow-[0_32px_100px_-52px_rgba(0,0,0,1)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-zinc-50">Create team</h3>
              {error && <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
              <input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                className="mt-5 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-500/30"
                autoFocus
              />
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button onClick={() => setShowCreate(false)} className="rounded-full border border-zinc-800 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200">
                  Cancel
                </button>
                <button
                  onClick={createTeam}
                  disabled={!newTeamName.trim()}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/14 px-4 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md rounded-[32px] border border-zinc-800 bg-zinc-950/96 p-6 shadow-[0_32px_100px_-52px_rgba(0,0,0,1)] backdrop-blur-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-zinc-50">Invite member</h3>
              {error && <p className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="mt-5 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none focus:border-emerald-500/30"
                autoFocus
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-zinc-800 bg-white/[0.03] px-4 py-3 text-sm text-zinc-100 outline-none"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button onClick={() => setShowInvite(false)} className="rounded-full border border-zinc-800 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-zinc-200">
                  Cancel
                </button>
                <button
                  onClick={inviteMember}
                  disabled={!inviteEmail.trim()}
                  className="rounded-full border border-emerald-500/30 bg-emerald-500/14 px-4 py-2 text-sm font-semibold text-emerald-200 disabled:opacity-50"
                >
                  Send invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
