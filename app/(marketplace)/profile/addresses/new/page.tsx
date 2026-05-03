"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, Save, Crosshair, CheckCircle } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

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

interface LocationData {
  id: number;
  name: string;
}

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
    province_id: undefined as number | undefined,
    city_id: undefined as number | undefined,
    district_id: undefined as number | undefined,
    postal_code: "",
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    notes: "",
    is_primary: false,
  });

  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [cities, setCities] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const [mapCenter, setMapCenter] = useState({ lat: -6.200000, lng: 106.816666 });

  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const res = await fetch("/api/v1/master/provinces");
      const data = await res.json();
      if (data.status === "success") setProvinces(data.data || []);
    } catch (err) {
      console.error("Failed to load provinces", err);
    }
  };

  const loadCities = async (provinceId: number) => {
    try {
      setLoadingLocations(true);
      const res = await fetch(`/api/v1/master/cities?province_id=${provinceId}`);
      const data = await res.json();
      if (data.status === "success") setCities(data.data || []);
    } catch (err) {
      console.error("Failed to load cities", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const loadDistricts = async (cityId: number) => {
    try {
      setLoadingLocations(true);
      const res = await fetch(`/api/v1/master/districts?city_id=${cityId}`);
      const data = await res.json();
      if (data.status === "success") setDistricts(data.data || []);
    } catch (err) {
      console.error("Failed to load districts", err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const onProvinceChange = (provinceId: number) => {
    setFormData((prev) => ({ ...prev, province_id: provinceId, city_id: undefined, district_id: undefined }));
    setCities([]);
    setDistricts([]);
    if (provinceId) loadCities(provinceId);
  };

  const onCityChange = (cityId: number) => {
    setFormData((prev) => ({ ...prev, city_id: cityId, district_id: undefined }));
    setDistricts([]);
    if (cityId) loadDistricts(cityId);
  };

  const onDistrictChange = (districtId: number) => {
    setFormData((prev) => ({ ...prev, district_id: districtId }));
  };

  const captureCoordinates = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    setLoadingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setMapCenter({ lat, lng });
        setLoadingGps(false);
      },
      (err) => {
        console.error(err);
        setError("Unable to retrieve your location. Please check your browser permissions.");
        setLoadingGps(false);
      }
    );
  };

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
      !formData.postal_code ||
      !formData.province_id ||
      !formData.city_id ||
      !formData.district_id
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
        body: JSON.stringify({
          label: formData.label,
          recipient_name: formData.recipient_name,
          phone: formData.phone,
          full_address: formData.full_address,
          province_id: formData.province_id,
          city_id: formData.city_id,
          district_id: formData.district_id,
          postal_code: formData.postal_code,
          latitude: formData.latitude,
          longitude: formData.longitude,
          notes: formData.notes || "",
          is_primary: formData.is_primary || false,
        }),
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
      className="min-h-screen pb-16"
    >
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
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
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <div
            className="p-3 mb-6 font-medium text-sm rounded-md"
            style={{ backgroundColor: "#fef2f2", color: colors.error, border: `1px solid #fecaca` }}
          >
            {error}
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
            <select
              required
              value={formData.province_id || ""}
              onChange={(e) => onProvinceChange(Number(e.target.value))}
              className="w-full p-3 border text-sm bg-white"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            >
              <option value="" disabled>Select Province</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              City / Regency * {loadingLocations && <Loader2 size={12} className="inline animate-spin text-gray-400" />}
            </label>
            <select
              required
              disabled={!formData.province_id || cities.length === 0}
              value={formData.city_id || ""}
              onChange={(e) => onCityChange(Number(e.target.value))}
              className="w-full p-3 border text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            >
              <option value="" disabled>Select City</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              District * {loadingLocations && <Loader2 size={12} className="inline animate-spin text-gray-400" />}
            </label>
            <select
              required
              disabled={!formData.city_id || districts.length === 0}
              value={formData.district_id || ""}
              onChange={(e) => onDistrictChange(Number(e.target.value))}
              className="w-full p-3 border text-sm bg-white disabled:bg-gray-50 disabled:text-gray-400"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            >
              <option value="" disabled>Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
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

          {/* Map Location */}
          <div className="min-h-[350px]">
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-sm font-medium"
                style={{ color: colors.heading }}
              >
                Map Location (Pinpoint precise location) *
              </label>
              <button
                type="button"
                onClick={captureCoordinates}
                disabled={loadingGps}
                className="text-sm font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                style={{ color: colors.accent }}
              >
                {loadingGps ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
                Auto Detect
              </button>
            </div>
            
            <div className="w-full h-[300px] border overflow-hidden bg-gray-100 relative" style={{ borderRadius: "4px", borderColor: colors.border }}>
               {!isMapLoaded ? (
                  <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm gap-2">
                     <Loader2 className="animate-spin" size={20} /> Loading Google Maps...
                  </div>
               ) : (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={mapCenter}
                    zoom={16}
                    onClick={(e) => {
                      if (e.latLng) {
                        setFormData((prev) => ({ ...prev, latitude: e.latLng!.lat(), longitude: e.latLng!.lng() }));
                      }
                    }}
                    options={{ disableDefaultUI: true, zoomControl: true }}
                  >
                    {formData.latitude && formData.longitude && (
                       <Marker position={{ lat: formData.latitude, lng: formData.longitude }} />
                    )}
                  </GoogleMap>
               )}
            </div>
            {!formData.latitude && (
                <p className="text-xs font-semibold mt-1" style={{ color: colors.error }}>
                  Please tap on the map to place a pin for your exact house location.
                </p>
            )}
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
