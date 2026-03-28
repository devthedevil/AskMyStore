import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import type { MonthlySales, CategoryRevenue } from "../types";

interface SalesChartProps {
  data: MonthlySales[];
}

interface CategoryChartProps {
  data: CategoryRevenue[];
}

const formatCurrency = (value: number) =>
  `$${value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function RevenueChart({ data }: SalesChartProps) {
  const chartData = data.map((d) => ({
    month: d.month_name.replace(" 20", "\n'"),
    Revenue: d.total_revenue,
    Profit: d.profit,
    Cost: d.total_cost,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue & Profit Trends
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <YAxis
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "#e5e7eb" }}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="Revenue"
            stroke="#4f46e5"
            strokeWidth={3}
            dot={{ fill: "#4f46e5", r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Profit"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Revenue by Category
      </h3>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            tickFormatter={formatCurrency}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            dataKey="category"
            type="category"
            tick={{ fontSize: 12 }}
            width={120}
          />
          <Tooltip
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
            }}
          />
          <Bar
            dataKey="revenue"
            fill="#4f46e5"
            radius={[0, 6, 6, 0]}
            barSize={28}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
