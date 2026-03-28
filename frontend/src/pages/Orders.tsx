import { useEffect, useState } from "react";
import { Filter, Star, AlertTriangle } from "lucide-react";
import { getOrders, getProductReviews } from "../services/api";
import type { Order, Review } from "../types";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  // Map of order_id → reviews for that order's products
  const [reviewMap, setReviewMap] = useState<Record<number, Review[]>>({});
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders(200)
      .then(async (data) => {
        setOrders(data);
        // Fetch reviews for every unique product across all orders
        const productIds = [...new Set(data.flatMap((o) => o.items.map((i) => i.product_id)))];
        const allReviews = (
          await Promise.all(productIds.map((pid) => getProductReviews(pid).catch(() => [])))
        ).flat();
        // Group by order_id
        const map: Record<number, Review[]> = {};
        for (const r of allReviews) {
          if (!map[r.order_id]) map[r.order_id] = [];
          map[r.order_id].push(r);
        }
        setReviewMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const statuses = ["all", "completed", "processing", "shipped", "cancelled"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">
          {filtered.length} orders{filter !== "all" ? ` (${filter})` : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-gray-400" />
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              filter === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Date
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-gray-500 font-medium">
                  Items
                </th>
                <th className="text-right py-3 px-4 text-gray-500 font-medium">
                  Total
                </th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">
                  Status
                </th>
                <th className="text-center py-3 px-4 text-gray-500 font-medium">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-indigo-600">
                    #{order.id}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {order.customer_name}
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    <div className="max-w-xs">
                      {order.items.map((item, i) => (
                        <span key={i} className="text-xs">
                          {item.product_name} x{item.quantity}
                          {i < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        statusColors[order.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {(() => {
                      const revs = reviewMap[order.id] ?? [];
                      const returns = revs.filter((r) => r.has_return_request);
                      if (revs.length === 0) return <span className="text-xs text-gray-300">—</span>;
                      const avgRating = revs.reduce((s, r) => s + r.rating, 0) / revs.length;
                      return (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {avgRating.toFixed(1)}
                            <span className="text-gray-400">({revs.length})</span>
                          </span>
                          {returns.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              {returns.length} return{returns.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            No orders found.
          </div>
        )}
      </div>
    </div>
  );
}
