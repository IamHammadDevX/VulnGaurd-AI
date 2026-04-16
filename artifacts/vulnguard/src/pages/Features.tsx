import { BarChart3, BellRing, GitBranchPlus, Layers2, TimerReset, Workflow } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid } from "@/components/marketing/SaasBlocks";

export default function Features() {
  return (
    <MarketingShell
      eyebrow="Features"
      title="Everything needed to run security as a product discipline"
      subtitle="From pull request checks to executive reporting, every feature follows one visual system and full light/dark parity."
    >
      <FeatureGrid
        features={[
          { title: "PR Security Gates", description: "Automatic scan checks in pull requests with clear pass/fail policy signals.", icon: <GitBranchPlus className="h-5 w-5" /> },
          { title: "Risk Prioritization", description: "Rank findings by business-critical impact and exploit probability.", icon: <BarChart3 className="h-5 w-5" /> },
          { title: "Alerting", description: "Notify teams in real time when critical vulnerabilities appear.", icon: <BellRing className="h-5 w-5" /> },
          { title: "Workflow Automation", description: "Route findings directly into your engineering backlog.", icon: <Workflow className="h-5 w-5" /> },
          { title: "Historical Trends", description: "Track mean-time-to-fix and monitor posture improvements over time.", icon: <TimerReset className="h-5 w-5" /> },
          { title: "Team Workspaces", description: "Separate projects by environment with role-based access controls.", icon: <Layers2 className="h-5 w-5" /> },
        ]}
      />
    </MarketingShell>
  );
}
