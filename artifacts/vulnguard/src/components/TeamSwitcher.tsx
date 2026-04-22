import { useEffect, useState } from "react";
import { ChevronsUpDown } from "lucide-react";

interface Team {
  id: string;
  name: string;
  role: string;
}

const STORAGE_KEY = "vulnguard.activeTeamId";

export function TeamSwitcher() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTeamId, setActiveTeamId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/teams", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { teams: [] }))
      .then((data) => {
        const nextTeams = (data.teams ?? []) as Team[];
        setTeams(nextTeams);

        const saved = localStorage.getItem(STORAGE_KEY);
        const first = nextTeams[0]?.id ?? "";
        const selected = nextTeams.some((t) => t.id === saved) ? saved : first;

        if (selected) {
          setActiveTeamId(selected);
          localStorage.setItem(STORAGE_KEY, selected);
          window.dispatchEvent(new CustomEvent("vulnguard:team-changed", { detail: { teamId: selected } }));
        }
      })
      .catch(() => {
        setTeams([]);
      });
  }, []);

  if (teams.length === 0) return null;

  const active = teams.find((team) => team.id === activeTeamId) ?? teams[0];

  const selectTeam = (teamId: string) => {
    setActiveTeamId(teamId);
    localStorage.setItem(STORAGE_KEY, teamId);
    window.dispatchEvent(new CustomEvent("vulnguard:team-changed", { detail: { teamId } }));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-zinc-800 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-zinc-300 shadow-[0_16px_36px_-28px_rgba(0,0,0,1)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/[0.07]"
      >
        <span className="max-w-[120px] truncate">{active?.name ?? "Team"}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-500" />
      </button>

      {open && (
        <div className="absolute right-0 z-[100] mt-2 w-56 rounded-3xl border border-zinc-800/90 bg-zinc-950/96 p-2 shadow-[0_30px_90px_-44px_rgba(0,0,0,1)] backdrop-blur-xl">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => selectTeam(team.id)}
              className={`w-full rounded-2xl px-3 py-2.5 text-left text-xs transition-colors ${
                team.id === active?.id ? "bg-emerald-500/10 text-emerald-300" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-100"
              }`}
            >
              <p className="truncate font-semibold">{team.name}</p>
              <p className="text-[10px] opacity-70">{team.role}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
