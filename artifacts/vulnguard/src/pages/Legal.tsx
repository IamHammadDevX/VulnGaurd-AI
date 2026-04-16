import { FileCheck2, ShieldAlert } from "lucide-react";
import { Link } from "wouter";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";

export default function Legal() {
  return (
    <MarketingShell
      eyebrow="Legal"
      title="Policies and legal framework"
      subtitle="Transparent policies for data handling, service terms, and platform obligations across every plan."
    >
      <Panel title="Core legal pages" description="Review our full policy documents below.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/privacy" className="rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-muted/40">
            <FileCheck2 className="mb-3 h-5 w-5" />
            <h3 className="text-lg font-semibold">Privacy Policy</h3>
            <p className="mt-2 text-sm text-muted-foreground">How we process, secure, and retain your data.</p>
          </Link>
          <Link href="/terms" className="rounded-2xl border border-border bg-background p-6 transition-colors hover:bg-muted/40">
            <ShieldAlert className="mb-3 h-5 w-5" />
            <h3 className="text-lg font-semibold">Terms of Service</h3>
            <p className="mt-2 text-sm text-muted-foreground">Rights, responsibilities, and liability boundaries.</p>
          </Link>
        </div>
      </Panel>
    </MarketingShell>
  );
}
