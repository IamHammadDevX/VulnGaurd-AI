import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Stat = { label: string; value: string };

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

const cardMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.45 },
};

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {stats.map((item, index) => (
        <motion.div
          key={item.label}
          {...cardMotion}
          transition={{ ...cardMotion.transition, delay: index * 0.04 }}
          whileHover={{ y: -4, scale: 1.01 }}
          className="rounded-[28px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.8),rgba(9,9,11,0.72))] p-6 shadow-[0_30px_90px_-52px_rgba(0,0,0,1)] backdrop-blur-xl"
        >
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">{item.label}</p>
          <p className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-zinc-50">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {features.map((feature, index) => (
        <motion.div
          key={feature.title}
          {...cardMotion}
          transition={{ ...cardMotion.transition, delay: index * 0.05 }}
          whileHover={{ y: -6, scale: 1.01 }}
          className="rounded-[28px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.8),rgba(9,9,11,0.72))] p-6 shadow-[0_30px_90px_-52px_rgba(0,0,0,1)] backdrop-blur-xl"
        >
          <div className="mb-5 inline-flex rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-100">
            {feature.icon}
          </div>
          <h3 className="text-xl font-semibold tracking-tight text-zinc-50">{feature.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      {...cardMotion}
      className={cn(
        "rounded-[32px] border border-zinc-800/80 bg-[linear-gradient(180deg,rgba(24,24,27,0.78),rgba(9,9,11,0.72))] p-6 shadow-[0_32px_100px_-58px_rgba(0,0,0,1)] backdrop-blur-2xl sm:p-8",
        className,
      )}
    >
      <div className="max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">{title}</h2>
        {description && <p className="mt-3 text-base leading-7 text-zinc-400">{description}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </motion.section>
  );
}
