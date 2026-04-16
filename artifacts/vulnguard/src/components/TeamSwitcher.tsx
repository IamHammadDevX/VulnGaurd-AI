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
        className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0a0a0a] hover:bg-white/10 border border-white/8 text-xs"
      >
        <span className="max-w-[120px] truncate">{active?.name ?? "Team"}</span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-zinc-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 bg-[#0a0a0a] border border-white/5 rounded-xl p-1 z-[100]">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => selectTeam(team.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs hover:bg-[#0a0a0a] ${
                team.id === active?.id ? "bg-white/10 text-white" : "text-zinc-500"
              }`}
            >
              <p className="font-semibold truncate">{team.name}</p>
              <p className="text-[10px] opacity-70">{team.role}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
