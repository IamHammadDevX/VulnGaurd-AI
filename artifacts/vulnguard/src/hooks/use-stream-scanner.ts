import { useState, useCallback, useRef } from "react";
import type { ScanResult, Vulnerability } from "@workspace/api-client-react";
import { useToast } from "./use-toast";

type ScanPhase = "idle" | "streaming" | "done" | "error";

interface StreamState {
  phase: ScanPhase;
  stage: string;
  partialVulns: Vulnerability[];
  result: ScanResult | null;
  errorMessage: string | null;
  foundCount: number;
  riskScore: number | null;
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as Record<string, unknown>).message;
    if (typeof m === "string") return m;
  }
  return "An unexpected error occurred.";
}

/** Parse an SSE text chunk into events */
function parseSSEChunk(chunk: string): Array<{ event: string; data: unknown }> {
  const events: Array<{ event: string; data: unknown }> = [];
  // Each SSE message separated by double newlines
  const messages = chunk.split(/\n\n+/);
  for (const msg of messages) {
    if (!msg.trim()) continue;
    let event = "message";
    let dataStr = "";
    for (const line of msg.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataStr = line.slice(5).trim();
    }
    if (dataStr) {
      try {
        events.push({ event, data: JSON.parse(dataStr) });
      } catch {
        // skip malformed
      }
    }
  }
  return events;
}

export function useStreamScanner() {
  const { toast } = useToast();
  const abortRef = useRef<AbortController | null>(null);

  const [code, setCode] = useState("");
  const [contractName, setContractName] = useState("");

  const [state, setState] = useState<StreamState>({
    phase: "idle",
    stage: "",
    partialVulns: [],
    result: null,
    errorMessage: null,
    foundCount: 0,
    riskScore: null,
  });

  const resetState = () =>
    setState({
      phase: "streaming",
      stage: "Connecting to AI analysis engine...",
      partialVulns: [],
      result: null,
      errorMessage: null,
      foundCount: 0,
      riskScore: null,
    });

  const handleScan = useCallback(async () => {
    if (!code.trim()) {
      toast({ title: "Empty Code", description: "Please paste some Solidity code first.", variant: "destructive" });
      return;
    }

    // Cancel any in-progress scan
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    resetState();

    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/scan-stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, contractName: contractName || null }),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        const errText = await response.text().catch(() => "Unknown error");
        setState((s) => ({ ...s, phase: "error", errorMessage: errText }));
        toast({ title: "Scan Failed", description: errText, variant: "destructive" });
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE messages (separated by double newlines)
        const boundary = buffer.lastIndexOf("\n\n");
        if (boundary === -1) continue;

        const chunk = buffer.slice(0, boundary + 2);
        buffer = buffer.slice(boundary + 2);

        const events = parseSSEChunk(chunk);

        for (const { event, data } of events) {
          if (event === "stage") {
            const d = data as { message: string };
            setState((s) => ({ ...s, stage: d.message }));

          } else if (event === "meta") {
            const d = data as { risk_score: number; total_vulnerabilities: number; contract_name: string };
            setState((s) => ({
              ...s,
              stage: `Found ${d.total_vulnerabilities} vulnerabilities. Risk score: ${d.risk_score}/100`,
              riskScore: d.risk_score,
            }));

          } else if (event === "vulnerability") {
            const vuln = data as Vulnerability;
            setState((s) => ({
              ...s,
              stage: `Discovered: ${vuln.title}`,
              partialVulns: [...s.partialVulns, vuln],
              foundCount: s.foundCount + 1,
            }));

          } else if (event === "complete") {
            const fullResult = data as ScanResult;
            setState((s) => ({
              ...s,
              phase: "done",
              stage: "Analysis complete",
              result: fullResult,
              partialVulns: fullResult.vulnerabilities,
              foundCount: fullResult.total_vulnerabilities,
              riskScore: fullResult.risk_score,
            }));
            toast({
              title: "Scan Complete",
              description: `Found ${fullResult.total_vulnerabilities} vulnerabilities. Risk score: ${fullResult.risk_score}/100`,
              variant: fullResult.total_vulnerabilities > 0 ? "destructive" : "default",
            });

          } else if (event === "error") {
            const d = data as { message: string };
            setState((s) => ({ ...s, phase: "error", errorMessage: d.message }));
            toast({ title: "Scan Failed", description: d.message, variant: "destructive" });
          }
        }
      }
    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      const msg = getErrorMessage(err);
      setState((s) => ({ ...s, phase: "error", errorMessage: msg }));
      toast({ title: "Scan Failed", description: msg, variant: "destructive" });
    }
  }, [code, contractName, toast]);

  const handleDownloadReport = useCallback(async () => {
    if (!state.result) return;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/report/${state.result.scanId}`);
      if (!response.ok) throw new Error("Failed to generate report");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${state.result.contract_name || "vulnguard"}-audit-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ title: "Download Failed", description: "Could not generate PDF report.", variant: "destructive" });
    }
  }, [state.result, toast]);

  const handleGenerateFix = useCallback(async (vulnerability: Vulnerability) => {
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/generate-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vulnerability, contractCode: code }),
      });
      if (!response.ok) throw new Error("Failed to generate fix");
      const data = await response.json() as { fixed_code: string; explanation: string };

      setState((s) => {
        if (!s.result) return s;
        const updatedVulns = s.result.vulnerabilities.map((v) =>
          v.id === vulnerability.id ? { ...v, fixed_code: data.fixed_code } : v
        );
        return {
          ...s,
          partialVulns: updatedVulns,
          result: { ...s.result, vulnerabilities: updatedVulns },
        };
      });

      toast({ title: "Fix Generated", description: "Enhanced fix and explanation have been applied." });
    } catch (err: unknown) {
      toast({ title: "Generation Failed", description: getErrorMessage(err), variant: "destructive" });
    }
  }, [code, toast]);

  return {
    code,
    setCode,
    contractName,
    setContractName,
    // Scanning state
    phase: state.phase,
    stage: state.stage,
    partialVulns: state.partialVulns,
    foundCount: state.foundCount,
    riskScore: state.riskScore,
    result: state.result,
    errorMessage: state.errorMessage,
    isScanning: state.phase === "streaming",
    isGeneratingFix: false,
    // Actions
    handleScan,
    handleDownloadReport,
    handleGenerateFix,
  };
}
