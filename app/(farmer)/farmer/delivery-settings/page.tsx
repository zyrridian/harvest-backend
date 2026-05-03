"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Truck,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Banknote,
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

interface DeliverySettings {
  farmer_delivery_enabled: boolean;
  base_fee: number;
  per_km_rate: number;
  max_radius_km: number;
  min_order_for_free: number | null;
  cash_on_delivery_enabled: boolean;
  notes: string | null;
}

export default function FarmerDeliverySettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<DeliverySettings>({
    farmer_delivery_enabled: false,
    base_fee: 10000,
    per_km_rate: 2000,
    max_radius_km: 30,
    min_order_for_free: null,
    cash_on_delivery_enabled: false,
    notes: "",
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/farmer/delivery-settings");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;
    try {
      const res = await fetch("/api/v1/farmer/delivery-settings", { headers });
      const data = await res.json();
      if (res.ok && data.data.delivery_settings) {
        setSettings(data.data.delivery_settings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/v1/farmer/delivery-settings", {
        method: "PUT",
        headers,
        body: JSON.stringify({
          farmer_delivery_enabled: settings.farmer_delivery_enabled,
          base_fee: settings.base_fee,
          per_km_rate: settings.per_km_rate,
          max_radius_km: settings.max_radius_km,
          min_order_for_free: settings.min_order_for_free || null,
          cash_on_delivery_enabled: settings.cash_on_delivery_enabled,
          notes: settings.notes || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save settings");

      setSuccess("Delivery settings saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Preview fee calculation
  const previewFee = (distanceKm: number) => {
    if (!settings.farmer_delivery_enabled) return null;
    if (distanceKm > settings.max_radius_km) return null;
    return Math.round(settings.base_fee + distanceKm * settings.per_km_rate);
  };

  const formatCurrency = (val: number) =>
    `IDR ${val.toLocaleString("id-ID")}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background }}>
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24">
      {/* Header */}
      <div className="border-b sticky top-16 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} style={{ color: colors.body }}>
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Truck size={20} style={{ color: colors.accent }} />
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
              Delivery Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: colors.errorBg, borderRadius: "4px", color: colors.error }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 flex items-center gap-2 text-sm" style={{ backgroundColor: colors.successBg, borderRadius: "4px", color: colors.success }}>
            <CheckCircle size={16} />
            {success}
          </div>
        )}

        {/* Enable Toggle */}
        <div className="space-y-4">
          <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold" style={{ color: colors.heading }}>Enable Farmer Delivery</p>
                <p className="text-sm mt-1" style={{ color: colors.body }}>
                  Offer direct delivery to buyers in your area
                </p>
              </div>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, farmer_delivery_enabled: !prev.farmer_delivery_enabled }))}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.farmer_delivery_enabled ? colors.accent : colors.border,
                }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ transform: settings.farmer_delivery_enabled ? "translateX(24px)" : "translateX(4px)" }}
                />
              </button>
            </div>
          </div>

          <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded" style={{ color: colors.warning }}>
                  <Banknote size={20} />
                </div>
                <div>
                  <p className="font-semibold" style={{ color: colors.heading }}>Allow Cash on Delivery (COD)</p>
                  <p className="text-sm mt-1" style={{ color: colors.body }}>
                    Buyers can pay you cash when you arrive at their location
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSettings((prev) => ({ ...prev, cash_on_delivery_enabled: !prev.cash_on_delivery_enabled }))}
                className="relative w-12 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: settings.cash_on_delivery_enabled ? colors.accent : colors.border,
                }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow"
                  style={{ transform: settings.cash_on_delivery_enabled ? "translateX(24px)" : "translateX(4px)" }}
                />
              </button>
            </div>
          </div>
        </div>

        {settings.farmer_delivery_enabled && (
          <>
            {/* Pricing */}
            <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
              <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Pricing Formula</h2>

              <div className="p-3 mb-4 text-sm rounded" style={{ backgroundColor: colors.warningBg, color: colors.warning }}>
                <div className="flex items-start gap-2">
                  <Info size={16} className="mt-0.5 flex-shrink-0" />
                  <p>Fee = Base Fee + (Distance × Per-km Rate). Buyers can negotiate via order notes.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.heading }}>
                    Base Fee (IDR)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={settings.base_fee}
                    onChange={(e) => setSettings((prev) => ({ ...prev, base_fee: Number(e.target.value) }))}
                    className="w-full p-3 border text-sm outline-none"
                    style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.body }}>Fixed charge regardless of distance</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.heading }}>
                    Per-km Rate (IDR/km)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={settings.per_km_rate}
                    onChange={(e) => setSettings((prev) => ({ ...prev, per_km_rate: Number(e.target.value) }))}
                    className="w-full p-3 border text-sm outline-none"
                    style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.heading }}>
                    Max Delivery Radius (km)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={settings.max_radius_km}
                    onChange={(e) => setSettings((prev) => ({ ...prev, max_radius_km: Number(e.target.value) }))}
                    className="w-full p-3 border text-sm outline-none"
                    style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
                  />
                  <p className="text-xs mt-1" style={{ color: colors.body }}>
                    Buyers beyond this radius won't see farmer delivery option
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: colors.heading }}>
                    Free Delivery Minimum Order (IDR) — optional
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={settings.min_order_for_free ?? ""}
                    placeholder="Leave empty to disable"
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        min_order_for_free: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                    className="w-full p-3 border text-sm outline-none"
                    style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
              <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Notes for Buyers</h2>
              <textarea
                value={settings.notes ?? ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="E.g. Available Mon-Sat 8am-5pm. Can negotiate for bulk orders."
                className="w-full p-3 border text-sm resize-none outline-none"
                style={{ borderColor: colors.border, borderRadius: "4px", color: colors.heading }}
              />
            </div>

            {/* Fee Preview */}
            <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
              <h2 className="font-semibold mb-3" style={{ color: colors.heading }}>Fee Preview</h2>
              <div className="space-y-2">
                {[2, 5, 10, 20].map((km) => {
                  const fee = previewFee(km);
                  return (
                    <div key={km} className="flex justify-between text-sm">
                      <span style={{ color: colors.body }}>{km} km away</span>
                      <span style={{ color: fee === null ? colors.error : colors.accent }}>
                        {fee === null
                          ? "Out of range"
                          : formatCurrency(fee)}
                      </span>
                    </div>
                  );
                })}
              </div>
              {settings.min_order_for_free && (
                <p className="text-xs mt-3" style={{ color: colors.success }}>
                  Free delivery for orders ≥ {formatCurrency(settings.min_order_for_free)}
                </p>
              )}
            </div>
          </>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 transition-colors"
          style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
