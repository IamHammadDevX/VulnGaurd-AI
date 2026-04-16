import { Code2, Database, KeyRound, Workflow } from "lucide-react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { FeatureGrid, Panel } from "@/components/marketing/SaasBlocks";

export default function ApiDocs() {
  return (
    <MarketingShell
      eyebrow="Developers"
      title="API documentation built for production teams"
      subtitle="Integrate scan jobs, retrieve findings, and automate remediation workflows through a predictable API surface."
    >
      <FeatureGrid
        features={[
          {
            title: "REST + JSON",
            description: "Predictable endpoints with typed payload contracts generated from OpenAPI specs.",
            icon: <Code2 className="h-5 w-5" />,
          },
          {
            title: "Webhook Events",
            description: "Subscribe to scan completion, failure events, and vulnerability threshold alerts.",
            icon: <Workflow className="h-5 w-5" />,
          },
          {
            title: "Secure Access",
            description: "Scoped API keys with role permissions and key rotation for enterprise compliance.",
            icon: <KeyRound className="h-5 w-5" />,
          },
          {
            title: "Historical Data",
            description: "Query historical findings and trend vulnerability rates across repositories.",
            icon: <Database className="h-5 w-5" />,
          },
        ]}
      />

      <div className="mt-8">
        <Panel title="Quick start" description="Use these core endpoints to launch your first CI-integrated security run.">
          <div className="grid gap-3 text-sm">
            {[
              "POST /api/scans  - Create a new scan request",
              "GET /api/scans/{id}  - Fetch scan status and summary",
              "GET /api/scans/{id}/findings  - Retrieve vulnerability details",
              "POST /api/teams/{id}/keys  - Create scoped API key",
            ].map((line) => (
              <div key={line} className="rounded-xl border border-border bg-background px-4 py-3 font-mono text-muted-foreground">
                {line}
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </MarketingShell>
  );
}
