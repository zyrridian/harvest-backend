"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Truck,
  MapPin,
  Play,
  CheckCircle,
  Circle,
  Navigation,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  SkipForward,
  Route,
  Plus,
} from "lucide-react";
import Link from "next/link";

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

interface Stop {
  stop_id: string;
  stop_order: number;
  order_id: string;
  order_number: string;
  buyer_name: string;
  recipient_name: string | null;
  address_label: string | null;
  address_lat: number | null;
  address_lng: number | null;
  status: string;
  payment_method: string | null;
  total_amount: number;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  items: { productName: string; quantity: number }[];
  notes: string | null;
}

interface DeliveryRoute {
  route_id: string;
  delivery_date: string;
  status: string;
  tracking_enabled: boolean;
  current_location: { lat: number; lng: number; updated_at: string } | null;
  total_distance_km: number | null;
  estimated_minutes: number | null;
  started_at: string | null;
  completed_at: string | null;
  stops: Stop[];
  stop_count: number;
}

const statusColors: Record<string, string> = {
  pending: colors.body,
  arrived: colors.warning,
  completed: colors.success,
  skipped: colors.error,
};

const statusIcon: Record<string, typeof Circle> = {
  pending: Circle,
  arrived: Navigation,
  completed: CheckCircle,
  skipped: SkipForward,
};

