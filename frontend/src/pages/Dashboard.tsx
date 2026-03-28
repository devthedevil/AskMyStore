import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Package,
  BarChart3,
} from "lucide-react";
import KPICard from "../components/KPICard";
import { RevenueChart, CategoryChart } from "../components/SalesChart";
import { getDashboard } from "../services/api";
import type { DashboardSummary } from "../types";

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-500">
        Failed to load dashboard data. Make sure the backend is running.
      </div>
    );
  }

  const formatCurrency = (n: number) =>
    "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          E-commerce performance overview (Apr 2025 - Mar 2026)
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(data.total_revenue)}
          subtitle={`${data.completed_orders} completed orders`}
          icon={DollarSign}
          color="indigo"
        />
        <KPICard
          title="Total Profit"
          value={formatCurrency(data.total_profit)}
          subtitle={`${((data.total_profit / data.total_revenue) * 100).toFixed(1)}% margin`}
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Total Orders"
          value={data.total_orders.toString()}
          subtitle={`${data.cancelled_orders} cancelled`}
          icon={ShoppingCart}
          color="amber"
        />
        <KPICard
          title="Avg Order Value"
          value={formatCurrency(data.avg_order_value)}
          subtitle={`${data.total_customers} customers`}
          icon={BarChart3}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueChart data={data.monthly_sales} />
        <CategoryChart data={data.category_revenue} />
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-600" />
          Top Products by Revenue
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Product
                </th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">
                  Revenue
                </th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">
                  Units Sold
                </th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">
                  Profit
                </th>
              </tr>
            </thead>
            <tbody>
              {data.top_products.map((product, i) => (
                <tr
                  key={product.product_id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span className="font-medium text-gray-900">
                        {product.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatCurrency(product.revenue)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {product.quantity_sold}
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                    {formatCurrency(product.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
