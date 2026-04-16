import { useEffect, useState } from "react";
import { LifeBuoy, MessageSquare, Search, ShieldAlert, Sparkles } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";
import { engagementEvents } from "@/lib/analytics";

const FAQS = [
  {
    q: "How accurate is the AI Scanner?",
    a: "The engine combines deterministic rules with model-based reasoning to catch high-risk patterns quickly. Teams should still keep manual review before production deploys.",
  },
  {
    q: "Can we download audit-ready reports?",
    a: "Yes. Findings can be exported as PDF and structured JSON for compliance records and internal workflows.",
  },
  {
    q: "Does VulnGuard support team collaboration?",
    a: "Yes. Role-based access controls, team workspaces, and shared scan history are included in team plans.",
  },
];

export default function Support() {
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    engagementEvents.documentationViewed("support_page");
  }, []);

  return (
    <MarketingShell
      eyebrow="Support"
      title="Get expert support without slowing down delivery"
      subtitle="Find docs, troubleshooting flows, and direct contact options through one consistent SaaS support experience."
    >
      <Panel title="Search resources">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search docs, troubleshooting, and account help"
            className="w-full rounded-full border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20"
          />
        </div>
      </Panel>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: <LifeBuoy className="h-5 w-5" />, title: "Incident support", text: "Escalate critical issues with priority response routing." },
          { icon: <ShieldAlert className="h-5 w-5" />, title: "Security guidance", text: "Understand severity and remediation strategy quickly." },
          { icon: <MessageSquare className="h-5 w-5" />, title: "Team onboarding", text: "Roll out VulnGuard workflows for engineering squads." },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 inline-flex rounded-lg border border-border bg-background p-2">{item.icon}</div>
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-5 space-y-3">
          {FAQS.map((faq, index) => (
            <button
              key={faq.q}
              type="button"
              onClick={() => {
                setOpen((value) => (value === index ? null : index));
                engagementEvents.faqViewed(faq.q);
              }}
              className="w-full rounded-xl border border-border bg-background p-4 text-left"
            >
              <p className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4" />
                {faq.q}
              </p>
              {open === index && <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>}
            </button>
          ))}
        </div>
      </div>
    </MarketingShell>
  );
}