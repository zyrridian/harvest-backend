"use client";

import { useEffect, useState } from "react";
import {
  Users,
  DollarSign,
  ShoppingCart,
  Package,
  Sprout,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentLight: "#dcfce7",
  border: "#E4E4E7",
  success: "#16a34a",
  warning: "#ea580c",
  error: "#dc2626",
};

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
        <div className="text-base" style={{ color: colors.body }}>
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-4 border flex items-center gap-3"
        style={{
          backgroundColor: "#fef2f2",
          borderColor: colors.error,
          borderRadius: "4px",
        }}
      >
        <AlertCircle size={18} style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error}</p>
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

  const statCards = [
    {
      title: "Total Users",
      value: stats.overview.users.total.toLocaleString(),
      icon: Users,
      growth: stats.overview.users.growth_percentage,
      subtext: `${stats.overview.users.new_today} new today`,
    },
    {
      title: "Total Revenue",
      value: formatCurrency(stats.overview.revenue.total),
      icon: DollarSign,
      growth: stats.overview.revenue.growth_percentage,
      subtext: `${formatCurrency(stats.overview.revenue.this_month)} this month`,
    },
    {
      title: "Total Orders",
      value: stats.overview.orders.total.toLocaleString(),
      icon: ShoppingCart,
      pending: stats.overview.orders.pending,
      subtext: `${stats.overview.orders.today} today`,
    },
    {
      title: "Products",
      value: stats.overview.products.total.toLocaleString(),
      icon: Package,
      active: stats.overview.products.active,
      subtext: `${stats.overview.products.active} active`,
    },
    {
      title: "Farmers",
      value: stats.overview.farmers.total.toLocaleString(),
      icon: Sprout,
      verified: stats.overview.farmers.verified,
      subtext: `${stats.overview.farmers.verified} verified`,
    },
    {
      title: "Community",
      value: stats.overview.community.posts.toLocaleString(),
      icon: MessageSquare,
      subtext: `${stats.overview.community.reviews} reviews`,
    },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { bg: "#fef3c7", color: "#92400e" };
      case "PROCESSING":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "SHIPPED":
        return { bg: "#f3e8ff", color: "#6b21a8" };
      case "DELIVERED":
        return { bg: "#dcfce7", color: "#166534" };
      case "CANCELLED":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f3f4f6", color: "#374151" };
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.heading }}
        >
          Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Overview of your platform performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="border p-6"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3
                  className="text-sm font-medium"
                  style={{ color: colors.body }}
                >
                  {card.title}
                </h3>
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: colors.accent }}
                />
              </div>
              <div className="space-y-2">
                <p
                  className="text-2xl font-bold"
                  style={{ color: colors.heading }}
                >
                  {card.value}
                </p>
                {card.growth !== undefined && (
                  <div className="flex items-center gap-2">
                    {card.growth >= 0 ? (
                      <TrendingUp size={14} style={{ color: colors.success }} />
                    ) : (
                      <TrendingDown size={14} style={{ color: colors.error }} />
                    )}
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: card.growth >= 0 ? colors.success : colors.error,
                      }}
                    >
                      {Math.abs(card.growth).toFixed(1)}%
                    </span>
                    <span className="text-sm" style={{ color: colors.body }}>
                      vs last month
                    </span>
                  </div>
                )}
                {card.pending !== undefined && (
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.warning }}
                    >
                      {card.pending} pending
                    </span>
                  </div>
                )}
                <p
                  className="text-sm pt-2 border-t"
                  style={{ borderColor: colors.border, color: colors.body }}
                >
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div
          className="border p-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3
            className="text-base font-bold mb-4"
            style={{ color: colors.heading }}
          >
            Recent Orders
          </h3>
          <div className="space-y-3">
            {stats.recent_orders.length === 0 ? (
              <p className="text-center py-4" style={{ color: colors.body }}>
                No recent orders
              </p>
            ) : (
              stats.recent_orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <div className="flex-1">
                      <p
                        className="font-medium text-sm"
                        style={{ color: colors.heading }}
                      >
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs" style={{ color: colors.body }}>
                        {order.buyer?.name || "Unknown"}
                      </p>
                      <p className="text-xs" style={{ color: colors.body }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className="font-bold text-sm"
                        style={{ color: colors.heading }}
                      >
                        {formatCurrency(order.total_price)}
                      </p>
                      <span
                        className="text-xs px-2 py-1 inline-block mt-1"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: "4px",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div
          className="border p-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3
            className="text-base font-bold mb-4"
            style={{ color: colors.heading }}
          >
            Top Products
          </h3>
          <div className="space-y-3">
            {stats.top_products.length === 0 ? (
              <p className="text-center py-4" style={{ color: colors.body }}>
                No products yet
              </p>
            ) : (
              stats.top_products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <div
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <Package
                      size={18}
                      strokeWidth={1.5}
                      style={{ color: colors.accent }}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className="font-medium text-sm"
                      style={{ color: colors.heading }}
                    >
                      {product.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.body }}>
                      Rating: {product.rating?.toFixed(1) || "0.0"} |{" "}
                      {product.review_count || 0} reviews
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="font-bold text-sm"
                      style={{ color: colors.heading }}
                    >
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
      <div
        className="border p-6"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        <h3
          className="text-base font-bold mb-4"
          style={{ color: colors.heading }}
        >
          Orders by Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(stats.orders_by_status || {}).map(
            ([status, count]) => {
              const statusStyle = getStatusStyle(status);
              return (
                <div
                  key={status}
                  className="text-center p-4 border"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <p
                    className="text-xl font-bold"
                    style={{ color: colors.heading }}
                  >
                    {count}
                  </p>
                  <p
                    className="text-xs mt-1 px-2 py-1 inline-block"
                    style={{
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: "4px",
                    }}
                  >
                    {status}
                  </p>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}
