import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Download, LoaderCircle, ShieldCheck, ShieldX } from "lucide-react";
import { cn } from "@/lib/utils";

type DynamicIslandProps = {
  phase: "idle" | "streaming" | "done" | "error";
  stage: string;
  foundCount: number;
  riskScore: number | null;
  canDownload?: boolean;
  onDownload?: () => void;
};

export function DynamicIsland({
  phase,
  stage,
  foundCount,
  riskScore,
  canDownload = false,
  onDownload,
}: DynamicIslandProps) {
  const visible = phase !== "idle";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -18, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none fixed left-1/2 top-20 z-[90] w-[min(calc(100vw-1rem),720px)] -translate-x-1/2 sm:top-4 sm:w-[min(92vw,720px)]"
        >
          <div className="pointer-events-auto rounded-[28px] border border-zinc-800/90 bg-zinc-950/85 px-4 py-3 shadow-[0_30px_100px_-50px_rgba(0,0,0,1)] backdrop-blur-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  phase === "streaming" && "border-amber-500/25 bg-amber-500/10 text-amber-300",
                  phase === "done" && (foundCount > 0
                    ? "border-rose-500/25 bg-rose-500/10 text-rose-300"
                    : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"),
                  phase === "error" && "border-rose-500/30 bg-rose-500/12 text-rose-300",
                )}
              >
                {phase === "streaming" && <LoaderCircle className="h-4 w-4 animate-spin" />}
                {phase === "done" && foundCount > 0 && <ShieldX className="h-4 w-4" />}
                {phase === "done" && foundCount === 0 && <ShieldCheck className="h-4 w-4" />}
                {phase === "error" && <AlertTriangle className="h-4 w-4" />}
                {phase === "streaming" ? "Scan in progress" : phase === "done" ? "Scan completed" : "Scan error"}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-zinc-100">{stage}</p>
                <p className="text-xs text-zinc-500">
                  {phase === "done"
                    ? `${foundCount} findings reviewed${riskScore !== null ? ` • risk ${riskScore}/100` : ""}`
                    : phase === "streaming"
                    ? "Live status updates are streaming from the AI scanner."
                    : "The scan request did not complete successfully."}
                </p>
              </div>

              {canDownload && onDownload && phase === "done" && (
                <button
                  type="button"
                  onClick={onDownload}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-all hover:-translate-y-0.5 hover:bg-white/[0.08]"
                >
                  <Download className="h-3.5 w-3.5" />
                  Report
                </button>
              )}

              {phase === "done" && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {foundCount === 0 ? "No automated issues detected" : `${foundCount} findings surfaced`}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
