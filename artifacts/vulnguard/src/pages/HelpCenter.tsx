import { CircleHelp, MessageSquare, Search, Wrench } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";

const FAQS = [
  {
    q: "How accurate are vulnerability findings?",
    a: "Detection combines deterministic rules with model-assisted classification. Teams should still perform manual review before deployment.",
  },
  {
    q: "Can we scan private repositories?",
    a: "Yes. Private source is supported through secure API ingestion and role-scoped project access controls.",
  },
  {
    q: "Do you provide report exports?",
    a: "Yes. You can export findings as JSON and PDF for compliance and stakeholder reporting.",
  },
];

export default function HelpCenter() {
  return (
    <MarketingShell
      eyebrow="Help Center"
      title="Answers and support resources for your security workflow"
      subtitle="Find quick answers, integration guides, and escalation channels in one unified support experience."
    >
      <Panel title="Search support resources">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search guides, API setup, and incident responses"
            className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </Panel>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[{ icon: <CircleHelp className="h-5 w-5" />, title: "FAQ" }, { icon: <Wrench className="h-5 w-5" />, title: "Troubleshooting" }, { icon: <MessageSquare className="h-5 w-5" />, title: "Contact support" }].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 inline-flex rounded-lg border border-border bg-background p-2">{item.icon}</div>
            <h3 className="font-semibold">{item.title}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-5 space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-border bg-background p-4">
              <h3 className="font-semibold">{faq.q}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}
