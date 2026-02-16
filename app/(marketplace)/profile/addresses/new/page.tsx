"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, CheckCircle } from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  error: "#dc2626",
  errorBg: "#fee2e2",
};

function NewAddressForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/profile/addresses";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    full_address: "",
    province: "",
    province_id: 1,
    city: "",
    city_id: 1,
    district: "",
    district_id: 1,
    subdistrict: "",
    postal_code: "",
    notes: "",
    is_primary: false,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/profile/addresses/new`);
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.label ||
      !formData.recipient_name ||
      !formData.phone ||
      !formData.full_address ||
      !formData.postal_code
    ) {
      setError("Please fill in all required fields");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/v1/addresses", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add address");
      }

      router.push(redirect);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-8"
    >
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1"
            style={{ color: colors.body }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
            Add New Address
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div
            className="p-4 mb-6 flex items-center gap-3"
            style={{
              backgroundColor: colors.errorBg,
              borderRadius: "4px",
            }}
          >
            <AlertCircle size={20} style={{ color: colors.error }} />
            <p className="text-sm" style={{ color: colors.error }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Label */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Address Label *
            </label>
            <select
              name="label"
              value={formData.label}
              onChange={handleChange}
              required
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            >
              <option value="">Select label</option>
              <option value="Home">Home</option>
              <option value="Office">Office</option>
              <option value="Apartment">Apartment</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Recipient Name */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Recipient Name *
            </label>
            <input
              type="text"
              name="recipient_name"
              value={formData.recipient_name}
              onChange={handleChange}
              required
              placeholder="Full name of recipient"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Phone */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+62812345678"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Province */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Province *
            </label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              placeholder="e.g., DKI Jakarta"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* City */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              City *
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
              placeholder="e.g., Jakarta Selatan"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* District */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              District *
            </label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              required
              placeholder="e.g., Kebayoran Baru"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Subdistrict */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Subdistrict
            </label>
            <input
              type="text"
              name="subdistrict"
              value={formData.subdistrict}
              onChange={handleChange}
              placeholder="e.g., Senayan"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Full Address */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Full Address *
            </label>
            <textarea
              name="full_address"
              value={formData.full_address}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Street name, building, unit number, etc."
              className="w-full p-3 border text-sm resize-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Postal Code */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Postal Code *
            </label>
            <input
              type="text"
              name="postal_code"
              value={formData.postal_code}
              onChange={handleChange}
              required
              placeholder="12345"
              className="w-full p-3 border text-sm"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Delivery Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Gate code, landmarks, special instructions..."
              className="w-full p-3 border text-sm resize-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          {/* Set as Primary */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_primary"
              id="is_primary"
              checked={formData.is_primary}
              onChange={handleChange}
              className="w-5 h-5"
              style={{ accentColor: colors.accent }}
            />
            <label
              htmlFor="is_primary"
              className="text-sm"
              style={{ color: colors.heading }}
            >
              Set as primary address
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Save Address
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function NewAddressPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <NewAddressForm />
    </Suspense>
  );
}
