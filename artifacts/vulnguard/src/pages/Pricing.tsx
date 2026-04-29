import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { CheckCircle2, Shield, Sparkles, Users, Loader } from "lucide-react";
import { useAuth } from "@workspace/replit-auth-web";
import { useSubscription } from "@/hooks/useSubscription";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { Panel } from "@/components/marketing/SaasBlocks";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    desc: "For solo builders validating contract safety.",
    features: ["10 scans/month", "36+ SWC vulnerability detection", "Basic report export", "Community support"],
    planType: null, // Free tier - no payment needed
  },
  {
    name: "Growth",
    price: "$89",
    desc: "For scaling teams that need automated security gates.",
    features: ["1,000 scans/month", "36+ SWC vulnerability detection", "CI pipeline checks", "Priority support", "Team workspaces"],
    planType: "growth",
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For regulated organizations with compliance needs.",
    features: ["Unlimited scans", "36+ SWC vulnerability detection", "SLA + dedicated support", "SSO and advanced RBAC", "Private deployment"],
    planType: "enterprise",
  },
];

export default function Pricing() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { subscription, loading, createCheckout } = useSubscription();
  const [checkingoutPlan, setCheckingoutPlan] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Show success message if coming from checkout
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success" && params.get("plan")) {
      const billingType = params.get("billing") || "monthly";
      setSuccessMessage(`✅ Welcome to ${params.get("plan")} plan (${billingType})!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      // Clean up URL
      window.history.replaceState({}, document.title, "/pricing");
    }
  }, []);

  const handleCheckout = async (planType: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setCheckingoutPlan(planType);
    const checkoutUrl = await createCheckout(planType as "growth" | "enterprise", billingCycle);

    if (checkoutUrl) {
      // Redirect to Lemon Squeezy checkout
      window.location.href = checkoutUrl;
    }
    setCheckingoutPlan(null);
  };

  return (
    <MarketingShell
      eyebrow="Pricing"
      title="Security pricing that scales with your release velocity"
      subtitle="Transparent plans for startups, protocol teams, and enterprise security operations."
    >
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </div>
      )}

      {/* Free Tool Alert Badge */}
      <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-amber-700 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <strong>Currently Free:</strong> Login and use without payment - no payment integration implemented yet
        </div>
      </div>

      <Panel title="Choose your plan" description="Every tier ships with full light and dark theme support, enterprise-grade reliability, and modern reporting.">
        {/* Billing Cycle Toggle */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
              billingCycle === "annual" ? "bg-primary" : "bg-muted"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-background transition-transform ${
                billingCycle === "annual" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${billingCycle === "annual" ? "text-foreground" : "text-muted-foreground"}`}>
            Annual <span className="text-xs text-emerald-600 dark:text-emerald-400">(Save 25%)</span>
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan, idx) => {
            // Calculate prices based on billing cycle
            let displayPrice = plan.price;
            let billingLabel = "/month";

            if (plan.planType === "growth" && billingCycle === "annual") {
              displayPrice = "$799";
              billingLabel = "/year";
            }

            return (
              <div key={plan.name} className={`rounded-2xl border border-border bg-background p-6 ${idx === 1 ? "ring-2 ring-foreground/20" : ""}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {idx === 1 && <span className="rounded-full bg-foreground px-2 py-1 text-xs font-semibold text-background">Popular</span>}
                </div>
                <p className="text-4xl font-black tracking-tight">
                  {displayPrice}
                  <span className="text-sm font-medium text-muted-foreground">{billingLabel}</span>
                </p>

                {/* Show savings badge for annual */}
                {plan.planType === "growth" && billingCycle === "annual" && (
                  <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                    💚 Save $269/year compared to monthly
                  </p>
                )}

                <p className="mt-2 text-sm text-muted-foreground">{plan.desc}</p>
                <ul className="mt-5 space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-foreground" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => {
                    if (plan.planType === null) {
                      // Starter plan - redirect to signup
                      navigate(isAuthenticated ? "/dashboard" : "/signup");
                    } else {
                      // Growth or Enterprise - trigger checkout
                      void handleCheckout(plan.planType);
                    }
                  }}
                  disabled={plan.planType !== null && checkingoutPlan === plan.planType}
                  className="mt-6 w-full rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.02] disabled:scale-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {plan.planType !== null && checkingoutPlan === plan.planType ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : plan.planType === null ? (
                    `Start ${plan.name}`
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>

                {/* Show current plan badge */}
                {subscription && subscription.status === "active" && subscription.plan.toLowerCase().includes(plan.name.toLowerCase()) && (
                  <div className="mt-3 rounded-lg bg-primary/10 px-3 py-1.5 text-center text-xs font-semibold text-primary">
                    ✓ Current Plan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { icon: <Shield className="h-5 w-5" />, text: "Security-backed architecture" },
          { icon: <Users className="h-5 w-5" />, text: "Built for team collaboration" },
          { icon: <Sparkles className="h-5 w-5" />, text: "Continuous AI improvements" },
        ].map((item) => (
          <div key={item.text} className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex rounded-lg border border-border bg-background p-2">{item.icon}</div>
            <p>{item.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Panel
          title="Every Plan Includes 36+ SWC Vulnerability Detection"
          description="Comprehensive coverage across all Smart Contract Weakness categories, available on every pricing tier."
        >
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/2 p-6">
            <p className="text-sm text-muted-foreground mb-4">All VulnGuard plans come equipped with enterprise-grade vulnerability detection covering the full Smart Contract Weakness (SWC) Registry:</p>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">
                  <strong>9 vulnerability categories</strong> - From arithmetic & math to signature & ordering
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">
                  <strong>Context-aware detection</strong> - Recognizes security libraries and safe patterns
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">
                  <strong>Zero false positives</strong> - Eliminates noise by understanding code context
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="text-sm">
                  <strong>Professional reports</strong> - SWC IDs, attack scenarios, and remediation guidance
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      {/* FAQ Section */}
      <div className="mt-12">
        <Panel title="Pricing FAQ" description="Common questions about VulnGuard plans and billing.">
          <div className="space-y-4">
            {[
              {
                q: "Can I upgrade or downgrade my plan anytime?",
                a: "Yes! You can change your plan at any time. Changes take effect immediately on your next billing cycle.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards (Visa, Mastercard, Amex) and digital wallets via Lemon Squeezy.",
              },
              {
                q: "Is there a free trial?",
                a: "Yes! The Starter plan is completely free forever. Try unlimited scanning with our free tier before upgrading.",
              },
              {
                q: "Do you offer annual billing discounts?",
                a: "Contact our sales team for enterprise pricing and annual billing options.",
              },
              {
                q: "What happens after my trial ends?",
                a: "Your account continues on the Starter free plan. You won't be charged unless you explicitly upgrade to a paid tier.",
              },
              {
                q: "Can I cancel my subscription anytime?",
                a: "Absolutely! Cancel anytime from your account settings. No questions asked, no cancellation fees.",
              },
            ].map((faq, idx) => (
              <div key={idx} className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">{faq.q}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
