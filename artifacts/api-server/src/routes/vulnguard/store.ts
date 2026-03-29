import { randomUUID } from "crypto";

export interface StoredScan {
  scanId: string;
  success: boolean;
  contract_name: string;
  total_vulnerabilities: number;
  risk_score: number;
  vulnerabilities: unknown[];
  summary: string;
  analysis_time_ms: number;
  timestamp: string;
}

const scanStore = new Map<string, StoredScan>();

export function storeScan(data: Omit<StoredScan, "scanId">): string {
  const scanId = randomUUID();
  scanStore.set(scanId, { ...data, scanId });
  return scanId;
}

export function getScan(scanId: string): StoredScan | undefined {
  return scanStore.get(scanId);
}
