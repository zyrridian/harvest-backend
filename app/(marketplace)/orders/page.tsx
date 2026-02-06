"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronRight,
  Loader2,
  Filter,
  Leaf,
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
  info: "#2563eb",
  infoBg: "#dbeafe",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  image: string | null;
}

interface Order {
  order_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  items: OrderItem[];
  item_count: number;
  seller: {
    name: string;
    avatar_url: string | null;
  };
  created_at: string;
  delivery_date: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "Pending",
    color: colors.warning,
    bg: colors.warningBg,
    icon: <Clock size={14} />,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: colors.info,
    bg: colors.infoBg,
    icon: <CheckCircle size={14} />,
  },
  PROCESSING: {
    label: "Processing",
    color: colors.info,
    bg: colors.infoBg,
    icon: <Package size={14} />,
  },
  SHIPPED: {
    label: "Shipped",
    color: colors.accent,
    bg: colors.successBg,
    icon: <Truck size={14} />,
  },
  DELIVERED: {
    label: "Delivered",
    color: colors.success,
    bg: colors.successBg,
    icon: <CheckCircle size={14} />,
  },
  CANCELLED: {
    label: "Cancelled",
    color: colors.error,
    bg: colors.errorBg,
    icon: <XCircle size={14} />,
  },
  REFUNDED: {
    label: "Refunded",
    color: colors.error,
    bg: colors.errorBg,
    icon: <XCircle size={14} />,
  },
};

function OrdersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState(
    searchParams.get("status") || ""
  );

  useEffect(() => {
    fetchOrders();
  }, [activeStatus]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/orders");
      return null;
    }
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("role", "buyer");
      if (activeStatus) params.set("status", activeStatus);

      const response = await fetch(`/api/v1/orders?${params.toString()}`, {
        headers,
      });

      if (response.status === 401) {
        router.push("/login?redirect=/orders");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setOrders(data.data.orders || data.data || []);
        setPagination(data.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusFilters = [
    { value: "", label: "All Orders" },
    { value: "PENDING", label: "Pending" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "PROCESSING", label: "Processing" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1
            className="text-xl font-bold mb-4"
            style={{ color: colors.heading }}
          >
            My Orders
          </h1>

          {/* Status filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setActiveStatus(filter.value)}
                className="px-4 py-2 text-sm font-medium whitespace-nowrap border transition-colors"
                style={{
                  borderColor:
                    activeStatus === filter.value
                      ? colors.accent
                      : colors.border,
                  backgroundColor:
                    activeStatus === filter.value
                      ? colors.successBg
                      : colors.white,
                  color:
                    activeStatus === filter.value
                      ? colors.accent
                      : colors.body,
                  borderRadius: "4px",
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package
              size={64}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              No orders found
            </h2>
            <p className="mb-6" style={{ color: colors.body }}>
              {activeStatus
                ? "No orders match this filter."
                : "You haven't placed any orders yet."}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              Start Shopping
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || {
                label: order.status,
                color: colors.body,
                bg: colors.border,
                icon: <Package size={14} />,
              };

              return (
                <Link
                  key={order.order_id}
                  href={`/orders/${order.order_id}`}
                  className="block border overflow-hidden transition-colors hover:border-green-600"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  {/* Order header */}
                  <div
                    className="p-4 border-b flex items-center justify-between"
                    style={{ borderColor: colors.border }}
                  >
                    <div>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.heading }}
                      >
                        Order #{order.order_number}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: colors.body }}>
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className="px-3 py-1 text-xs font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: status.bg,
                        color: status.color,
                        borderRadius: "4px",
                      }}
                    >
                      {status.icon}
                      {status.label}
                    </span>
                  </div>

                  {/* Order items preview */}
                  <div className="p-4">
                    <div className="flex gap-4">
                      {/* Items preview */}
                      <div className="flex -space-x-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 border-2 overflow-hidden"
                            style={{
                              borderColor: colors.white,
                              borderRadius: "4px",
                              backgroundColor: "#f4f4f5",
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Leaf
                                  size={20}
                                  style={{ color: colors.border }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                        {order.item_count > 3 && (
                          <div
                            className="w-16 h-16 border-2 flex items-center justify-center text-sm font-medium"
                            style={{
                              borderColor: colors.white,
                              borderRadius: "4px",
                              backgroundColor: colors.background,
                              color: colors.body,
                            }}
                          >
                            +{order.item_count - 3}
                          </div>
                        )}
                      </div>

                      {/* Order info */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm truncate"
                          style={{ color: colors.heading }}
                        >
                          {order.items[0]?.product_name}
                          {order.item_count > 1 &&
                            ` and ${order.item_count - 1} more items`}
                        </p>
                        <p className="text-xs mt-1" style={{ color: colors.body }}>
                          From {order.seller.name}
                        </p>
                        <p
                          className="text-sm font-bold mt-2"
                          style={{ color: colors.accent }}
                        >
                          {order.currency}{" "}
                          {Number(order.total_amount).toLocaleString()}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ChevronRight
                        size={20}
                        className="flex-shrink-0 self-center"
                        style={{ color: colors.body }}
                      />
                    </div>

                    {/* Delivery info */}
                    {order.delivery_date &&
                      (order.status === "SHIPPED" ||
                        order.status === "DELIVERED") && (
                        <div
                          className="mt-3 pt-3 border-t flex items-center gap-2 text-xs"
                          style={{
                            borderColor: colors.border,
                            color:
                              order.status === "DELIVERED"
                                ? colors.success
                                : colors.body,
                          }}
                        >
                          {order.status === "DELIVERED" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Truck size={14} />
                          )}
                          {order.status === "DELIVERED"
                            ? `Delivered on ${new Date(order.delivery_date).toLocaleDateString()}`
                            : `Expected delivery: ${new Date(order.delivery_date).toLocaleDateString()}`}
                        </div>
                      )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: colors.background }}
        >
          <Loader2
            size={32}
            className="animate-spin"
            style={{ color: colors.accent }}
          />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
