"use client";

import { useEffect, useState } from "react";

interface DashboardStats {
  overview: {
    users: {
      total: number;
      new_today: number;
      new_this_month: number;
      growth_percentage: number;
    };
    products: { total: number; active: number; inactive: number };
    orders: {
      total: number;
      today: number;
      this_month: number;
      pending: number;
    };
    revenue: {
      total: number;
      this_month: number;
      last_month: number;
      growth_percentage: number;
    };
    farmers: { total: number; verified: number; unverified: number };
    community: { posts: number; reviews: number };
  };
  recent_orders: any[];
  top_products: any[];
  orders_by_status: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch dashboard data");
      }

      setStats(data.data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your platform performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Users Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
            <span className="text-2xl">👥</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.overview.users.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  stats.overview.users.growth_percentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.overview.users.growth_percentage >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(stats.overview.users.growth_percentage).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                New today:{" "}
                <span className="font-medium">
                  {stats.overview.users.new_today}
                </span>
              </p>
              <p>
                New this month:{" "}
                <span className="font-medium">
                  {stats.overview.users.new_this_month}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Revenue Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
            <span className="text-2xl">💰</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(stats.overview.revenue.total)}
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium ${
                  stats.overview.revenue.growth_percentage >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stats.overview.revenue.growth_percentage >= 0 ? "↑" : "↓"}{" "}
                {Math.abs(stats.overview.revenue.growth_percentage).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                This month:{" "}
                <span className="font-medium">
                  {formatCurrency(stats.overview.revenue.this_month)}
                </span>
              </p>
              <p>
                Last month:{" "}
                <span className="font-medium">
                  {formatCurrency(stats.overview.revenue.last_month)}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Orders Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <span className="text-2xl">📦</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.overview.orders.total.toLocaleString()}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-orange-600">
                {stats.overview.orders.pending} pending
              </span>
            </div>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                Today:{" "}
                <span className="font-medium">
                  {stats.overview.orders.today}
                </span>
              </p>
              <p>
                This month:{" "}
                <span className="font-medium">
                  {stats.overview.orders.this_month}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Products Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Products</h3>
            <span className="text-2xl">🛍️</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.overview.products.total.toLocaleString()}
            </p>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                Active:{" "}
                <span className="font-medium text-green-600">
                  {stats.overview.products.active}
                </span>
              </p>
              <p>
                Inactive:{" "}
                <span className="font-medium text-gray-500">
                  {stats.overview.products.inactive}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Farmers Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Farmers</h3>
            <span className="text-2xl">🌾</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.overview.farmers.total.toLocaleString()}
            </p>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                Verified:{" "}
                <span className="font-medium text-green-600">
                  {stats.overview.farmers.verified}
                </span>
              </p>
              <p>
                Unverified:{" "}
                <span className="font-medium text-orange-600">
                  {stats.overview.farmers.unverified}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Community Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Community</h3>
            <span className="text-2xl">💬</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {stats.overview.community.posts.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">Posts</p>
            <div className="pt-3 border-t border-gray-100 text-sm text-gray-600">
              <p>
                Reviews:{" "}
                <span className="font-medium">
                  {stats.overview.community.reviews}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-3">
            {stats.recent_orders.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            ) : (
              stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Order #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.buyer?.name || "Unknown"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.total_price)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        order.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-700"
                          : order.status === "SHIPPED"
                          ? "bg-purple-100 text-purple-700"
                          : order.status === "DELIVERED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products
          </h3>
          <div className="space-y-3">
            {stats.top_products.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No products yet</p>
            ) : (
              stats.top_products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-2xl">
                    🥬
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>⭐ {product.rating?.toFixed(1) || "0.0"}</span>
                      <span>•</span>
                      <span>{product.review_count || 0} reviews</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Orders by Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Orders by Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.orders_by_status || {}).map(([status, count]) => (
            <div
              key={status}
              className="text-center p-4 bg-gray-50 rounded-lg"
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <p className="text-sm text-gray-600 mt-1">{status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
