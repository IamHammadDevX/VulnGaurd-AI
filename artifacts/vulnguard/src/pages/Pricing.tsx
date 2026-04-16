import { CheckCircle2, Shield, Sparkles, Users } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    desc: "For solo builders validating contract safety.",
    features: ["10 scans/month", "Basic report export", "Community support"],
  },
  {
    name: "Growth",
    price: "$89",
    desc: "For scaling teams that need automated security gates.",
    features: ["1,000 scans/month", "CI pipeline checks", "Priority support", "Team workspaces"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For regulated organizations with compliance needs.",
    features: ["Unlimited scans", "SLA + dedicated support", "SSO and advanced RBAC", "Private deployment"],
  },
];

export default function Pricing() {
  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Security pricing that scales with your release velocity"
      subtitle="Transparent plans for startups, protocol teams, and enterprise security operations."
    >
      <Panel title="Choose your plan" description="Every tier ships with full light and dark theme support, enterprise-grade reliability, and modern reporting.">
        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, idx) => (
            <div key={plan.name} className={`rounded-2xl border border-border bg-background p-6 ${idx === 1 ? "ring-2 ring-foreground/20" : ""}`}>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {idx === 1 && <span className="rounded-full bg-foreground px-2 py-1 text-xs font-semibold text-background">Popular</span>}
              </div>
              <p className="text-4xl font-black tracking-tight">{plan.price}<span className="text-sm font-medium text-muted-foreground">/month</span></p>
              <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-foreground" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button type="button" className="mt-6 w-full rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.02]">
                Start {plan.name}
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[{ icon: <Shield className="h-5 w-5" />, text: "Security-backed architecture" }, { icon: <Users className="h-5 w-5" />, text: "Built for team collaboration" }, { icon: <Sparkles className="h-5 w-5" />, text: "Continuous AI improvements" }].map((item) => (
          <div key={item.text} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex rounded-lg border border-border bg-background p-2">{item.icon}</div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
    </MarketingShell>
  );
}
