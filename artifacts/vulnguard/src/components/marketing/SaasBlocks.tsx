import { motion } from "framer-motion";
import { ReactNode } from "react";

type Stat = { label: string; value: string };

type Feature = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function StatsStrip({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((item) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5"
        >
          <p className="text-3xl font-black tracking-tight">{item.value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{item.label}</p>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <div className="mb-4 inline-flex rounded-xl border border-border bg-background p-2 text-foreground">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold">{feature.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

export function Panel({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
