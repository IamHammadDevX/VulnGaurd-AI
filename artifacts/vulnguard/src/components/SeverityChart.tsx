import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import type { Vulnerability } from "@workspace/api-client-react";

interface SeverityChartProps {
  vulnerabilities: Vulnerability[];
}

export function SeverityChart({ vulnerabilities }: SeverityChartProps) {
  const data = useMemo(() => {
    const counts = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };

    vulnerabilities.forEach(v => {
      counts[v.severity]++;
    });

    return [
      { name: 'Critical', value: counts.CRITICAL, color: 'hsl(0 84% 60%)' },
      { name: 'High', value: counts.HIGH, color: 'hsl(28 90% 55%)' },
      { name: 'Medium', value: counts.MEDIUM, color: 'hsl(45 93% 47%)' },
      { name: 'Low', value: counts.LOW, color: 'hsl(142 71% 45%)' },
    ].filter(item => item.value > 0);
  }, [vulnerabilities]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 border border-dashed border-white/5 rounded-xl">
        No vulnerabilities found
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip 
            contentStyle={{ 
              backgroundColor: '#000000', 
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '0.75rem',
              color: '#d4d4d8', 
              fontSize: '0.875rem'
            }}
            itemStyle={{ color: '#fff' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
