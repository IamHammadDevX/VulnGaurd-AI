import { Bot, Fingerprint, Radar, ShieldCheck } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel, StatsStrip } from "@/components/marketing/SaasBlocks";

export default function Product() {
  return (
    <MarketingShell
      eyebrow="Product"
      title="An intelligent security platform for modern smart-contract teams"
      subtitle="VulnGuard combines static heuristics and LLM-assisted reasoning to reduce high-risk vulnerabilities before production."
    >
      <StatsStrip
        stats={[
          { label: "Contracts scanned", value: "2M+" },
          { label: "Average detection latency", value: "< 45s" },
          { label: "Enterprise customers", value: "300+" },
        ]}
      />

      <div className="mt-8">
        <FeatureGrid
          features={[
            { title: "Risk Engine", description: "Scores vulnerabilities by exploitability, blast radius, and business impact.", icon: <Radar className="h-5 w-5" /> },
            { title: "Patch Guidance", description: "Generates deterministic fix recommendations and safer code alternatives.", icon: <Bot className="h-5 w-5" /> },
            { title: "Identity Controls", description: "Team-based permissions with audit trails and policy controls.", icon: <Fingerprint className="h-5 w-5" /> },
            { title: "Compliance Ready", description: "Evidence exports aligned to SOC2 and internal governance workflows.", icon: <ShieldCheck className="h-5 w-5" /> },
          ]}
        />
      </div>

      <div className="mt-8">
        <Panel title="Why security leaders choose VulnGuard">
          <p className="text-muted-foreground">
            The platform is designed for engineering velocity without sacrificing trust. Security teams can enforce baselines while developers ship faster with clear, actionable findings.
          </p>
        </Panel>
      </div>
    </MarketingShell>
  );
}
