"use client";

import {
  AreaChart,
  Area,
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

export function SavingsChart({ history, decimals }: Props) {
  if (history.length === 0) return null;

  // Sort oldest → newest, then build cumulative savings
  const sorted = [...history]
    .filter((tx) => tx.type === "deposit")
    .sort((a, b) => a.blockTimestamp - b.blockTimestamp);

  let cumulative = 0;
  const data = sorted.map((tx) => {
    const amount = Number(tx.assets) / 10 ** decimals;
    cumulative += amount;
    return {
      date: new Date(tx.blockTimestamp * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      amount: parseFloat(amount.toFixed(2)),
      total: parseFloat(cumulative.toFixed(2)),
    };
  });

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
        Savings Growth
      </h3>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>
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
              formatter={(value, name) => [
                `$${Number(value).toFixed(2)}`,
                name === "total" ? "Total saved" : "Deposit",
              ]}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#818cf8"
              strokeWidth={2}
              fill="url(#savingsGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
