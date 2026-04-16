import { useEffect } from "react";
import { Scale, ShieldAlert } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";
import { engagementEvents } from "@/lib/analytics";

export default function Terms() {
  useEffect(() => {
    engagementEvents.termsViewed();
  }, []);

  return (
    <MarketingShell
      eyebrow="Terms of Service"
      title="Clear terms for teams building serious products"
      subtitle="These terms define service boundaries, responsibilities, and liability for use of VulnGuard security tooling."
    >
      <div className="space-y-6">
        <Panel title="1. Acceptance and account usage">
          <p className="text-sm text-muted-foreground">
            By creating an account or using the service, you agree to these terms and all published policies. You are responsible for maintaining account security and lawful usage.
          </p>
        </Panel>

        <Panel title="2. Security analysis limitations">
          <p className="text-sm text-muted-foreground">
            Automated findings are decision support, not legal or absolute guarantees. You remain responsible for final code validation and deployment risk decisions.
          </p>
        </Panel>

        <Panel title="3. Ownership and data rights">
          <p className="text-sm text-muted-foreground">
            You retain ownership of submitted source code. VulnGuard receives limited processing rights only to deliver the service and associated reports.
          </p>
        </Panel>

        <Panel title="4. Liability boundaries">
          <p className="text-sm text-muted-foreground">
            To the maximum extent permitted by law, VulnGuard is not liable for indirect, incidental, or consequential damages arising from service use.
          </p>
        </Panel>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p className="inline-flex items-center gap-2 font-medium text-foreground"><Scale className="h-4 w-4" /> Effective date: April 16, 2026</p>
        <p className="mt-2 inline-flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Contact legal@vulnguard.ai for formal legal inquiries.</p>
      </div>
    </MarketingShell>
  );
}
