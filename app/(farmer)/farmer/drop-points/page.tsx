"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  Navigation,
  Plus,
  Pencil,
  Trash2,
  MapPin,
  Loader2,
  X,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

// Map is loaded client-side only
const DropPointPickerMap = dynamic<{
  initialLat: number;
  initialLng: number;
  hasLocation: boolean;
  onPick: (lat: number, lng: number) => void;
}>(() => import("@/(farmer)/farmer/drop-points/DropPointPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] bg-gray-50 flex items-center justify-center border border-dashed rounded-lg">
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
  error: "#dc2626",
  errorBg: "#fee2e2",
  warning: "#ca8a04",
  warningBg: "#fef9c3",
};

interface DropPoint {
  id: string;
  name: string;
  description: string | null;
  what_we_sell: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface FormState {
  name: string;
  description: string;
  what_we_sell: string;
  latitude: string;
  longitude: string;
  address: string;
  image_url: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  what_we_sell: "",
  latitude: "",
  longitude: "",
  address: "",
  image_url: "",
};

export default function FarmerDropPointsPage() {
  const [dropPoints, setDropPoints] = useState<DropPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const token = () => localStorage.getItem("accessToken") || "";

  useEffect(() => {
    fetchDropPoints();
  }, []);

  const fetchDropPoints = async () => {
    try {
      const res = await fetch("/api/v1/farmer/drop-points", {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (res.ok) setDropPoints(data.data);
    } catch {
      setError("Failed to load drop points");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (dp: DropPoint) => {
    setEditingId(dp.id);
    setForm({
      name: dp.name,
      description: dp.description || "",
      what_we_sell: dp.what_we_sell || "",
      latitude: String(dp.latitude),
      longitude: String(dp.longitude),
      address: dp.address || "",
      image_url: dp.image_url || "",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.latitude || !form.longitude) { setError("Pick a location on the map"); return; }

    setSaving(true);
    setError("");
    try {
      const body = {
        name: form.name,
        description: form.description || null,
        what_we_sell: form.what_we_sell || null,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        address: form.address || null,
        image_url: form.image_url || null,
      };

      const url = editingId
        ? `/api/v1/farmer/drop-points/${editingId}`
        : "/api/v1/farmer/drop-points";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");

      setSuccess(editingId ? "Drop point updated!" : "Drop point created!");
      closeForm();
      fetchDropPoints();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (dp: DropPoint) => {
    try {
      await fetch(`/api/v1/farmer/drop-points/${dp.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token()}`,
        },
        body: JSON.stringify({ is_active: !dp.is_active }),
      });
      setDropPoints((prev) =>
        prev.map((p) => (p.id === dp.id ? { ...p, is_active: !p.is_active } : p))
      );
    } catch {
      setError("Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this drop point?")) return;
    try {
      await fetch(`/api/v1/farmer/drop-points/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token()}` },
      });
      setDropPoints((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Deleted.");
      setTimeout(() => setSuccess(""), 2000);
    } catch {
      setError("Failed to delete");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <Navigation size={22} style={{ color: colors.accent }} />
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: colors.heading, margin: 0 }}>
              Drop Points
            </h1>
          </div>
          <p style={{ color: colors.body, fontSize: "14px", margin: 0 }}>
            Pin your physical selling locations so buyers can find and navigate to you
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            padding: "10px 16px",
            backgroundColor: colors.accent,
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <Plus size={16} />
          Add Drop Point
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: colors.errorBg,
            border: `1px solid ${colors.error}`,
            borderRadius: "6px",
          }}
        >
          <AlertCircle size={16} style={{ color: colors.error, flexShrink: 0 }} />
          <p style={{ color: colors.error, fontSize: "14px", margin: 0 }}>{error}</p>
          <button
            onClick={() => setError("")}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: colors.error }}
          >
            <X size={14} />
          </button>
        </div>
      )}
      {success && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            backgroundColor: colors.successBg,
            border: `1px solid ${colors.success}`,
            borderRadius: "6px",
          }}
        >
          <Check size={16} style={{ color: colors.success }} />
          <p style={{ color: colors.success, fontSize: "14px", margin: 0 }}>{success}</p>
        </div>
      )}

      {/* Form Panel */}
      {showForm && (
        <div
          style={{
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <h2 style={{ fontWeight: 700, fontSize: "16px", color: colors.heading, margin: 0 }}>
              {editingId ? "Edit Drop Point" : "New Drop Point"}
            </h2>
            <button
              onClick={closeForm}
              style={{ background: "none", border: "none", cursor: "pointer", color: colors.body }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{ padding: "20px", display: "grid", gap: "16px" }}>
            {/* Name */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading, display: "block", marginBottom: "6px" }}>
                Location Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Pasar Minggu Stall, Farm Gate"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: colors.heading,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* What We Sell */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading, display: "block", marginBottom: "6px" }}>
                What We Sell Here
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh tomatoes, spinach, chili"
                value={form.what_we_sell}
                onChange={(e) => setForm((f) => ({ ...f, what_we_sell: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: colors.heading,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading, display: "block", marginBottom: "6px" }}>
                Description
              </label>
              <textarea
                placeholder="Opening hours, how to find us, payment methods..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: colors.heading,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Address */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading, display: "block", marginBottom: "6px" }}>
                Address / Directions
              </label>
              <input
                type="text"
                placeholder="Street address or landmark description"
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: colors.heading,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Map Picker */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading }}>
                  Location on Map *
                </label>
                {form.latitude && form.longitude && (
                  <span style={{ fontSize: "11px", color: colors.body }}>
                    {parseFloat(form.latitude).toFixed(5)}, {parseFloat(form.longitude).toFixed(5)}
                  </span>
                )}
              </div>

              <div>
                <DropPointPickerMap
                  initialLat={form.latitude ? parseFloat(form.latitude) : -6.2}
                  initialLng={form.longitude ? parseFloat(form.longitude) : 106.816}
                  hasLocation={!!form.latitude}
                  onPick={(lat, lng) => {
                    setForm((f) => ({ ...f, latitude: String(lat), longitude: String(lng) }));
                  }}
                />
              </div>
            </div>

            {/* Image URL */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: 600, color: colors.heading, display: "block", marginBottom: "6px" }}>
                Photo URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  fontSize: "14px",
                  color: colors.heading,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {form.image_url && (
                <img
                  src={form.image_url}
                  alt=""
                  style={{ marginTop: "8px", width: "80px", height: "80px", objectFit: "cover", borderRadius: "4px" }}
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 24px",
                  backgroundColor: colors.accent,
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingId ? "Save Changes" : "Create Drop Point"}
              </button>
              <button
                onClick={closeForm}
                style={{
                  padding: "10px 16px",
                  border: `1px solid ${colors.border}`,
                  backgroundColor: "transparent",
                  borderRadius: "4px",
                  fontSize: "14px",
                  cursor: "pointer",
                  color: colors.body,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: colors.accent }} />
        </div>
      ) : dropPoints.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            backgroundColor: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
          }}
        >
          <Navigation size={48} style={{ color: colors.border, margin: "0 auto 16px" }} />
          <h2 style={{ fontWeight: 700, fontSize: "18px", color: colors.heading, marginBottom: "8px" }}>
            No drop points yet
          </h2>
          <p style={{ color: colors.body, fontSize: "14px", marginBottom: "20px" }}>
            Add your first selling location so buyers can find you on the map
          </p>
          <button
            onClick={openCreate}
            style={{
              padding: "10px 24px",
              backgroundColor: colors.accent,
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add Drop Point
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {dropPoints.map((dp) => (
            <div
              key={dp.id}
              style={{
                backgroundColor: colors.white,
                border: `1px solid ${dp.is_active ? colors.border : colors.border}`,
                borderRadius: "8px",
                padding: "16px",
                opacity: dp.is_active ? 1 : 0.65,
              }}
            >
              <div style={{ display: "flex", gap: "14px" }}>
                {dp.image_url ? (
                  <img
                    src={dp.image_url}
                    alt={dp.name}
                    style={{ width: "72px", height: "72px", objectFit: "cover", borderRadius: "6px", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: "72px",
                      height: "72px",
                      borderRadius: "6px",
                      backgroundColor: colors.successBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontSize: "28px",
                    }}
                  >
                    🌿
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <p style={{ fontWeight: 700, fontSize: "15px", color: colors.heading, margin: 0 }}>
                          {dp.name}
                        </p>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            backgroundColor: dp.is_active ? colors.successBg : "#f1f5f9",
                            color: dp.is_active ? colors.success : colors.body,
                          }}
                        >
                          {dp.is_active ? "Active" : "Hidden"}
                        </span>
                      </div>
                      {dp.what_we_sell && (
                        <p style={{ fontSize: "13px", color: colors.body, margin: "4px 0 0 0" }}>
                          🛒 {dp.what_we_sell}
                        </p>
                      )}
                      {dp.address && (
                        <p style={{ fontSize: "12px", color: colors.body, margin: "3px 0 0 0" }}>
                          📍 {dp.address}
                        </p>
                      )}
                      <p style={{ fontSize: "11px", color: "#94a3b8", margin: "4px 0 0 0" }}>
                        {dp.latitude.toFixed(5)}, {dp.longitude.toFixed(5)}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                      <button
                        onClick={() => handleToggle(dp)}
                        title={dp.is_active ? "Hide from map" : "Show on map"}
                        style={{
                          padding: "7px",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          color: colors.body,
                        }}
                      >
                        {dp.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                      <button
                        onClick={() => openEdit(dp)}
                        title="Edit"
                        style={{
                          padding: "7px",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          color: colors.accent,
                        }}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(dp.id)}
                        title="Delete"
                        style={{
                          padding: "7px",
                          border: `1px solid ${colors.border}`,
                          borderRadius: "4px",
                          backgroundColor: "transparent",
                          cursor: "pointer",
                          color: colors.error,
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                  {dp.description && (
                    <p style={{ fontSize: "12px", color: colors.body, margin: "6px 0 0 0", lineHeight: 1.5 }}>
                      {dp.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
