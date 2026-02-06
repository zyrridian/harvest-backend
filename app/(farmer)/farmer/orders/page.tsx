"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Package,
  Search,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
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

interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  buyer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  service_fee: number;
  total_discount: number;
  total_amount: number;
  payment_method?: string;
  payment_status?: string;
  delivery_method?: string;
  delivery_address?: {
    name: string;
    phone?: string;
    address: string;
    city: string;
    state: string;
  };
  delivery_date?: string;
  delivery_time_slot?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface OrderStats {
  total_orders: number;
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  total_revenue: number;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export default function FarmerOrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchOrders();
  }, [status, page]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status,
      });

      const response = await fetch(`/api/v1/farmer/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.data);
      setStats(data.stats);
      setPagination(data.pagination);
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
      year: "numeric",
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

  const statusTabs = [
    { value: "all", label: "All", count: stats?.total_orders || 0 },
    { value: "pending", label: "Pending", count: stats?.pending || 0 },
    { value: "confirmed", label: "Confirmed", count: stats?.confirmed || 0 },
    { value: "processing", label: "Processing", count: stats?.processing || 0 },
    { value: "shipped", label: "Shipped", count: stats?.shipped || 0 },
    { value: "delivered", label: "Delivered", count: stats?.delivered || 0 },
    { value: "completed", label: "Completed", count: stats?.completed || 0 },
    { value: "cancelled", label: "Cancelled", count: stats?.cancelled || 0 },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
          Orders
        </h1>
        <p className="text-sm" style={{ color: colors.body }}>
          Manage and track your customer orders
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Total Orders
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.heading }}>
              {stats.total_orders}
            </p>
          </div>
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.warningBg,
              borderColor: colors.warning,
              borderRadius: "4px",
            }}
          >
            <p className="text-sm" style={{ color: colors.warning }}>
              Needs Action
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.warning }}>
              {stats.pending + stats.confirmed}
            </p>
          </div>
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.successBg,
              borderColor: colors.success,
              borderRadius: "4px",
            }}
          >
            <p className="text-sm" style={{ color: colors.accent }}>
              Completed
            </p>
            <p className="text-2xl font-bold" style={{ color: colors.accent }}>
              {stats.completed}
            </p>
          </div>
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Total Revenue
            </p>
            <p className="text-xl font-bold" style={{ color: colors.heading }}>
              {formatCurrency(stats.total_revenue)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div
        className="p-4 border space-y-4"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {/* Search */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.body }}
          />
          <input
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700"
            style={{
              borderColor: colors.border,
              borderRadius: "4px",
              color: colors.heading,
            }}
          />
        </div>

        {/* Status Tabs - Scrollable */}
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() =>
                  router.push(
                    `/farmer/orders${tab.value !== "all" ? `?status=${tab.value}` : ""}`,
                  )
                }
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium border transition-colors whitespace-nowrap"
                style={{
                  backgroundColor:
                    status === tab.value ? colors.accent : "transparent",
                  borderColor:
                    status === tab.value ? colors.accent : colors.border,
                  color: status === tab.value ? colors.white : colors.body,
                  borderRadius: "4px",
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className="px-1.5 py-0.5 text-xs rounded"
                    style={{
                      backgroundColor:
                        status === tab.value
                          ? "rgba(255,255,255,0.2)"
                          : colors.background,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 border flex items-center gap-3"
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <AlertCircle size={20} style={{ color: colors.error }} />
          <p style={{ color: colors.error }}>{error}</p>
        </div>
      )}

      {/* Orders List */}
      <div
        className="border overflow-hidden"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: colors.accent,
                borderTopColor: "transparent",
              }}
            />
            <p style={{ color: colors.body }}>Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-8 text-center">
            <Package
              size={48}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <p className="font-medium mb-2" style={{ color: colors.heading }}>
              No orders found
            </p>
            <p className="text-sm" style={{ color: colors.body }}>
              {searchQuery
                ? "Try a different search term"
                : "Orders will appear here when customers start buying"}
            </p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {filteredOrders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              return (
                <Link
                  key={order.id}
                  href={`/farmer/orders/${order.id}`}
                  className="block p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p
                          className="font-medium"
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
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          {order.buyer.avatar ? (
                            <img
                              src={order.buyer.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: colors.successBg }}
                            >
                              <User
                                size={14}
                                style={{ color: colors.accent }}
                              />
                            </div>
                          )}
                          <span style={{ color: colors.body }}>
                            {order.buyer.name}
                          </span>
                        </div>
                        <span style={{ color: colors.border }}>|</span>
                        <span style={{ color: colors.body }}>
                          {order.items.length} item(s)
                        </span>
                      </div>
                    </div>

                    {/* Products Preview */}
                    <div className="flex -space-x-2">
                      {order.items.slice(0, 3).map((item, index) => (
                        <div
                          key={item.id}
                          className="w-10 h-10 rounded border-2 border-white overflow-hidden flex-shrink-0"
                          style={{ backgroundColor: colors.background }}
                        >
                          {item.product_image ? (
                            <img
                              src={item.product_image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package
                                size={14}
                                style={{ color: colors.body }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div
                          className="w-10 h-10 rounded border-2 border-white flex items-center justify-center text-xs font-medium"
                          style={{
                            backgroundColor: colors.background,
                            color: colors.body,
                          }}
                        >
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Amount & Date */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className="font-semibold"
                        style={{ color: colors.heading }}
                      >
                        {formatCurrency(order.total_amount)}
                      </p>
                      <div
                        className="flex items-center gap-1 text-xs"
                        style={{ color: colors.body }}
                      >
                        <Clock size={12} />
                        {formatDate(order.created_at)}
                      </div>
                    </div>

                    {/* Arrow */}
                    <ArrowRight
                      size={18}
                      style={{ color: colors.border }}
                      className="hidden sm:block"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Page {pagination.current_page} of {pagination.total_pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page === 1}
                onClick={() =>
                  router.push(
                    `/farmer/orders?page=${pagination.current_page - 1}${
                      status !== "all" ? `&status=${status}` : ""
                    }`,
                  )
                }
                className="px-3 py-1 border text-sm disabled:opacity-50"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.body,
                }}
              >
                Previous
              </button>
              <button
                disabled={pagination.current_page === pagination.total_pages}
                onClick={() =>
                  router.push(
                    `/farmer/orders?page=${pagination.current_page + 1}${
                      status !== "all" ? `&status=${status}` : ""
                    }`,
                  )
                }
                className="px-3 py-1 border text-sm disabled:opacity-50"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.body,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
