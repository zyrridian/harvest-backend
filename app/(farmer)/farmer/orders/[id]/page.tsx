"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  User,
  CreditCard,
  Calendar,
  FileText,
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

const statusTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  pending_payment: ["pending", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

export default function FarmerOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState("");
  const [showTrackingInput, setShowTrackingInput] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/farmer/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch order");
      }

      setOrder(data.data);
      setTrackingNumber(data.data.tracking_number || "");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!order) return;

    const allowedTransitions = statusTransitions[order.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      setError(`Cannot transition from ${order.status} to ${newStatus}`);
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("accessToken");
      const body: any = { status: newStatus };
      
      if (newStatus === "shipped" && trackingNumber) {
        body.tracking_number = trackingNumber;
      }

      const response = await fetch(`/api/v1/farmer/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order");
      }

      setOrder(data.data);
      setShowTrackingInput(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, { bg: string; color: string; icon: any }> = {
      pending: { bg: colors.warningBg, color: colors.warning, icon: Clock },
      pending_payment: { bg: colors.warningBg, color: colors.warning, icon: CreditCard },
      confirmed: { bg: "#dbeafe", color: "#2563eb", icon: CheckCircle2 },
      processing: { bg: "#e0e7ff", color: "#4f46e5", icon: Package },
      shipped: { bg: "#cffafe", color: "#0891b2", icon: Truck },
      delivered: { bg: colors.successBg, color: colors.success, icon: CheckCircle2 },
      completed: { bg: colors.successBg, color: colors.success, icon: CheckCircle2 },
      cancelled: { bg: colors.errorBg, color: colors.error, icon: XCircle },
    };
    return styles[status] || { bg: colors.border, color: colors.body, icon: Package };
  };

  const getNextActionLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Confirm Order",
      confirmed: "Start Processing",
      processing: "Ship Order",
      shipped: "Mark as Delivered",
      delivered: "Complete Order",
    };
    return labels[status];
  };

  const getNextStatus = (status: string) => {
    const next: Record<string, string> = {
      pending: "confirmed",
      confirmed: "processing",
      processing: "shipped",
      shipped: "delivered",
      delivered: "completed",
    };
    return next[status];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="space-y-4">
        <Link
          href="/farmer/orders"
          className="inline-flex items-center gap-2 text-sm hover:underline"
          style={{ color: colors.body }}
        >
          <ArrowLeft size={16} />
          Back to orders
        </Link>
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
      </div>
    );
  }

  if (!order) return null;

  const statusStyle = getStatusStyle(order.status);
  const StatusIcon = statusStyle.icon;
  const nextAction = getNextActionLabel(order.status);
  const nextStatus = getNextStatus(order.status);
  const canCancel = ["pending", "pending_payment", "confirmed"].includes(order.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/farmer/orders"
            className="inline-flex items-center gap-2 text-sm hover:underline mb-2"
            style={{ color: colors.body }}
          >
            <ArrowLeft size={16} />
            Back to orders
          </Link>
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Order {order.order_number}
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Placed on {formatDate(order.created_at)}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 self-start"
          style={{
            backgroundColor: statusStyle.bg,
            borderRadius: "4px",
          }}
        >
          <StatusIcon size={18} style={{ color: statusStyle.color }} />
          <span
            className="font-medium capitalize"
            style={{ color: statusStyle.color }}
          >
            {order.status.replace("_", " ")}
          </span>
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
          <button
            onClick={() => setError("")}
            className="ml-auto"
            style={{ color: colors.error }}
          >
            ×
          </button>
        </div>
      )}

      {/* Action Buttons */}
      {(nextAction || canCancel) && (
        <div
          className="p-4 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium mb-3" style={{ color: colors.heading }}>
            Order Actions
          </h3>

          {/* Tracking Input for Shipping */}
          {order.status === "processing" && showTrackingInput && (
            <div className="mb-4 p-4 border" style={{ borderColor: colors.border, borderRadius: "4px", backgroundColor: colors.background }}>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.heading }}>
                Tracking Number (optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number..."
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700 mb-3"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus("shipped")}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  {isUpdating ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: colors.white, borderTopColor: "transparent" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Truck size={16} />
                      Confirm Shipment
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowTrackingInput(false)}
                  className="px-4 py-2 text-sm border"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.body,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showTrackingInput && (
            <div className="flex flex-wrap gap-3">
              {nextAction && order.status !== "processing" && (
                <button
                  onClick={() => nextStatus && updateStatus(nextStatus)}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  {isUpdating ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                        style={{ borderColor: colors.white, borderTopColor: "transparent" }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      {nextAction}
                    </>
                  )}
                </button>
              )}
              {order.status === "processing" && (
                <button
                  onClick={() => setShowTrackingInput(true)}
                  className="px-4 py-2 text-sm font-medium flex items-center gap-2 transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  <Truck size={16} />
                  Ship Order
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => updateStatus("cancelled")}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium flex items-center gap-2 border transition-colors"
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
            </div>
          )}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Order Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div
            className="border overflow-hidden"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <div className="px-4 py-3 border-b" style={{ borderColor: colors.border }}>
              <h3 className="font-medium" style={{ color: colors.heading }}>
                Order Items ({order.items.length})
              </h3>
            </div>
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex gap-4">
                  <div
                    className="w-16 h-16 rounded flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: colors.background }}
                  >
                    {item.product_image ? (
                      <img
                        src={item.product_image}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} style={{ color: colors.body }} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/farmer/products/${item.product_id}/edit`}
                      className="font-medium hover:underline line-clamp-1"
                      style={{ color: colors.heading }}
                    >
                      {item.product_name}
                    </Link>
                    <p className="text-sm mt-1" style={{ color: colors.body }}>
                      {formatCurrency(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold" style={{ color: colors.heading }}>
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {/* Order Summary */}
            <div
              className="p-4 border-t space-y-2"
              style={{ borderColor: colors.border, backgroundColor: colors.background }}
            >
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.body }}>Subtotal</span>
                <span style={{ color: colors.heading }}>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.body }}>Delivery Fee</span>
                <span style={{ color: colors.heading }}>{formatCurrency(order.delivery_fee)}</span>
              </div>
              {order.service_fee > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>Service Fee</span>
                  <span style={{ color: colors.heading }}>{formatCurrency(order.service_fee)}</span>
                </div>
              )}
              {order.total_discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>Discount</span>
                  <span style={{ color: colors.success }}>-{formatCurrency(order.total_discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: colors.border }}>
                <span className="font-medium" style={{ color: colors.heading }}>Total</span>
                <span className="font-bold text-lg" style={{ color: colors.heading }}>
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} style={{ color: colors.body }} />
                <h3 className="font-medium" style={{ color: colors.heading }}>
                  Customer Notes
                </h3>
              </div>
              <p className="text-sm" style={{ color: colors.body }}>
                {order.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Customer & Delivery Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <h3 className="font-medium mb-4" style={{ color: colors.heading }}>
              Customer Information
            </h3>
            <div className="flex items-center gap-3 mb-4">
              {order.buyer.avatar ? (
                <img
                  src={order.buyer.avatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.successBg }}
                >
                  <User size={24} style={{ color: colors.accent }} />
                </div>
              )}
              <div>
                <p className="font-medium" style={{ color: colors.heading }}>
                  {order.buyer.name}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} style={{ color: colors.body }} />
                <a
                  href={`mailto:${order.buyer.email}`}
                  className="hover:underline"
                  style={{ color: colors.body }}
                >
                  {order.buyer.email}
                </a>
              </div>
              {order.buyer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone size={16} style={{ color: colors.body }} />
                  <a
                    href={`tel:${order.buyer.phone}`}
                    className="hover:underline"
                    style={{ color: colors.body }}
                  >
                    {order.buyer.phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          {order.delivery_address && (
            <div
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} style={{ color: colors.body }} />
                <h3 className="font-medium" style={{ color: colors.heading }}>
                  Delivery Address
                </h3>
              </div>
              <div className="space-y-1 text-sm" style={{ color: colors.body }}>
                <p className="font-medium" style={{ color: colors.heading }}>
                  {order.delivery_address.name}
                </p>
                {order.delivery_address.phone && (
                  <p>{order.delivery_address.phone}</p>
                )}
                <p>{order.delivery_address.address}</p>
                <p>
                  {order.delivery_address.city}, {order.delivery_address.state}
                </p>
              </div>
            </div>
          )}

          {/* Delivery Schedule */}
          {(order.delivery_date || order.delivery_time_slot) && (
            <div
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={18} style={{ color: colors.body }} />
                <h3 className="font-medium" style={{ color: colors.heading }}>
                  Delivery Schedule
                </h3>
              </div>
              <div className="space-y-2 text-sm" style={{ color: colors.body }}>
                {order.delivery_date && (
                  <p>
                    <span className="font-medium" style={{ color: colors.heading }}>Date:</span>{" "}
                    {new Date(order.delivery_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {order.delivery_time_slot && (
                  <p>
                    <span className="font-medium" style={{ color: colors.heading }}>Time:</span>{" "}
                    {order.delivery_time_slot}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tracking Info */}
          {order.tracking_number && (
            <div
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Truck size={18} style={{ color: colors.body }} />
                <h3 className="font-medium" style={{ color: colors.heading }}>
                  Tracking Information
                </h3>
              </div>
              <p className="text-sm font-medium" style={{ color: colors.heading }}>
                {order.tracking_number}
              </p>
            </div>
          )}

          {/* Payment Info */}
          <div
            className="p-4 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={18} style={{ color: colors.body }} />
              <h3 className="font-medium" style={{ color: colors.heading }}>
                Payment Information
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: colors.body }}>Method</span>
                <span className="capitalize" style={{ color: colors.heading }}>
                  {order.payment_method?.replace("_", " ") || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: colors.body }}>Status</span>
                <span className="capitalize" style={{ color: colors.heading }}>
                  {order.payment_status?.replace("_", " ") || "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
