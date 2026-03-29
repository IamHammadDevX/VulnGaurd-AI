import { useState } from "react";
import { useScanContract, useGenerateFix } from "@workspace/api-client-react";
import type { ScanResult, Vulnerability } from "@workspace/api-client-react/src/generated/api.schemas";
import { useToast } from "./use-toast";

export function useScanner() {
  const [code, setCode] = useState("");
  const [contractName, setContractName] = useState("");
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  
  const { toast } = useToast();
  
  const scanMutation = useScanContract({
    mutation: {
      onSuccess: (data) => {
        setCurrentResult(data);
        toast({
          title: "Scan Complete",
          description: `Found ${data.total_vulnerabilities} vulnerabilities.`,
          variant: data.total_vulnerabilities > 0 ? "destructive" : "default",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Scan Failed",
          description: error?.message || "An error occurred during analysis.",
          variant: "destructive",
        });
      }
    }
  });

  const fixMutation = useGenerateFix({
    mutation: {
      onSuccess: (data, variables) => {
        if (!currentResult) return;
        
        // Update the specific vulnerability with the enhanced fix
        const updatedVulnerabilities = currentResult.vulnerabilities.map(v => {
          if (v.id === variables.data.vulnerability.id) {
            return {
              ...v,
              fixed_code: data.fixed_code,
              description: data.explanation || v.description,
            };
          }
          return v;
        });
        
        setCurrentResult({
          ...currentResult,
          vulnerabilities: updatedVulnerabilities,
        });
        
        toast({
          title: "Fix Generated",
          description: "Enhanced fix and explanation have been generated.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Generation Failed",
          description: error?.message || "Could not generate an enhanced fix.",
          variant: "destructive",
        });
      }
    }
  });

  const handleScan = () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please enter some Solidity code to scan.",
        variant: "destructive",
      });
      return;
    }
    
    // Clear previous results while loading
    setCurrentResult(null);
    scanMutation.mutate({ data: { code, contractName: contractName || null } });
  };

  const handleDownloadReport = async () => {
    if (!currentResult) return;
    try {
      const response = await fetch(`${import.meta.env.BASE_URL}api/report/${currentResult.scanId}`);
      if (!response.ok) throw new Error("Failed to generate report");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentResult.contract_name || 'vulnguard'}-audit-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({
        title: "Download Failed",
        description: "Could not generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateFix = (vulnerability: Vulnerability) => {
    fixMutation.mutate({
      data: {
        vulnerability,
        contractCode: code,
      }
    });
  };

  return {
    code,
    setCode,
    contractName,
    setContractName,
    currentResult,
    isScanning: scanMutation.isPending,
    isGeneratingFix: fixMutation.isPending,
    handleScan,
    handleDownloadReport,
    handleGenerateFix,
  };
}
