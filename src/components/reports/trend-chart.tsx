"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompactCurrency, formatCurrency } from "@/lib/format";

const COLOR_INCOME = "#008300";
const COLOR_EXPENSE = "#e34948";

type TrendPoint = { year: number; month: number; income: number; expense: number };

const SERIES_LABELS: Record<string, string> = {
  income: "Thu",
  expense: "Chi",
};

export function TrendChart({ data }: { data: TrendPoint[] }) {
  const chartData = data.map((d) => ({
    label: `Th${d.month}/${String(d.year).slice(2)}`,
    income: d.income,
    expense: d.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barGap={2} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={{ stroke: "#c3c2b7" }}
          tick={{ fill: "#898781", fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fill: "#898781", fontSize: 12 }}
          tickFormatter={formatCompactCurrency}
          width={56}
        />
        <Tooltip
          formatter={(value) => formatCurrency(Number(value))}
          labelClassName="text-foreground"
          contentStyle={{ borderRadius: 8, border: "1px solid #e1e0d9", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} formatter={(value) => SERIES_LABELS[value] ?? value} />
        <Bar dataKey="income" name="income" fill={COLOR_INCOME} radius={[4, 4, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" name="expense" fill={COLOR_EXPENSE} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