export default function FarmerRoutePlanPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [trackingActive, setTrackingActive] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return null; }
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  }, [router]);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/v1/farmer/routes?date=${today}`, { headers });
      const data = await res.json();
      if (res.ok) {
        setRoutes(data.data.routes || []);
        if (data.data.routes?.length > 0 && !selectedRoute) {
          await fetchRouteDetail(data.data.routes[0].route_id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteDetail = async (routeId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`/api/v1/farmer/routes/${routeId}`, { headers });
      const data = await res.json();
      if (res.ok) setSelectedRoute(data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRoute = async (patch: Record<string, unknown>) => {
    if (!selectedRoute) return;
    const headers = getAuthHeaders();
    if (!headers) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/farmer/routes/${selectedRoute.route_id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      await fetchRouteDetail(selectedRoute.route_id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const markStopStatus = async (stopId: string, status: string) => {
    await updateRoute({ stop_id: stopId, stop_status: status });
  };

  const startRoute = async () => {
    await updateRoute({ status: "active" });
  };

  const completeRoute = async () => {
    stopTracking();
    await updateRoute({ status: "completed" });
  };

  const toggleTracking = async () => {
    const newVal = !selectedRoute?.tracking_enabled;
    await updateRoute({ tracking_enabled: newVal });

    if (newVal) {
      startTracking();
    } else {
      stopTracking();
    }
  };

  const pushLocation = async (lat: number, lng: number, accuracy?: number) => {
    if (!selectedRoute) return;
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      await fetch(`/api/v1/farmer/routes/${selectedRoute.route_id}/location`, {
        method: "POST",
        headers,
        body: JSON.stringify({ latitude: lat, longitude: lng, accuracy }),
      });
      // Locally update the marker position for immediate feedback
      setSelectedRoute(prev => {
        if (!prev) return null;
        return {
          ...prev,
          current_location: { lat, lng, updated_at: new Date().toISOString() }
        };
      });
    } catch {
      // silent — don't interrupt UX for location push failure
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported on this device");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        pushLocation(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      (err) => console.error("Geolocation error:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
    setLocationWatchId(watchId);
    setTrackingActive(true);
  };

  const stopTracking = () => {
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
    }
    setTrackingActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (locationWatchId !== null) navigator.geolocation.clearWatch(locationWatchId); };
  }, [locationWatchId]);

  const formatTime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-12">
      {/* Header */}
      <div className="border-b sticky top-16 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} style={{ color: colors.body }}>
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Route size={20} style={{ color: colors.accent }} />
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>Route Plan</h1>
          </div>
          <div className="ml-auto">
            <Link
              href="/farmer/routes/new"
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium"
              style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
            >
              <Plus size={16} />
              New Route
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: colors.errorBg, borderRadius: "4px", color: colors.error }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {routes.length === 0 ? (
          <div className="text-center py-16">
            <Truck size={48} className="mx-auto mb-4" style={{ color: colors.border }} />
            <p className="font-medium mb-2" style={{ color: colors.heading }}>No routes today</p>
            <p className="text-sm mb-6" style={{ color: colors.body }}>
              Create a route from your farmer_delivery orders
            </p>
            <Link
              href="/farmer/routes/new"
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium"
              style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
            >
              <Plus size={16} />
              Create Today's Route
            </Link>
          </div>
        ) : (
          <>
            {/* Route Tabs */}
            {routes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {routes.map((r) => (
                  <button
                    key={r.route_id}
                    onClick={() => fetchRouteDetail(r.route_id)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-medium border"
                    style={{
                      borderColor: selectedRoute?.route_id === r.route_id ? colors.accent : colors.border,
                      color: selectedRoute?.route_id === r.route_id ? colors.accent : colors.body,
                      borderRadius: "4px",
                      backgroundColor: selectedRoute?.route_id === r.route_id ? colors.successBg : "transparent",
                    }}
                  >
                    Route ({r.stop_count} stops)
                  </button>
                ))}
              </div>
            )}

            {selectedRoute && (
              <>
                {/* Route Summary Card */}
                <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-xs px-2 py-0.5 font-medium"
                          style={{
                            borderRadius: "4px",
                            backgroundColor: selectedRoute.status === "active" ? colors.successBg
                              : selectedRoute.status === "completed" ? colors.successBg
                                : colors.warningBg,
                            color: selectedRoute.status === "completed" ? colors.success
                              : selectedRoute.status === "active" ? colors.accent
                                : colors.warning,
                          }}
                        >
                          {selectedRoute.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: colors.body }}>
                        {selectedRoute.stops.length} stops
                        {selectedRoute.total_distance_km && ` · ${selectedRoute.total_distance_km.toFixed(1)} km`}
                        {selectedRoute.estimated_minutes && ` · ~${formatTime(selectedRoute.estimated_minutes)}`}
                      </p>
                    </div>

                    {/* Tracking Toggle */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={toggleTracking}
                        disabled={actionLoading || selectedRoute.status === "completed"}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-medium border disabled:opacity-50"
                        style={{
                          borderRadius: "4px",
                          borderColor: selectedRoute.tracking_enabled ? colors.success : colors.border,
                          backgroundColor: selectedRoute.tracking_enabled ? colors.successBg : "transparent",
                          color: selectedRoute.tracking_enabled ? colors.success : colors.body,
                        }}
                      >
                        {selectedRoute.tracking_enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                        {selectedRoute.tracking_enabled ? "Tracking ON" : "Tracking OFF"}
                      </button>
                      {trackingActive && (
                        <span className="text-xs flex items-center gap-1" style={{ color: colors.success }}>
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                          Live GPS active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Privacy notice */}
                  {selectedRoute.tracking_enabled && (
                    <div className="p-3 text-xs" style={{ backgroundColor: colors.warningBg, borderRadius: "4px", color: colors.warning }}>
                      ⚠️ Buyers can see your approximate location. Exact position only shared when within 2 km of their address.
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    {selectedRoute.status === "draft" && (
                      <button
                        onClick={startRoute}
                        disabled={actionLoading}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                        style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                        Start Delivery
                      </button>
                    )}
                    {selectedRoute.status === "active" && (
                      <button
                        onClick={completeRoute}
                        disabled={actionLoading}
                        className="flex-1 py-3 flex items-center justify-center gap-2 text-sm font-medium border disabled:opacity-50"
                        style={{ borderColor: colors.success, color: colors.success, borderRadius: "4px" }}
                      >
                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                        Complete Route
                      </button>
                    )}
                  </div>
                </div>

                {/* Stop List */}
                <div className="border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
                  <div className="p-4 border-b" style={{ borderColor: colors.border }}>
                    <h2 className="font-semibold" style={{ color: colors.heading }}>Delivery Stops</h2>
                  </div>
                  <div className="divide-y" style={{ borderColor: colors.border }}>
                    {selectedRoute.stops.map((stop) => {
                      const Icon = statusIcon[stop.status] || Circle;
                      return (
                        <div key={stop.stop_id} className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Stop Number / Status Icon */}
                            <div className="flex flex-col items-center">
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                                style={{
                                  backgroundColor: stop.status === "completed" ? colors.successBg
                                    : stop.status === "arrived" ? colors.warningBg
                                      : colors.background,
                                  color: statusColors[stop.status] || colors.body,
                                }}
                              >
                                {stop.stop_order}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium text-sm" style={{ color: colors.heading }}>
                                    {stop.recipient_name || stop.buyer_name}
                                  </p>
                                  <p className="text-xs" style={{ color: colors.body }}>
                                    Order #{stop.order_number}
                                  </p>
                                  {stop.address_label && (
                                    <p className="text-xs mt-1 flex items-center gap-1" style={{ color: colors.body }}>
                                      <MapPin size={12} />
                                      {stop.address_label}
                                    </p>
                                  )}
                                  {stop.items.slice(0, 2).map((item, i) => (
                                    <p key={i} className="text-xs mt-0.5" style={{ color: colors.body }}>
                                      · {item.productName} ×{item.quantity}
                                    </p>
                                  ))}
                                  {stop.payment_method === "cod" && (
                                    <div className="mt-2 p-2 inline-block border-2 border-dashed rounded" style={{ borderColor: colors.warning, backgroundColor: colors.warningBg }}>
                                      <p className="text-[10px] font-bold uppercase" style={{ color: colors.warning }}>Collect Cash</p>
                                      <p className="text-sm font-bold" style={{ color: colors.heading }}>
                                        Rp {stop.total_amount.toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                <Icon size={18} style={{ color: statusColors[stop.status] || colors.body, flexShrink: 0 }} />
                              </div>

                              {/* Stop Actions */}
                              {selectedRoute.status === "active" && stop.status !== "completed" && (
                                <div className="flex gap-2 mt-3">
                                  {stop.status === "pending" && (
                                    <button
                                      onClick={() => markStopStatus(stop.stop_id, "arrived")}
                                      className="px-3 py-1.5 text-xs font-medium border"
                                      style={{ borderColor: colors.warning, color: colors.warning, borderRadius: "4px" }}
                                    >
                                      Mark Arrived
                                    </button>
                                  )}
                                  {stop.status === "arrived" && (
                                    <button
                                      onClick={() => markStopStatus(stop.stop_id, "completed")}
                                      className="px-3 py-1.5 text-xs font-medium"
                                      style={{ backgroundColor: colors.success, color: colors.white, borderRadius: "4px" }}
                                    >
                                      Mark Delivered
                                    </button>
                                  )}
                                  <button
                                    onClick={() => markStopStatus(stop.stop_id, "skipped")}
                                    className="px-3 py-1.5 text-xs font-medium border"
                                    style={{ borderColor: colors.border, color: colors.body, borderRadius: "4px" }}
                                  >
                                    Skip
                                  </button>
                                  {/* Open in maps */}
                                  {stop.address_lat && stop.address_lng && (
                                    <a
                                      href={`https://maps.google.com/maps?daddr=${stop.address_lat},${stop.address_lng}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 text-xs font-medium border flex items-center gap-1"
                                      style={{ borderColor: colors.accent, color: colors.accent, borderRadius: "4px" }}
                                    >
                                      <Navigation size={12} />
                                      Navigate
                                    </a>
                                  )}
                                </div>
                              )}
                              {stop.actual_arrival && (
                                <p className="text-xs mt-2" style={{ color: colors.success }}>
                                  Delivered at {new Date(stop.actual_arrival).toLocaleTimeString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
