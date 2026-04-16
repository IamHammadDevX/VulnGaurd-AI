import { useEffect } from "react";
import { CheckCircle2, Lock, Shield } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";
import { engagementEvents } from "@/lib/analytics";

export default function Privacy() {
  useEffect(() => {
    engagementEvents.privacyPolicyViewed();
  }, []);

  return (
    <MarketingShell
      eyebrow="Privacy Policy"
      title="Privacy first, by architecture"
      subtitle="VulnGuard protects contract data and account information with strict isolation, encryption, and retention controls."
    >
      <Panel title="What we collect" description="Only the data necessary to operate and secure the service is processed.">
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" />Account profile details such as email and authentication metadata.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" />Submitted smart-contract source and scan configuration payloads.</li>
          <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-foreground" />Operational logs and platform telemetry for reliability and abuse prevention.</li>
        </ul>
      </Panel>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Panel title="Data protection" description="Encryption in transit and at rest with strict access boundaries.">
          <p className="text-sm text-muted-foreground">
            We use TLS for transmission and encrypted storage for persisted data. Access is restricted through role-based controls and audited paths.
          </p>
        </Panel>
        <Panel title="Model and sharing policy" description="Your source code is never sold.">
          <p className="text-sm text-muted-foreground">
            We do not sell your data or train foundation models on your source code without explicit opt-in. Sub-processors are contractually bound to confidentiality.
          </p>
        </Panel>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2 font-medium text-foreground"><Shield className="h-4 w-4" /> Questions about privacy?</p>
        <p className="mt-2">Contact privacy@vulnguard.ai for data requests or policy clarifications.</p>
        <p className="mt-3 inline-flex items-center gap-2 text-foreground"><Lock className="h-4 w-4" /> Last updated: April 16, 2026</p>
      </div>
    </MarketingShell>
  );
}
