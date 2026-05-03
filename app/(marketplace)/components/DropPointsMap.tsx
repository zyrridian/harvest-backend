"use client";

import { useEffect, useRef, useState } from "react";

interface DropPoint {
  id: string;
  farmer_id: string;
  farmer: {
    id: string;
    name: string;
    profile_image: string | null;
    is_verified: boolean;
    rating: number;
    city: string | null;
  };
  name: string;
  description: string | null;
  what_we_sell: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
  distance_km?: number;
}

interface DropPointsMapProps {
  height?: string;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  farmerId?: string; // filter to one farmer
  selectedPoint?: DropPoint | null;
  onPointSelect?: (point: DropPoint) => void;
}

const colors = {
  accent: "#166534",
  successBg: "#dcfce7",
  white: "#FFFFFF",
  border: "#E4E4E7",
  heading: "#18181b",
  body: "#475569",
  warning: "#ca8a04",
};

export default function DropPointsMap({
  height = "400px",
  initialLat = -6.2,
  initialLng = 106.8,
  initialZoom = 11,
  farmerId,
  selectedPoint,
  onPointSelect,
}: DropPointsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [dropPoints, setDropPoints] = useState<DropPoint[]>([]);
  const [internalSelected, setInternalSelected] = useState<DropPoint | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // Load Leaflet CSS
  useEffect(() => {
    if (document.getElementById("leaflet-css")) return;
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }, []);

  // Get user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  // Fetch drop points
  useEffect(() => {
    const params = new URLSearchParams();
    if (farmerId) params.set("farmer_id", farmerId);
    fetch(`/api/v1/drop-points?${params}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.status === "success") setDropPoints(d.data);
      })
      .finally(() => setLoading(false));
  }, [farmerId]);

  // Init map
  useEffect(() => {
    if (!mapRef.current || loading) return;
    if (mapInstanceRef.current) {
      // Update markers only
      renderMarkers();
      return;
    }

    // Dynamic import leaflet
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: userPos
          ? [userPos.lat, userPos.lng]
          : [initialLat, initialLng],
        zoom: initialZoom,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = { map, L };

      // User position marker
      if (userPos) {
        const userIcon = L.divIcon({
          html: `<div style="width:14px;height:14px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
          className: "",
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        L.marker([userPos.lat, userPos.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup("<b>📍 Your location</b>");
      }

      renderMarkers();
    });
  }, [loading, dropPoints, userPos]);

  // Sync external selected point and pan map
  useEffect(() => {
    if (selectedPoint !== undefined) {
      setInternalSelected(selectedPoint);
      if (selectedPoint && mapInstanceRef.current) {
        mapInstanceRef.current.map.setView([selectedPoint.latitude, selectedPoint.longitude], 15, {
          animate: true,
          duration: 0.5,
        });
      }
    }
  }, [selectedPoint]);

  function renderMarkers() {
    const instance = mapInstanceRef.current;
    if (!instance) return;
    const { map, L } = instance;

    // Clear old markers
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    dropPoints.forEach((dp) => {
      const icon = L.divIcon({
        html: `
          <div style="
            background:${colors.accent};
            color:white;
            width:32px;height:32px;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,0.25);
            display:flex;align-items:center;justify-content:center;
            cursor:pointer;
          ">
            <span style="transform:rotate(45deg);font-size:14px;">🌿</span>
          </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -34],
      });

      const marker = L.marker([dp.latitude, dp.longitude], { icon }).addTo(map);
      marker.on("click", () => {
        setInternalSelected(dp);
        onPointSelect?.(dp);
      });
      markersRef.current.push(marker);
    });
  }

  const openGoogleMapsNav = (dp: DropPoint) => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dp.latitude},${dp.longitude}`,
      "_blank"
    );
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {loading && (
        <div
          style={{
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f4f4f5",
            borderRadius: "4px",
          }}
        >
          <span style={{ color: colors.body, fontSize: "14px" }}>
            Loading map...
          </span>
        </div>
      )}

      <div
        ref={mapRef}
        style={{
          height,
          display: loading ? "none" : "block",
          borderRadius: "4px",
          overflow: "hidden",
          zIndex: 0,
        }}
      />

      {/* Info card for selected point */}
      {internalSelected && (
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            right: "16px",
            zIndex: 1000,
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            padding: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <div style={{ display: "flex", gap: "12px" }}>
            {internalSelected.image_url && (
              <img
                src={internalSelected.image_url}
                alt={internalSelected.name}
                style={{
                  width: "64px",
                  height: "64px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  flexShrink: 0,
                }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "8px",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: "15px",
                      color: colors.heading,
                      margin: 0,
                    }}
                  >
                    {internalSelected.name}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: colors.accent,
                      fontWeight: 600,
                      margin: "2px 0 0 0",
                    }}
                  >
                    {internalSelected.farmer.name}
                    {internalSelected.farmer.is_verified && " ✓"}
                  </p>
                  {internalSelected.what_we_sell && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: colors.body,
                        margin: "4px 0 0 0",
                      }}
                    >
                      🛒 {internalSelected.what_we_sell}
                    </p>
                  )}
                  {internalSelected.address && (
                    <p
                      style={{
                        fontSize: "11px",
                        color: colors.body,
                        margin: "4px 0 0 0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      📍 {internalSelected.address}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setInternalSelected(null);
                    onPointSelect?.(null as any);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: colors.body,
                    fontSize: "18px",
                    lineHeight: 1,
                    padding: "0 0 0 8px",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  marginTop: "10px",
                }}
              >
                <button
                  onClick={() => openGoogleMapsNav(internalSelected)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: colors.accent,
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  🧭 Navigate
                </button>
                <a
                  href={`/farmers/${internalSelected.farmer_id}`}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    border: `1px solid ${colors.border}`,
                    color: colors.heading,
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    textDecoration: "none",
                  }}
                >
                  👨‍🌾 View Farm
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drop points count badge */}
      {!loading && dropPoints.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            zIndex: 1000,
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "12px",
            fontWeight: 600,
            color: colors.accent,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          🌿 {dropPoints.length} drop point{dropPoints.length !== 1 ? "s" : ""}
        </div>
      )}

      {!loading && dropPoints.length === 0 && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 999,
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(255,255,255,0.9)",
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              padding: "16px 24px",
            }}
          >
            <p style={{ color: colors.body, fontSize: "14px", margin: 0 }}>
              No drop points yet in this area
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
