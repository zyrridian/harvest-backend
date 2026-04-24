"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Truck, Loader2, AlertCircle, CheckCircle, Route } from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  errorBg: "#fee2e2",
  warning: "#ca8a04",
  warningBg: "#fef9c3",
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  delivery_date: string | null;
  delivery_method: string;
  items: { product_name: string; quantity: number }[];
  buyer?: { name: string };
  delivery_address?: { address: string; city: string };
  is_assigned?: boolean;
}

export default function NewRoutePage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deliveryDate, setDeliveryDate] = useState(new Date().toISOString().split("T")[0]);
  const [showAllDates, setShowAllDates] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return null; }
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      // Fetch all orders and filter for those that need farmer delivery
      const res = await fetch("/api/v1/farmer/orders?delivery_method=farmer_delivery&status=all&limit=100", { headers });
      const data = await res.json();
      console.log("[NewRoutePage] API Response:", data);
      if (res.ok) {
        const rawOrders = data.data || [];
        console.log("[NewRoutePage] Raw Orders count:", rawOrders.length);
        
        // Filter out already assigned orders and sort by date
        const availableOrders = rawOrders
          .filter((o: Order) => !o.is_assigned)
          .sort((a: any, b: any) => {
            if (!a.delivery_date) return 1;
            if (!b.delivery_date) return -1;
            return new Date(a.delivery_date).getTime() - new Date(b.delivery_date).getTime();
          });
        console.log("[NewRoutePage] Available (not assigned) orders:", availableOrders.length);
        
        setAllOrders(availableOrders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on selected date
  useEffect(() => {
    if (allOrders.length === 0) {
      setOrders([]);
      return;
    }

    const filtered = allOrders.filter((o) => {
      if (showAllDates) return true;
      if (!o.delivery_date) return true;

      const orderDateStr = new Date(o.delivery_date).toISOString().split("T")[0];
      return orderDateStr === deliveryDate;
    });

    console.log(`[NewRoutePage] Date filter: ${deliveryDate}, found ${filtered.length} matches`);
    setOrders(filtered);
    
    // Clear selections that are no longer in the filtered list
    setSelected(prev => {
      const next = new Set(prev);
      const filteredIds = new Set(filtered.map(o => o.id));
      let changed = false;
      for (const id of next) {
        if (!filteredIds.has(id)) {
          next.delete(id);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [allOrders, deliveryDate]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreate = async () => {
    if (selected.size === 0) { setError("Select at least one order"); return; }
    const headers = getAuthHeaders();
    if (!headers) return;

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/v1/farmer/routes", {
        method: "POST",
        headers,
        body: JSON.stringify({
          delivery_date: deliveryDate,
          order_ids: [...selected],
          tracking_enabled: trackingEnabled,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create route");
      router.push("/farmer/routes");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24">
      <div className="border-b sticky top-16 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} style={{ color: colors.body }}><ChevronLeft size={24} /></button>
          <div className="flex items-center gap-2">
            <Route size={20} style={{ color: colors.accent }} />
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>New Delivery Route</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: colors.errorBg, borderRadius: "4px", color: colors.error }}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        {/* Date + Settings */}
        <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
          <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Route Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: colors.heading }}>Delivery Date</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full p-3 border text-sm outline-none"
                style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm" style={{ color: colors.heading }}>Enable Live Tracking</p>
                <p className="text-xs mt-0.5" style={{ color: colors.body }}>
                  Buyers see approximate location. Exact only within 2 km.
                </p>
              </div>
              <button
                onClick={() => setTrackingEnabled(!trackingEnabled)}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{ backgroundColor: trackingEnabled ? colors.accent : colors.border }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform"
                  style={{ transform: trackingEnabled ? "translateX(24px)" : "translateX(4px)" }}
                />
              </button>
            </div>
            {trackingEnabled && (
              <div className="p-3 text-xs" style={{ backgroundColor: colors.warningBg, borderRadius: "4px", color: colors.warning }}>
                ⚠️ Buyers will see your approximate location while delivering. You can turn this off anytime from the route screen.
              </div>
            )}
          </div>
        </div>

        {/* Order Selection */}
        <div className="border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
          <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: colors.border }}>
            <h2 className="font-semibold" style={{ color: colors.heading }}>
              Select Orders ({selected.size} selected)
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAllDates(!showAllDates)}
                className="text-xs px-2 py-1 rounded border"
                style={{ 
                  borderColor: colors.border, 
                  backgroundColor: showAllDates ? colors.accent : "transparent",
                  color: showAllDates ? colors.white : colors.body
                }}
              >
                {showAllDates ? "All Dates" : `Filter: ${deliveryDate}`}
              </button>
              {orders.length > 0 && (
                <button
                  onClick={() => selected.size === orders.length ? setSelected(new Set()) : setSelected(new Set(orders.map((o) => o.id)))}
                  className="text-xs"
                  style={{ color: colors.accent }}
                >
                  {selected.size === orders.length ? "Deselect All" : "Select All"}
                </button>
              )}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center">
              <Truck size={40} className="mx-auto mb-3" style={{ color: colors.border }} />
              <p className="text-sm" style={{ color: colors.body }}>
                {allOrders.length > 0 ? (
                  <>
                    No orders found for <span className="font-bold">{deliveryDate}</span>.
                    <span className="block mt-1 text-xs">
                      You have {allOrders.length} pending farmer_delivery orders on other dates.
                    </span>
                  </>
                ) : (
                  <>
                    No suitable farmer_delivery orders found.
                    <span className="block mt-1 text-xs">
                      Orders must be "Confirmed" or "Pending Payment" with "Farmer Delivery" method.
                    </span>
                  </>
                )}
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: colors.border }}>
              {orders.map((order) => {
                const isSelected = selected.has(order.id);
                return (
                  <label
                    key={order.id}
                    className="flex items-start gap-3 p-4 cursor-pointer"
                    style={{
                      backgroundColor: isSelected ? colors.successBg : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggle(order.id)}
                      style={{ accentColor: colors.accent }}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm" style={{ color: colors.heading }}>
                          #{order.order_number}
                        </p>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded capitalize"
                          style={{
                            backgroundColor: order.status === 'confirmed' ? colors.successBg : colors.warningBg,
                            color: order.status === 'confirmed' ? colors.success : colors.warning
                          }}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      {order.buyer && (
                        <p className="text-xs mt-0.5" style={{ color: colors.body }}>{order.buyer.name}</p>
                      )}
                      {order.delivery_address && (
                        <p className="text-xs mt-1" style={{ color: colors.body }}>
                          📍 {order.delivery_address.city}
                        </p>
                      )}
                      {order.delivery_date && (
                        <p className="text-[10px] font-bold mt-1 uppercase" style={{ color: colors.accent }}>
                          📅 Delivery: {new Date(order.delivery_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </p>
                      )}
                      <div className="mt-1">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <p key={i} className="text-xs" style={{ color: colors.body }}>
                            · {item.product_name} ×{item.quantity}
                          </p>
                        ))}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleCreate}
          disabled={submitting || selected.size === 0}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
        >
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Route size={18} />}
          {submitting ? "Optimizing Route..." : `Create Route (${selected.size} stops)`}
        </button>

        <p className="text-xs text-center" style={{ color: colors.body }}>
          Route order optimized automatically using distance calculation
        </p>
      </div>
    </div>
  );
}
