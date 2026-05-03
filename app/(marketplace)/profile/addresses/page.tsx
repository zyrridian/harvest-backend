"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  Star,
  Save,
  X,
  Crosshair,
  MapPin as MapPinIcon
} from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";


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
};

interface Address {
  address_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  province_id: number;
  city_id: number;
  district_id: number;
  province: string;
  city: string;
  district: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  notes: string;
  is_primary: boolean;
}

interface LocationData {
  id: number;
  name: string;
}

export default function AddressesPage() {
  const router = useRouter();
  
  // Views: list | form
  const [view, setView] = useState<"list" | "form">("list");
  
  // List State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [settingPrimary, setSettingPrimary] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Address>>({});
  const [loadingForm, setLoadingForm] = useState(false);
  const [formError, setFormError] = useState("");

  // Master Data State
  const [provinces, setProvinces] = useState<LocationData[]>([]);
  const [cities, setCities] = useState<LocationData[]>([]);
  const [districts, setDistricts] = useState<LocationData[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingGps, setLoadingGps] = useState(false);

  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });
  const [mapCenter, setMapCenter] = useState({ lat: -6.200000, lng: 106.816666 }); // Default Jakarta

  useEffect(() => {
    fetchAddresses();
  }, []);

  // --- API HELPERS ---
  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/profile/addresses");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  // --- LIST ACTIONS ---
  const fetchAddresses = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      setLoadingList(true);
      const response = await fetch("/api/v1/addresses", { headers });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoadingList(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setDeleting(addressId);
    try {
      const response = await fetch(`/api/v1/addresses/${addressId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    } finally {
      setDeleting(null);
    }
  };

  const setPrimary = async (addressId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setSettingPrimary(addressId);
    try {
      const response = await fetch(`/api/v1/addresses/${addressId}/primary`, {
        method: "PATCH",
        headers,
      });
      if (response.ok) {
        await fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set primary:", error);
    } finally {
      setSettingPrimary(null);
    }
  };

  // --- FORM VIEW INTERACTIONS ---

  const handleOpenForm = (address?: Address) => {
    setFormError("");
    if (address) {
      // Edit mode
      setFormData(address);
      if (address.latitude && address.longitude) {
        setMapCenter({ lat: address.latitude, lng: address.longitude });
      }
      loadProvinces();
      if (address.province_id) loadCities(address.province_id);
      if (address.city_id) loadDistricts(address.city_id);
    } else {
      // Add mode
      setFormData({ is_primary: addresses.length === 0 }); // Auto primary if first
      setCities([]);
      setDistricts([]);
      loadProvinces();
    }
    setView("form");
  };

  const handleCloseForm = () => {
    setView("list");
    setFormData({});
  };

  // --- MASTER DATA LOADING ---
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

  // Select Handlers
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
      setFormError("Geolocation is not supported by your browser");
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
      (error) => {
        console.error(error);
        setFormError("Unable to retrieve your location. Please check your browser permissions.");
        setLoadingGps(false);
      }
    );
  };

  // --- SAVE FORM ---
  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    const headers = getAuthHeaders();
    if (!headers) return;

    // Basic Validation
    if (!formData.label || !formData.recipient_name || !formData.phone || !formData.full_address || !formData.province_id || !formData.city_id || !formData.district_id || !formData.postal_code) {
      setFormError("Please fill out all required fields.");
      return;
    }

    setLoadingForm(true);
    try {
      const isEdit = !!formData.address_id;
      const url = isEdit ? `/api/v1/addresses/${formData.address_id}` : "/api/v1/addresses";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
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

      const data = await res.json();
      if (res.ok) {
        await fetchAddresses();
        handleCloseForm();
      } else {
        setFormError(data.message || "Something went wrong saving the address");
      }
    } catch (err) {
      setFormError("Network error. Please try again.");
    } finally {
      setLoadingForm(false);
    }
  };

  if (loadingList && view === "list") {
    return (
      <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: colors.background }}>
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  // --- RENDER FORM VIEW ---
  if (view === "form") {
    return (
      <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-16">
        <div className="border-b sticky top-0 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button type="button" onClick={handleCloseForm} className="p-1" style={{ color: colors.body }}>
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
                {formData.address_id ? "Edit Address" : "Add New Address"}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6">
          {formError && (
            <div className="p-3 mb-6 font-medium text-sm rounded-md" style={{ backgroundColor: "#fef2f2", color: colors.error, border: `1px solid #fecaca` }}>
              {formError}
            </div>
          )}

          <form onSubmit={saveAddress} className="space-y-6">
            {/* Address Label */}
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Address Label *
              </label>
              <select
                required
                value={formData.label || ""}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
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
                required
                value={formData.recipient_name || ""}
                onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
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
                required
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                required
                value={formData.postal_code || ""}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
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
                required
                rows={3}
                value={formData.full_address || ""}
                onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
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
                value={formData.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                id="is_primary"
                checked={formData.is_primary || false}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
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
              disabled={loadingForm}
              className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              {loadingForm ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              {formData.address_id ? "Save Changes" : "Save Address"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER LIST VIEW ---
  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-8">
      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-1" style={{ color: colors.body }}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
              My Addresses
            </h1>
          </div>
          <button
            onClick={() => handleOpenForm()}
            className="p-2 flex items-center gap-2 text-sm font-medium hover:bg-green-50 rounded-md transition-colors"
            style={{ color: colors.accent }}
          >
            <Plus size={20} />
            Add
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm mt-4">
            <MapPin size={48} className="mx-auto mb-4" style={{ color: colors.border }} />
            <h2 className="text-xl font-bold mb-2" style={{ color: colors.heading }}>No addresses yet</h2>
            <p className="mb-8" style={{ color: colors.body }}>Add your delivery addresses to make checkout faster</p>
            <button
              onClick={() => handleOpenForm()}
              className="inline-flex items-center gap-2 px-6 py-3 font-medium shadow hover:opacity-90 transition-opacity"
              style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "6px" }}
            >
              <Plus size={18} />
              Add New Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.address_id}
                className="p-5 border transition-all"
                style={{
                  backgroundColor: colors.white,
                  borderColor: addr.is_primary ? colors.accent : colors.border,
                  borderRadius: "8px",
                  boxShadow: addr.is_primary ? "0 4px 6px -1px rgba(22, 101, 52, 0.1)" : "none",
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-lg" style={{ color: colors.heading }}>
                      {addr.label}
                    </span>
                    {addr.is_primary && (
                      <span className="text-xs px-2.5 py-1 font-semibold flex items-center gap-1"
                        style={{ backgroundColor: colors.successBg, color: colors.success, borderRadius: "6px" }}
                      >
                       <CheckCircle size={14} /> Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleOpenForm(addr)} className="p-2.5 hover:bg-gray-100 rounded-full transition-colors" style={{ color: colors.body }}>
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => deleteAddress(addr.address_id)} disabled={deleting === addr.address_id} className="p-2.5 hover:bg-red-50 rounded-full transition-colors" style={{ color: colors.error }}>
                      {deleting === addr.address_id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="font-semibold" style={{ color: colors.heading }}>
                    {addr.recipient_name} <span className="text-gray-400 font-normal">| {addr.phone}</span>
                  </p>
                  <p className="text-sm mt-3 leading-relaxed" style={{ color: colors.body }}>
                    {addr.full_address}
                  </p>
                  <p className="text-sm text-gray-500 font-medium">
                    {addr.district}, {addr.city}, {addr.province} {addr.postal_code}
                  </p>
                  {addr.notes && (
                    <p className="text-sm italic mt-2 text-gray-400">
                      Note: {addr.notes}
                    </p>
                  )}
                </div>

                {!addr.is_primary && (
                  <div className="mt-5 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => setPrimary(addr.address_id)}
                      disabled={settingPrimary === addr.address_id}
                      className="text-sm font-semibold flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                      style={{ color: colors.accent }}
                    >
                      {settingPrimary === addr.address_id ? <Loader2 size={16} className="animate-spin" /> : <Star size={16} />}
                      Set as primary
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
