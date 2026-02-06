"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Plus,
  ArrowRight,
  AlertCircle,
  Clock,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  errorBg: "#fee2e2",
  warning: "#ca8a04",
  warningBg: "#fef9c3",
};

interface DashboardStats {
  profile: {
    id: string;
    name: string;
    profile_image?: string;
    is_verified: boolean;
    rating: number;
    total_reviews: number;
  };
  products: {
    total: number;
    active: number;
    out_of_stock: number;
    inactive: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    today: number;
  };
  revenue: {
    this_month: number;
    last_month: number;
    change_percentage: number;
    currency: string;
  };
  engagement: {
    total_views: number;
    followers: number;
  };
  recent_orders: Array<{
    id: string;
    order_number: string;
    status: string;
    total_amount: number;
    buyer_name: string;
    buyer_avatar?: string;
    first_item?: {
      name: string;
      image?: string;
    };
    items_count: number;
    created_at: string;
  }>;
  top_products: Array<{
    product_id: string;
    product_name: string;
    product_image?: string;
    price: number;
    total_sold: number;
    order_count: number;
  }>;
}

export default function FarmerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/farmer/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch stats");
      }

      setStats(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string }> = {
      pending: { bg: colors.warningBg, color: colors.warning },
      pending_payment: { bg: colors.warningBg, color: colors.warning },
      confirmed: { bg: "#dbeafe", color: "#2563eb" },
      processing: { bg: "#e0e7ff", color: "#4f46e5" },
      shipped: { bg: "#cffafe", color: "#0891b2" },
      delivered: { bg: colors.successBg, color: colors.success },
      completed: { bg: colors.successBg, color: colors.success },
      cancelled: { bg: colors.errorBg, color: colors.error },
    };
    return styles[status] || { bg: colors.border, color: colors.body };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.accent,
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: colors.body }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 border flex items-center gap-3"
        style={{
          backgroundColor: colors.errorBg,
          borderColor: colors.error,
          borderRadius: "4px",
        }}
      >
        <AlertCircle size={20} style={{ color: colors.error }} />
        <p style={{ color: colors.error }}>{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Dashboard
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Welcome back, {stats.profile.name}
          </p>
        </div>
        <Link
          href="/farmer/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.accent,
            color: colors.white,
            borderRadius: "4px",
          }}
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <div
          className="p-4 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: colors.body }}>
              Revenue (This Month)
            </p>
            {stats.revenue.change_percentage >= 0 ? (
              <TrendingUp size={16} style={{ color: colors.success }} />
            ) : (
              <TrendingDown size={16} style={{ color: colors.error }} />
            )}
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.heading }}>
            {formatCurrency(stats.revenue.this_month)}
          </p>
          <p
            className="text-xs mt-1"
            style={{
              color:
                stats.revenue.change_percentage >= 0
                  ? colors.success
                  : colors.error,
            }}
          >
            {stats.revenue.change_percentage >= 0 ? "+" : ""}
            {stats.revenue.change_percentage}% from last month
          </p>
        </div>

        {/* Orders Card */}
        <div
          className="p-4 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: colors.body }}>
              Orders
            </p>
            <ShoppingCart size={16} style={{ color: colors.accent }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.heading }}>
            {stats.orders.total}
          </p>
          <p className="text-xs mt-1" style={{ color: colors.body }}>
            {stats.orders.pending} pending | {stats.orders.today} today
          </p>
        </div>

        {/* Products Card */}
        <div
          className="p-4 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: colors.body }}>
              Products
            </p>
            <Package size={16} style={{ color: colors.accent }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.heading }}>
            {stats.products.total}
          </p>
          <p className="text-xs mt-1" style={{ color: colors.body }}>
            {stats.products.active} active | {stats.products.out_of_stock} out
            of stock
          </p>
        </div>

        {/* Views Card */}
        <div
          className="p-4 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm" style={{ color: colors.body }}>
              Engagement
            </p>
            <Eye size={16} style={{ color: colors.accent }} />
          </div>
          <p className="text-2xl font-bold" style={{ color: colors.heading }}>
            {stats.engagement.total_views}
          </p>
          <p className="text-xs mt-1" style={{ color: colors.body }}>
            {stats.engagement.followers} followers
          </p>
        </div>
      </div>

      {/* Alert Cards */}
      {stats.orders.pending > 0 && (
        <div
          className="p-4 border flex items-center justify-between"
          style={{
            backgroundColor: colors.warningBg,
            borderColor: colors.warning,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center gap-3">
            <Clock size={20} style={{ color: colors.warning }} />
            <div>
              <p className="font-medium" style={{ color: colors.heading }}>
                {stats.orders.pending} pending order(s) need attention
              </p>
              <p className="text-sm" style={{ color: colors.body }}>
                Review and confirm orders to keep customers happy
              </p>
            </div>
          </div>
          <Link
            href="/farmer/orders?status=pending"
            className="px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: colors.warning,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            View Orders
          </Link>
        </div>
      )}

      {stats.products.out_of_stock > 0 && (
        <div
          className="p-4 border flex items-center justify-between"
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={20} style={{ color: colors.error }} />
            <div>
              <p className="font-medium" style={{ color: colors.heading }}>
                {stats.products.out_of_stock} product(s) out of stock
              </p>
              <p className="text-sm" style={{ color: colors.body }}>
                Update inventory to avoid missing sales
              </p>
            </div>
          </div>
          <Link
            href="/farmer/products?status=out_of_stock"
            className="px-4 py-2 text-sm font-medium"
            style={{
              backgroundColor: colors.error,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            View Products
          </Link>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: colors.border }}
          >
            <h2 className="font-semibold" style={{ color: colors.heading }}>
              Recent Orders
            </h2>
            <Link
              href="/farmer/orders"
              className="text-sm flex items-center gap-1"
              style={{ color: colors.accent }}
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {stats.recent_orders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: colors.border }}
                />
                <p className="font-medium" style={{ color: colors.heading }}>
                  No orders yet
                </p>
                <p className="text-sm" style={{ color: colors.body }}>
                  Orders will appear here once customers start buying
                </p>
              </div>
            ) : (
              stats.recent_orders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <Link
                    key={order.id}
                    href={`/farmer/orders/${order.id}`}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: "4px",
                      }}
                    >
                      {order.first_item?.image ? (
                        <img
                          src={order.first_item.image}
                          alt=""
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <Package size={20} style={{ color: colors.body }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className="font-medium truncate"
                          style={{ color: colors.heading }}
                        >
                          {order.order_number}
                        </p>
                        <span
                          className="text-xs px-2 py-0.5 capitalize"
                          style={{
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            borderRadius: "4px",
                          }}
                        >
                          {order.status.replace("_", " ")}
                        </span>
                      </div>
                      <p
                        className="text-sm truncate"
                        style={{ color: colors.body }}
                      >
                        {order.buyer_name} - {order.items_count} item(s)
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-medium"
                        style={{ color: colors.heading }}
                      >
                        {formatCurrency(order.total_amount)}
                      </p>
                      <p className="text-xs" style={{ color: colors.body }}>
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Top Products */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: colors.border }}
          >
            <h2 className="font-semibold" style={{ color: colors.heading }}>
              Top Selling Products
            </h2>
            <Link
              href="/farmer/products"
              className="text-sm flex items-center gap-1"
              style={{ color: colors.accent }}
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {stats.top_products.length === 0 ? (
              <div className="p-8 text-center">
                <Package
                  size={40}
                  className="mx-auto mb-3"
                  style={{ color: colors.border }}
                />
                <p className="font-medium" style={{ color: colors.heading }}>
                  No products yet
                </p>
                <p className="text-sm mb-4" style={{ color: colors.body }}>
                  Start adding products to your store
                </p>
                <Link
                  href="/farmer/products/new"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  <Plus size={16} />
                  Add Product
                </Link>
              </div>
            ) : (
              stats.top_products.map((product, index) => (
                <Link
                  key={product.product_id}
                  href={`/farmer/products/${product.product_id}`}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium"
                    style={{
                      backgroundColor:
                        index < 3 ? colors.successBg : colors.background,
                      color: index < 3 ? colors.accent : colors.body,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div
                    className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: "4px",
                    }}
                  >
                    {product.product_image ? (
                      <img
                        src={product.product_image}
                        alt=""
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <Package size={20} style={{ color: colors.body }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium truncate"
                      style={{ color: colors.heading }}
                    >
                      {product.product_name}
                    </p>
                    <p className="text-sm" style={{ color: colors.body }}>
                      {formatCurrency(product.price)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className="font-medium"
                      style={{ color: colors.heading }}
                    >
                      {product.total_sold} sold
                    </p>
                    <p className="text-xs" style={{ color: colors.body }}>
                      {product.order_count} orders
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
