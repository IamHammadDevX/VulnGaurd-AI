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
    <div className={cn("flex items-center gap-3", className)}>
      <span className="grid h-10 w-10 place-items-center rounded-2xl border border-emerald-500/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(244,114,182,0.08),rgba(9,9,11,0.96))] p-[1px] shadow-[0_18px_44px_-28px_rgba(16,185,129,0.9)]">
        <span className="app-logo-core app-shell-heading grid h-full w-full place-items-center rounded-[15px]">
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
        <span className="app-shell-heading font-display text-[15px] font-semibold leading-tight tracking-[0.02em]">VulnGuard AI</span>
        {showTagline && <span className="app-shell-muted text-[10px] leading-tight">{tagline}</span>}
      </span>
    </div>
  );
}
