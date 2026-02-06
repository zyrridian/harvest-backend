"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  Loader2,
  Leaf,
  AlertCircle,
  Star,
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
  item_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  image: string | null;
}

interface OrderDetail {
  order_id: string;
  order_number: string;
  status: string;
  items: OrderItem[];
  subtotal: number;
  discount_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_method: string | null;
  seller: {
    user_id: string;
    name: string;
    avatar_url: string | null;
    phone: string | null;
  };
  shipping_address: {
    recipient_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    postal_code: string;
  } | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  cancellation_reason: string | null;
}

const statusSteps = [
  { key: "PENDING", label: "Order Placed", icon: Package },
  { key: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { key: "PROCESSING", label: "Processing", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
];

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  PENDING: { label: "Pending", color: colors.warning, bg: colors.warningBg },
  CONFIRMED: { label: "Confirmed", color: colors.info, bg: colors.infoBg },
  PROCESSING: { label: "Processing", color: colors.info, bg: colors.infoBg },
  SHIPPED: { label: "Shipped", color: colors.accent, bg: colors.successBg },
  DELIVERED: { label: "Delivered", color: colors.success, bg: colors.successBg },
  CANCELLED: { label: "Cancelled", color: colors.error, bg: colors.errorBg },
  REFUNDED: { label: "Refunded", color: colors.error, bg: colors.errorBg },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/orders/${orderId}`);
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchOrder = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`/api/v1/orders/${orderId}`, { headers });

      if (response.status === 401) {
        router.push(`/login?redirect=/orders/${orderId}`);
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setOrder(data.data);
      } else {
        setError(data.message || "Order not found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!order || !cancelReason.trim()) return;

    const headers = getAuthHeaders();
    if (!headers) return;

    setCancelling(true);
    try {
      const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
        method: "POST",
        headers,
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (response.ok) {
        fetchOrder();
        setShowCancelModal(false);
      } else {
        const data = await response.json();
        setError(data.message || "Failed to cancel order");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex((s) => s.key === status);
  };

  if (loading) {
    return (
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
    );
  }

  if (error || !order) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Order not found
          </h1>
          <p className="mb-4" style={{ color: colors.body }}>
            {error || "The order you're looking for doesn't exist."}
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            <ChevronLeft size={16} />
            Back to orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.status);
  const isCancelled =
    order.status === "CANCELLED" || order.status === "REFUNDED";
  const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);
  const status = statusConfig[order.status] || {
    label: order.status,
    color: colors.body,
    bg: colors.border,
  };

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-sm mb-3"
            style={{ color: colors.body }}
          >
            <ChevronLeft size={16} />
            Back to orders
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: colors.heading }}
              >
                Order #{order.order_number}
              </h1>
              <p className="text-sm mt-1" style={{ color: colors.body }}>
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <span
              className="px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: status.bg,
                color: status.color,
                borderRadius: "4px",
              }}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Order tracking */}
        {!isCancelled && (
          <div
            className="p-6 border mb-6"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <h2
              className="font-bold mb-6"
              style={{ color: colors.heading }}
            >
              Order Status
            </h2>

            {/* Progress steps */}
            <div className="relative">
              <div className="flex justify-between">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex flex-col items-center relative z-10"
                      style={{ width: "20%" }}
                    >
                      <div
                        className="w-10 h-10 flex items-center justify-center mb-2"
                        style={{
                          backgroundColor: isCompleted
                            ? colors.accent
                            : colors.border,
                          borderRadius: "50%",
                        }}
                      >
                        <StepIcon
                          size={20}
                          style={{
                            color: isCompleted ? colors.white : colors.body,
                          }}
                        />
                      </div>
                      <p
                        className="text-xs text-center font-medium"
                        style={{
                          color: isCompleted ? colors.accent : colors.body,
                        }}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Progress line */}
              <div
                className="absolute top-5 left-0 right-0 h-0.5"
                style={{
                  backgroundColor: colors.border,
                  marginLeft: "10%",
                  marginRight: "10%",
                }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    backgroundColor: colors.accent,
                    width: `${Math.min(100, (currentStatusIndex / (statusSteps.length - 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Tracking info */}
            {order.tracking_number && (
              <div
                className="mt-6 p-4 border"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <p className="text-sm" style={{ color: colors.body }}>
                  Tracking Number:{" "}
                  <span
                    className="font-medium"
                    style={{ color: colors.heading }}
                  >
                    {order.tracking_number}
                  </span>
                </p>
                {order.estimated_delivery && (
                  <p className="text-sm mt-1" style={{ color: colors.body }}>
                    Expected Delivery:{" "}
                    <span
                      className="font-medium"
                      style={{ color: colors.heading }}
                    >
                      {new Date(order.estimated_delivery).toLocaleDateString()}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Cancelled notice */}
        {isCancelled && (
          <div
            className="p-4 border mb-6 flex items-start gap-3"
            style={{
              backgroundColor: colors.errorBg,
              borderColor: colors.error,
              borderRadius: "4px",
            }}
          >
            <XCircle size={20} style={{ color: colors.error }} />
            <div>
              <p className="font-medium" style={{ color: colors.error }}>
                Order {order.status.toLowerCase()}
              </p>
              {order.cancellation_reason && (
                <p className="text-sm mt-1" style={{ color: colors.error }}>
                  Reason: {order.cancellation_reason}
                </p>
              )}
              {order.cancelled_at && (
                <p className="text-xs mt-1" style={{ color: colors.body }}>
                  {new Date(order.cancelled_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order items */}
          <div className="md:col-span-2 space-y-4">
            <div
              className="border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div
                className="p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <h2 className="font-bold" style={{ color: colors.heading }}>
                  Items ({order.items.length})
                </h2>
              </div>

              <div className="divide-y" style={{ borderColor: colors.border }}>
                {order.items.map((item) => (
                  <div key={item.item_id} className="p-4 flex gap-4">
                    <Link
                      href={`/products/${item.product_id}`}
                      className="w-20 h-20 flex-shrink-0 border overflow-hidden"
                      style={{
                        borderColor: colors.border,
                        borderRadius: "4px",
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.product_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: "#f4f4f5" }}
                        >
                          <Leaf size={24} style={{ color: colors.border }} />
                        </div>
                      )}
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.product_id}`}
                        className="font-medium text-sm hover:underline"
                        style={{ color: colors.heading }}
                      >
                        {item.product_name}
                      </Link>
                      <p className="text-sm mt-1" style={{ color: colors.body }}>
                        {order.currency} {Number(item.unit_price).toLocaleString()}{" "}
                        x {item.quantity} {item.unit}
                      </p>
                    </div>

                    <p
                      className="font-bold text-sm"
                      style={{ color: colors.heading }}
                    >
                      {order.currency}{" "}
                      {Number(item.total_price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Seller info */}
            <div
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <h2 className="font-bold mb-3" style={{ color: colors.heading }}>
                Seller
              </h2>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: "4px",
                  }}
                >
                  {order.seller.avatar_url ? (
                    <img
                      src={order.seller.avatar_url}
                      alt={order.seller.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Leaf size={20} style={{ color: colors.accent }} />
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className="font-medium"
                    style={{ color: colors.heading }}
                  >
                    {order.seller.name}
                  </p>
                </div>
                <Link
                  href={`/messages?seller=${order.seller.user_id}`}
                  className="p-2 border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <MessageSquare size={18} style={{ color: colors.accent }} />
                </Link>
              </div>
            </div>

            {/* Shipping address */}
            {order.shipping_address && (
              <div
                className="p-4 border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <h2 className="font-bold mb-3" style={{ color: colors.heading }}>
                  Shipping Address
                </h2>
                <div className="flex items-start gap-3">
                  <MapPin
                    size={18}
                    className="flex-shrink-0 mt-0.5"
                    style={{ color: colors.accent }}
                  />
                  <div>
                    <p
                      className="font-medium"
                      style={{ color: colors.heading }}
                    >
                      {order.shipping_address.recipient_name}
                    </p>
                    <p className="text-sm mt-1" style={{ color: colors.body }}>
                      {order.shipping_address.address_line1}
                      {order.shipping_address.address_line2 &&
                        `, ${order.shipping_address.address_line2}`}
                    </p>
                    <p className="text-sm" style={{ color: colors.body }}>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state}{" "}
                      {order.shipping_address.postal_code}
                    </p>
                    <p
                      className="text-sm mt-2 flex items-center gap-1"
                      style={{ color: colors.body }}
                    >
                      <Phone size={14} />
                      {order.shipping_address.phone}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order summary */}
          <div>
            <div
              className="border sticky top-4"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div
                className="p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <h2 className="font-bold" style={{ color: colors.heading }}>
                  Order Summary
                </h2>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>Subtotal</span>
                  <span style={{ color: colors.heading }}>
                    {order.currency} {Number(order.subtotal).toLocaleString()}
                  </span>
                </div>

                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: colors.success }}>Discount</span>
                    <span style={{ color: colors.success }}>
                      -{order.currency}{" "}
                      {Number(order.discount_amount).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>Shipping</span>
                  <span style={{ color: colors.heading }}>
                    {order.shipping_cost > 0
                      ? `${order.currency} ${Number(order.shipping_cost).toLocaleString()}`
                      : "Free"}
                  </span>
                </div>

                {order.tax_amount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: colors.body }}>Tax</span>
                    <span style={{ color: colors.heading }}>
                      {order.currency}{" "}
                      {Number(order.tax_amount).toLocaleString()}
                    </span>
                  </div>
                )}

                <div
                  className="pt-3 border-t flex justify-between"
                  style={{ borderColor: colors.border }}
                >
                  <span
                    className="font-bold"
                    style={{ color: colors.heading }}
                  >
                    Total
                  </span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: colors.accent }}
                  >
                    {order.currency}{" "}
                    {Number(order.total_amount).toLocaleString()}
                  </span>
                </div>

                <div
                  className="pt-3 border-t text-sm"
                  style={{ borderColor: colors.border }}
                >
                  <p style={{ color: colors.body }}>
                    Payment:{" "}
                    <span style={{ color: colors.heading }}>
                      {order.payment_method || "Pending"}
                    </span>
                  </p>
                  <p className="mt-1" style={{ color: colors.body }}>
                    Status:{" "}
                    <span
                      style={{
                        color:
                          order.payment_status === "PAID"
                            ? colors.success
                            : colors.warning,
                      }}
                    >
                      {order.payment_status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 space-y-2">
                {order.status === "DELIVERED" && (
                  <Link
                    href={`/orders/${orderId}/review`}
                    className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 border transition-colors hover:bg-gray-50"
                    style={{
                      borderColor: colors.accent,
                      color: colors.accent,
                      borderRadius: "4px",
                    }}
                  >
                    <Star size={16} />
                    Leave a Review
                  </Link>
                )}

                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 border transition-colors hover:bg-red-50"
                    style={{
                      borderColor: colors.error,
                      color: colors.error,
                      borderRadius: "4px",
                    }}
                  >
                    <XCircle size={16} />
                    Cancel Order
                  </button>
                )}

                <Link
                  href={`/messages?seller=${order.seller.user_id}`}
                  className="w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2 border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: colors.border,
                    color: colors.heading,
                    borderRadius: "4px",
                  }}
                >
                  <MessageSquare size={16} />
                  Contact Seller
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div
            className="w-full max-w-md p-6"
            style={{
              backgroundColor: colors.white,
              borderRadius: "4px",
            }}
          >
            <h3
              className="text-lg font-bold mb-4"
              style={{ color: colors.heading }}
            >
              Cancel Order
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              Are you sure you want to cancel this order? Please provide a
              reason for cancellation.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              rows={3}
              className="w-full px-3 py-2 text-sm border outline-none mb-4"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.heading,
                  borderRadius: "4px",
                }}
              >
                Keep Order
              </button>
              <button
                onClick={cancelOrder}
                disabled={cancelling || !cancelReason.trim()}
                className="flex-1 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colors.error,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
