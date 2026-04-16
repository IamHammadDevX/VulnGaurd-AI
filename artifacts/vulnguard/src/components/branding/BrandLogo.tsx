import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  textClassName?: string;
  showTagline?: boolean;
  tagline?: string;
};

export function BrandLogo({
  className,
  textClassName,
  showTagline = false,
  tagline = "Smart Contract Security Scanner",
}: BrandLogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 place-items-center rounded-xl border border-sky-300/40 bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 p-[1.5px] shadow-[0_10px_26px_-14px_rgba(2,132,199,0.95)] dark:border-sky-200/25 dark:shadow-[0_12px_30px_-12px_rgba(56,189,248,0.9)]">
        <span className="grid h-full w-full place-items-center rounded-[10px] bg-slate-950 text-white dark:bg-slate-900">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path
              d="M12 2.6L19.2 6V11.7C19.2 15.8 16.5 19.2 12 21.4C7.5 19.2 4.8 15.8 4.8 11.7V6L12 2.6Z"
              stroke="currentColor"
              strokeWidth="1.35"
              strokeOpacity="0.95"
              strokeLinejoin="round"
            />
            <path
              d="M8.45 11.35L10.95 14.5L15.7 8.9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </span>
      <span className={cn("flex flex-col", textClassName)}>
        <span className="font-display text-base font-bold leading-tight tracking-tight">VulnGuard AI</span>
        {showTagline && <span className="text-[10px] leading-tight text-muted-foreground">{tagline}</span>}
      </span>
    </div>
  );
}
