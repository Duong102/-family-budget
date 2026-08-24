"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/format";

const CATEGORICAL_COLORS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#4a3aa7", // violet
];
const OTHER_COLOR = "#898781";

type Slice = { name: string; amount: number };

export function CategoryPieChart({ data }: { data: Slice[] }) {
  const sorted = [...data].sort((a, b) => b.amount - a.amount);
  const top = sorted.slice(0, CATEGORICAL_COLORS.length);
  const rest = sorted.slice(CATEGORICAL_COLORS.length);
  const restTotal = rest.reduce((sum, s) => sum + s.amount, 0);
  const chartData = restTotal > 0 ? [...top, { name: "Khác", amount: restTotal }] : top;

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground">Chưa có dữ liệu chi tiêu.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          stroke="#fcfcfb"
          strokeWidth={2}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={entry.name}
              fill={entry.name === "Khác" ? OTHER_COLOR : CATEGORICAL_COLORS[index]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
