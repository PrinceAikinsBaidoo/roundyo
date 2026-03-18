"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { VaultHistoryItem } from "@/lib/yo";

interface Props {
  history: VaultHistoryItem[];
  decimals: number;
}

export function RoundUpChart({ history, decimals }: Props) {
  if (history.length === 0) return null;

  // Sort oldest → newest
  const sorted = [...history]
    .filter((tx) => tx.type === "deposit")
    .sort((a, b) => a.blockTimestamp - b.blockTimestamp);

  const data = sorted.map((tx) => ({
    date: new Date(tx.blockTimestamp * 1000).toLocaleDateString("en-US", {
      weekday: "short",
    }),
    amount: parseFloat((Number(tx.assets) / 10 ** decimals).toFixed(2)),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Recent Deposits
      </h3>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b7280", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e1e3f",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
                fontSize: 13,
              }}
              labelStyle={{ color: "#9ca3af" }}
              formatter={(value) => [`$${Number(value).toFixed(2)}`, "Deposited"]}
            />
            <Bar
              dataKey="amount"
              fill="#818cf8"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
