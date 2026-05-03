"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed } from "lucide-react";

interface DropPointPickerMapProps {
  initialLat: number;
  initialLng: number;
  hasLocation: boolean;
  onPick: (lat: number, lng: number) => void;
}

export default function DropPointPickerMap({
  initialLat,
  initialLng,
  hasLocation,
  onPick,
}: DropPointPickerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserLoc({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([lat, lng], 14);
        }
      });
    }
  };

  // Load Leaflet CSS once
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    if ("geolocation" in navigator && !hasLocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  }, [hasLocation]);

  useEffect(() => {
    if (mapInstanceRef.current && userLoc && !hasLocation) {
      mapInstanceRef.current.setView([userLoc.lat, userLoc.lng], 14);
    }
  }, [userLoc, hasLocation]);

  useEffect(() => {
    import("leaflet").then((L) => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      // Custom pin icon
      const pinIcon = L.divIcon({
        html: `<div style="width:28px;height:28px;background:#166534;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);font-size:13px;">🌿</span>
        </div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      if (hasLocation) {
        markerRef.current = L.marker([initialLat, initialLng], { icon: pinIcon }).addTo(map);
        markerRef.current.bindPopup("📍 Your drop point").openPopup();
      }

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        onPick(lat, lng);

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: pinIcon }).addTo(map);
          markerRef.current.bindPopup("📍 Your drop point").openPopup();
        }
      });

      mapInstanceRef.current = map;
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <p
        style={{
          fontSize: "12px",
          color: "#475569",
          marginBottom: "6px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        👆 Tap on the map to place your drop point pin
      </p>
      <div style={{ position: "relative" }}>
        <div
          ref={mapRef}
          style={{
            height: "280px",
            borderRadius: "6px",
            overflow: "hidden",
            border: "1px solid #E4E4E7",
          }}
        />
        <button
          type="button"
          onClick={handleLocateMe}
          title="Go to my location"
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 1000,
            backgroundColor: "white",
            border: "1px solid #E4E4E7",
            borderRadius: "4px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <LocateFixed size={18} style={{ color: "#475569" }} />
        </button>
      </div>
    </div>
  );
}
