import { BarChart3, BellRing, GitBranchPlus, Layers2, TimerReset, Workflow, ShieldAlert, Zap, Target, Lightbulb } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel } from "@/components/marketing/SaasBlocks";

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

      <div className="mt-8">
        <Panel
          title="Comprehensive Vulnerability Detection: 36+ SWC Types"
          description="Enterprise-grade scanning covering the full Smart Contract Weakness (SWC) Registry with context-aware detection logic."
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Arithmetic & Math</p>
                    <p className="text-sm text-muted-foreground mt-1">SWC-101: Integer Overflow/Underflow detection with Solidity version awareness</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Access Control (4 types)</p>
                    <p className="text-sm text-muted-foreground mt-1">SWC-105, 106, 115, 118: Unprotected withdrawals, selfdestruct, tx.origin, constructor issues</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Reentrancy & External Calls</p>
                    <p className="text-sm text-muted-foreground mt-1">SWC-107, 104, 113: Call ordering, unchecked returns, DoS in loops</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Randomness & State</p>
                    <p className="text-sm text-muted-foreground mt-1">SWC-120, 116, 117, 119: Weak RNG, timestamp manipulation, state shadowing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 to-primary/2 p-6">
              <h3 className="font-semibold text-foreground mb-4">Full Vulnerability Coverage Across 9 Categories</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">🧮 Arithmetic & Math:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">1 check</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">🔐 Access Control:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">4 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">🔁 Reentrancy:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">1 check</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">📞 External Calls:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">2 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">⛽ Denial of Service:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">2 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">🎲 Randomness & Blockchain:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">3 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">📊 State & Storage:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">4 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span className="text-muted-foreground">⚙️ Code Quality:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">5 checks</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted-foreground">💣 Signature & Ordering:</span>
                  <span className="font-mono text-xs bg-card px-2 py-1 rounded">8 checks</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Context-Aware Detection</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Recognizes security libraries (ReentrancyGuard, SafeERC20)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Solidity 0.8+ overflow protection aware</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Validates surrounding code context</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Eliminates false positives automatically</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <h4 className="font-semibold text-foreground">Professional Reporting</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>SWC Registry official IDs for each finding</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Attack scenarios and impact assessment</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Actionable remediation recommendations</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">✓</span>
                    <span>Risk scoring with severity breakdown</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
