import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@workspace/replit-auth-web";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Plus, Crown, Shield, Eye, Pencil,
  Trash2, UserPlus, X,
} from "lucide-react";

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
  admin: "text-yellow-400 bg-yellow-500/15",
  editor: "text-blue-400 bg-blue-500/15",
  viewer: "text-muted-foreground bg-white/5",
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
      .then((r) => r.json())
      .then((data) => setTeams(data.teams ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchTeams();
  }, [isAuthenticated, fetchTeams]);

  const fetchMembers = useCallback((teamId: string) => {
    fetch(`/api/teams/${teamId}/members`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => setMembers(data.members ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedTeam) fetchMembers(selectedTeam.id);
  }, [selectedTeam, fetchMembers]);

  const createTeam = async () => {
    setError("");
    const res = await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newTeamName }),
    });
    const data = await res.json();
    if (!res.ok) {
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
    const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json();
    if (!res.ok) {
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
    const ok = window.confirm(`Delete team "${selectedTeam.name}"? This cannot be undone.`);
    if (!ok) return;
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-sm">
          <Users className="w-16 h-16 text-primary mx-auto" />
          <h1 className="text-2xl font-bold">Sign in to manage teams</h1>
          <button onClick={login} className="px-6 py-2.5 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition">
            Log in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/6 bg-card/40 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition text-sm">
              <ArrowLeft className="w-4 h-4" />
              Scanner
            </Link>
            <span className="text-white/20">/</span>
            <span className="text-sm font-semibold">Teams</span>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            New Team
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Your Teams</h2>
            {teams.length === 0 ? (
              <div className="bg-card/50 border border-white/6 rounded-xl p-8 text-center">
                <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No teams yet</p>
              </div>
            ) : (
              teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                    selectedTeam?.id === team.id
                      ? "bg-primary/10 border-primary/30"
                      : "bg-card/50 border-white/6 hover:border-white/12"
                  }`}
                >
                  <p className="text-sm font-semibold">{team.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {team.role === "admin" ? "Owner" : team.role}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {selectedTeam ? (
              <div className="bg-card/50 border border-white/6 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-white/6 flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{selectedTeam.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {members.length} member{members.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedTeam.role === "admin" && (
                      <>
                        <button
                          onClick={() => setShowInvite(true)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          Invite
                        </button>
                        <button
                          onClick={deleteTeam}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="divide-y divide-white/4">
                  {members.map((member) => {
                    const RIcon = ROLE_ICON[member.role] ?? Eye;
                    return (
                      <div key={member.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {member.profileImageUrl ? (
                            <img src={member.profileImageUrl} alt="" className="w-8 h-8 rounded-full" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-muted-foreground">
                              {(member.firstName?.[0] ?? member.email?.[0] ?? "?").toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">
                              {member.firstName ?? ""} {member.lastName ?? ""}
                              {!member.firstName && !member.lastName && (member.email ?? "Unknown")}
                            </p>
                            <p className="text-[11px] text-muted-foreground">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium ${ROLE_COLOR[member.role]}`}>
                            <RIcon className="w-3 h-3" />
                            {member.role}
                          </span>
                          {selectedTeam.role === "admin" && member.userId !== user?.id && (
                            <div className="flex items-center gap-1">
                              <select
                                value={member.role}
                                onChange={(e) => changeRole(member.id, e.target.value)}
                                className="text-[11px] bg-white/5 border border-white/10 rounded px-1.5 py-1 text-muted-foreground"
                              >
                                <option value="admin">admin</option>
                                <option value="editor">editor</option>
                                <option value="viewer">viewer</option>
                              </select>
                              <button
                                onClick={() => removeMember(member.id)}
                                className="p-1 rounded hover:bg-red-500/20 text-red-400/60 hover:text-red-400 transition"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-card/50 border border-white/6 rounded-xl p-12 text-center">
                <Shield className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Select a team to view members</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold">Create Team</h3>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <input
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowCreate(false)} className="px-3 py-2 text-xs text-muted-foreground hover:text-white transition">
                  Cancel
                </button>
                <button
                  onClick={createTeam}
                  disabled={!newTeamName.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showInvite && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowInvite(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold">Invite Member</h3>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <input
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                type="email"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-primary/50"
                autoFocus
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowInvite(false)} className="px-3 py-2 text-xs text-muted-foreground hover:text-white transition">
                  Cancel
                </button>
                <button
                  onClick={inviteMember}
                  disabled={!inviteEmail.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 disabled:opacity-40 transition"
                >
                  Send Invite
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
