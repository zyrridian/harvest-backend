"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
  EyeOff,
  Navigation,
} from "lucide-react";

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

interface TrackingData {
  order_id: string;
  tracking_available: boolean;
  route_status?: string;
  stop_status?: string;
  stop_order?: number;
  stops_ahead?: number;
  estimated_arrival?: string | null;
  actual_arrival?: string | null;
  live_location?: {
    lat: number;
    lng: number;
    is_exact: boolean;
    updated_at: string | null;
  } | null;
  reason?: string;
  delivery_method?: string;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) { router.push("/login"); return null; }
    return { Authorization: `Bearer ${token}` };
  };

  const fetchTracking = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch(`/api/v1/orders/${orderId}/tracking`, { headers });
      const data = await res.json();
      if (res.ok) {
        setTracking(data.data);
      } else {
        setError(data.message || "Failed to load tracking");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    // Poll every 30 seconds when tracking is live
    intervalRef.current = setInterval(fetchTracking, 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [orderId]);

  const stopStatusLabel: Record<string, { label: string; color: string }> = {
    pending: { label: "En Route", color: colors.accent },
    arrived: { label: "Farmer Arrived", color: colors.warning },
    completed: { label: "Delivered", color: colors.success },
    skipped: { label: "Delivery Skipped", color: colors.error },
  };

  const openInMaps = (lat: number, lng: number) => {
    window.open(`https://maps.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} style={{ color: colors.body }}>
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: colors.heading }}>Order Tracking</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {error && (
          <div className="p-4 text-sm" style={{ backgroundColor: colors.errorBg, borderRadius: "4px", color: colors.error }}>
            {error}
          </div>
        )}

        {tracking && !tracking.tracking_available && (
          <div className="p-6 text-center border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
            <EyeOff size={40} className="mx-auto mb-3" style={{ color: colors.border }} />
            <p className="font-medium mb-1" style={{ color: colors.heading }}>Tracking Not Available</p>
            <p className="text-sm" style={{ color: colors.body }}>{tracking.reason}</p>
            {tracking.stop_status && (
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: colors.successBg, color: colors.accent, borderRadius: "4px" }}>
                <Truck size={16} />
                {stopStatusLabel[tracking.stop_status]?.label || tracking.stop_status}
              </div>
            )}
          </div>
        )}

        {tracking && tracking.tracking_available && (
          <>
            {/* Status Banner */}
            <div
              className="p-4 flex items-center justify-between"
              style={{
                backgroundColor: tracking.stop_status === "completed" ? colors.successBg : colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
                border: `1px solid ${colors.border}`,
              }}
            >
              <div className="flex items-center gap-3">
                {tracking.stop_status === "completed" ? (
                  <CheckCircle size={24} style={{ color: colors.success }} />
                ) : tracking.stop_status === "arrived" ? (
                  <Navigation size={24} style={{ color: colors.warning }} />
                ) : (
                  <Truck size={24} style={{ color: colors.accent }} />
                )}
                <div>
                  <p className="font-semibold" style={{ color: colors.heading }}>
                    {stopStatusLabel[tracking.stop_status || "pending"]?.label || "On the way"}
                  </p>
                  {tracking.stops_ahead !== undefined && tracking.stops_ahead > 0 && (
                    <p className="text-xs mt-0.5" style={{ color: colors.body }}>
                      {tracking.stops_ahead} stop{tracking.stops_ahead !== 1 ? "s" : ""} ahead of yours
                    </p>
                  )}
                  {tracking.stops_ahead === 0 && tracking.stop_status === "pending" && (
                    <p className="text-xs mt-0.5" style={{ color: colors.accent }}>
                      You're next!
                    </p>
                  )}
                </div>
              </div>
              {tracking.estimated_arrival && (
                <div className="text-right">
                  <Clock size={14} className="inline mr-1" style={{ color: colors.body }} />
                  <span className="text-xs" style={{ color: colors.body }}>
                    ETA {new Date(tracking.estimated_arrival).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              )}
            </div>

            {/* Live Location Card */}
            {tracking.live_location ? (
              <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: colors.heading }}>
                    <MapPin size={18} style={{ color: colors.accent }} />
                    Farmer's Location
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    <span className="text-xs" style={{ color: colors.success }}>Live</span>
                  </div>
                </div>

                {!tracking.live_location.is_exact && (
                  <div className="mb-3 p-2 text-xs" style={{ backgroundColor: colors.warningBg, borderRadius: "4px", color: colors.warning }}>
                    📍 Showing approximate location. Exact location shared when farmer is within 2 km.
                  </div>
                )}

                {/* Simple static map using OpenStreetMap tile */}
                <div
                  className="w-full h-48 overflow-hidden mb-3 flex items-center justify-center"
                  style={{ borderRadius: "4px", border: `1px solid ${colors.border}`, backgroundColor: "#e8f5e9" }}
                >
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${tracking.live_location.lat},${tracking.live_location.lng}&zoom=14&size=600x200&maptype=mapnik&markers=${tracking.live_location.lat},${tracking.live_location.lng},red`}
                    alt="Farmer location map"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if static map fails
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="absolute">
                    <Truck size={32} style={{ color: colors.accent }} />
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openInMaps(tracking.live_location!.lat, tracking.live_location!.lng)}
                    className="flex-1 py-2 text-sm font-medium border flex items-center justify-center gap-2"
                    style={{ borderColor: colors.accent, color: colors.accent, borderRadius: "4px" }}
                  >
                    <Navigation size={16} />
                    Open in Maps
                  </button>
                </div>

                {tracking.live_location.updated_at && (
                  <p className="text-xs mt-2 text-center" style={{ color: colors.body }}>
                    Updated {new Date(tracking.live_location.updated_at).toLocaleTimeString()}
                    {" · "}Refreshes every 30s
                  </p>
                )}
              </div>
            ) : (
              <div className="p-5 border text-center" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
                <Truck size={40} className="mx-auto mb-2" style={{ color: colors.border }} />
                <p className="text-sm" style={{ color: colors.body }}>
                  {tracking.route_status === "draft"
                    ? "Farmer hasn't started delivering yet"
                    : "Waiting for location update..."}
                </p>
              </div>
            )}

            {/* Delivery confirmed */}
            {tracking.stop_status === "completed" && tracking.actual_arrival && (
              <div className="p-4 flex items-center gap-3" style={{ backgroundColor: colors.successBg, borderRadius: "4px" }}>
                <CheckCircle size={20} style={{ color: colors.success }} />
                <div>
                  <p className="font-medium text-sm" style={{ color: colors.success }}>Delivered!</p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    {new Date(tracking.actual_arrival).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
