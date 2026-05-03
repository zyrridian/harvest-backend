"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { MapPin, Loader2, Search, X } from "lucide-react";

const DropPointsMap = dynamic<{
  height?: string;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
  farmerId?: string;
  selectedPoint?: any;
  onPointSelect?: (point: any) => void;
}>(() => import("../components/DropPointsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] bg-gray-50 flex items-center justify-center border border-dashed rounded-lg">
      <Loader2 className="animate-spin text-green-700" size={24} />
    </div>
  ),
});

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
};

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
}

export default function DropPointsPage() {
  const [dropPoints, setDropPoints] = useState<DropPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<DropPoint | null>(null);

  const [buyerLoc, setBuyerLoc] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    fetch("/api/v1/drop-points")
      .then((r) => r.json())
      .then((d) => { if (d.status === "success") setDropPoints(d.data); })
      .finally(() => setLoading(false));

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setBuyerLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.log("Geolocation error:", err)
      );
    }
  }, []);

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  let filtered = dropPoints.filter((dp) => {
    const q = search.toLowerCase();
    return (
      !q ||
      dp.name.toLowerCase().includes(q) ||
      dp.farmer.name.toLowerCase().includes(q) ||
      dp.what_we_sell?.toLowerCase().includes(q) ||
      dp.address?.toLowerCase().includes(q)
    );
  });

  if (buyerLoc) {
    filtered.sort((a, b) => {
      const distA = getDistance(buyerLoc.lat, buyerLoc.lng, a.latitude, a.longitude);
      const distB = getDistance(buyerLoc.lat, buyerLoc.lng, b.latitude, b.longitude);
      return distA - distB;
    });
  }

  return (
    <div style={{ backgroundColor: colors.background, minHeight: "100vh" }}>
      {/* Hero header */}
      <section
        style={{
          backgroundColor: colors.white,
          borderBottom: `1px solid ${colors.border}`,
          padding: "24px 16px 20px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "8px",
                backgroundColor: colors.successBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <MapPin size={20} style={{ color: colors.accent }} />
            </div>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: 800,
                color: colors.heading,
                margin: 0,
                letterSpacing: "-0.3px",
              }}
            >
              Drop Points
            </h1>
          </div>
          <p style={{ color: colors.body, fontSize: "14px", margin: "0 0 16px 46px" }}>
            Find farmers selling near you — navigate directly to their selling spots
          </p>

          {/* Search */}
          <div style={{ position: "relative", maxWidth: "480px" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                color: colors.body,
              }}
            />
            <input
              type="text"
              placeholder="Search by name, product, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 36px 10px 36px",
                border: `1px solid ${colors.border}`,
                borderRadius: "4px",
                fontSize: "14px",
                color: colors.heading,
                backgroundColor: colors.background,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: colors.body,
                  display: "flex",
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: "1280px",
          margin: "0 auto",
          padding: "20px 16px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "20px",
        }}
        className="drop-points-layout"
      >
        {/* Map */}
        <div
          style={{
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            overflow: "hidden",
            backgroundColor: colors.white,
          }}
        >
          <DropPointsMap
            height="480px"
            initialLat={buyerLoc?.lat ?? -6.2}
            initialLng={buyerLoc?.lng ?? 106.816}
            initialZoom={buyerLoc ? 12 : 11}
            selectedPoint={selected}
            onPointSelect={(p) => setSelected(p as any)}
          />
        </div>

        {/* List */}
        <div>
          <p
            style={{
              fontSize: "13px",
              color: colors.body,
              marginBottom: "12px",
              fontWeight: 500,
            }}
          >
            {loading ? "Loading..." : `${filtered.length} drop point${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
              <Loader2 size={28} className="animate-spin" style={{ color: colors.accent }} />
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 16px",
                backgroundColor: colors.white,
                border: `1px solid ${colors.border}`,
                borderRadius: "8px",
              }}
            >
              <MapPin size={40} style={{ color: colors.border, margin: "0 auto 12px" }} />
              <p style={{ color: colors.body, fontSize: "14px" }}>No drop points found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {filtered.map((dp) => {
                const distanceKm = buyerLoc 
                  ? getDistance(buyerLoc.lat, buyerLoc.lng, dp.latitude, dp.longitude)
                  : undefined;
                  
                return (
                  <DropPointCard
                    key={dp.id}
                    dp={dp}
                    isSelected={selected?.id === dp.id}
                    distanceKm={distanceKm}
                    onClick={() => setSelected(dp)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 768px) {
          .drop-points-layout {
            grid-template-columns: 3fr 2fr !important;
          }
        }
        @media (min-width: 1024px) {
          .drop-points-layout {
            grid-template-columns: 3fr 2fr !important;
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}

function DropPointCard({
  dp,
  isSelected,
  distanceKm,
  onClick,
}: {
  dp: DropPoint;
  isSelected: boolean;
  distanceKm?: number;
  onClick: () => void;
}) {
  const openNav = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${dp.latitude},${dp.longitude}`,
      "_blank"
    );
  };

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: colors.white,
        border: `1.5px solid ${isSelected ? colors.accent : colors.border}`,
        borderRadius: "8px",
        padding: "14px",
        cursor: "pointer",
        transition: "border-color 0.15s",
        boxShadow: isSelected ? `0 0 0 3px ${colors.successBg}` : "none",
      }}
    >
      <div style={{ display: "flex", gap: "12px" }}>
        {dp.image_url ? (
          <img
            src={dp.image_url}
            alt={dp.name}
            style={{
              width: "60px",
              height: "60px",
              objectFit: "cover",
              borderRadius: "6px",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "6px",
              backgroundColor: colors.successBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "24px",
            }}
          >
            🌿
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  fontWeight: 700,
                  fontSize: "14px",
                  color: colors.heading,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {dp.name}
              </p>
              <a
                href={`/farmers/${dp.farmer_id}`}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: "12px",
                  color: colors.accent,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                👨‍🌾 {dp.farmer.name}
                {dp.farmer.is_verified && " ✓"}
              </a>
            </div>
            <button
              onClick={openNav}
              style={{
                padding: "6px 10px",
                backgroundColor: colors.accent,
                color: "white",
                border: "none",
                borderRadius: "4px",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
                flexShrink: 0,
                marginLeft: "8px",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              🧭 Go
            </button>
          </div>

          {dp.what_we_sell && (
            <p
              style={{
                fontSize: "12px",
                color: colors.body,
                margin: "6px 0 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              🛒 {dp.what_we_sell}
            </p>
          )}
          {dp.address && (
            <p
              style={{
                fontSize: "11px",
                color: colors.body,
                margin: "3px 0 0 0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              📍 {dp.address}
            </p>
          )}
          {distanceKm !== undefined && (
            <p
              style={{
                fontSize: "11px",
                color: colors.accent,
                margin: "4px 0 0 0",
                fontWeight: 600,
              }}
            >
              📏 {distanceKm.toFixed(1)} km away
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
