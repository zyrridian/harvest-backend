"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Store,
  AlertCircle,
  Camera,
  Save,
  Leaf,
  Award,
  Calendar,
  Check,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  errorBg: "#fee2e2",
  warning: "#ca8a04",
  warningBg: "#fef9c3",
};

interface UserProfile {
  id: string;
  email: string;
  user_type: string;
  profile?: {
    name: string;
    phone?: string;
    avatar_url?: string;
    address?: string;
    city?: string;
    state?: string;
  };
}

interface FarmerProfile {
  id: string;
  business_name: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_verified?: boolean;
  is_organic_certified?: boolean;
  specialties?: { id: string; name: string }[];
  established_year?: number;
  latitude?: number;
  longitude?: number;
  created_at: string;
}

const SPECIALTIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Eggs",
  "Meat",
  "Poultry",
  "Honey",
  "Herbs",
  "Grains",
  "Seafood",
  "Nuts",
  "Organic",
  "Mushrooms",
  "Flowers",
];

export default function FarmerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    logo_url: "",
    banner_url: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    established_year: "",
    is_organic_certified: false,
    specialties: [] as string[],
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      
      // Fetch user and farmer profile in parallel
      const [userRes, farmerRes] = await Promise.all([
        fetch("/api/v1/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/v1/farmer", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const userData = await userRes.json();
      if (userRes.ok) {
        setUser(userData.data);
      }

      if (farmerRes.ok) {
        const farmerData = await farmerRes.json();
        const f = farmerData.data;
        setFarmer(f);
        setFormData({
          business_name: f.business_name || "",
          description: f.description || "",
          logo_url: f.logo_url || "",
          banner_url: f.banner_url || "",
          address: f.address || "",
          city: f.city || "",
          state: f.state || "",
          zip_code: f.zip_code || "",
          phone: f.phone || "",
          email: f.email || "",
          established_year: f.established_year?.toString() || "",
          is_organic_certified: f.is_organic_certified || false,
          specialties: f.specialties?.map((s: any) => s.name) || [],
          latitude: f.latitude?.toString() || "",
          longitude: f.longitude?.toString() || "",
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          established_year: formData.established_year
            ? parseInt(formData.established_year)
            : undefined,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to save profile");
      }

      setFarmer(data.data);
      setSuccess("Profile saved successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSpecialty = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Farm Profile
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Manage your farm information and settings
          </p>
        </div>
        {farmer?.is_verified && (
          <div
            className="flex items-center gap-2 px-3 py-1"
            style={{
              backgroundColor: colors.successBg,
              borderRadius: "4px",
            }}
          >
            <Award size={16} style={{ color: colors.success }} />
            <span className="text-sm font-medium" style={{ color: colors.success }}>
              Verified Farmer
            </span>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div
          className="p-4 border flex items-center gap-3"
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <AlertCircle size={20} style={{ color: colors.error }} />
          <p style={{ color: colors.error }}>{error}</p>
          <button
            onClick={() => setError("")}
            className="ml-auto"
            style={{ color: colors.error }}
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div
          className="p-4 border flex items-center gap-3"
          style={{
            backgroundColor: colors.successBg,
            borderColor: colors.success,
            borderRadius: "4px",
          }}
        >
          <Check size={20} style={{ color: colors.success }} />
          <p style={{ color: colors.success }}>{success}</p>
          <button
            onClick={() => setSuccess("")}
            className="ml-auto"
            style={{ color: colors.success }}
          >
            ×
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Banner & Logo */}
        <div
          className="border overflow-hidden"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          {/* Banner */}
          <div
            className="h-40 relative"
            style={{
              backgroundColor: colors.background,
              backgroundImage: formData.banner_url
                ? `url(${formData.banner_url})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-3 right-3">
              <label className="cursor-pointer">
                <div
                  className="flex items-center gap-2 px-3 py-2 text-sm"
                  style={{
                    backgroundColor: colors.white,
                    borderRadius: "4px",
                    color: colors.body,
                  }}
                >
                  <Camera size={16} />
                  Change Banner
                </div>
              </label>
            </div>
          </div>

          {/* Logo & Name */}
          <div className="p-6 -mt-12 relative">
            <div className="flex items-end gap-4">
              <div
                className="w-24 h-24 border-4 border-white flex items-center justify-center relative"
                style={{
                  backgroundColor: formData.logo_url ? "transparent" : colors.successBg,
                  backgroundImage: formData.logo_url
                    ? `url(${formData.logo_url})`
                    : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                }}
              >
                {!formData.logo_url && (
                  <Store size={32} style={{ color: colors.accent }} />
                )}
              </div>
              <div className="flex-1 pb-2">
                <h2 className="text-xl font-bold" style={{ color: colors.heading }}>
                  {formData.business_name || "Your Farm Name"}
                </h2>
                {user?.email && (
                  <p className="text-sm" style={{ color: colors.body }}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div
          className="p-6 border space-y-4"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium" style={{ color: colors.heading }}>
            Basic Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Farm/Business Name *
              </label>
              <input
                type="text"
                value={formData.business_name}
                onChange={(e) =>
                  setFormData({ ...formData, business_name: e.target.value })
                }
                required
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Established Year
              </label>
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.body }}
                />
                <input
                  type="number"
                  value={formData.established_year}
                  onChange={(e) =>
                    setFormData({ ...formData, established_year: e.target.value })
                  }
                  placeholder="e.g. 2010"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: colors.heading }}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={4}
              placeholder="Tell customers about your farm..."
              className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700 resize-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Banner URL
              </label>
              <input
                type="url"
                value={formData.banner_url}
                onChange={(e) =>
                  setFormData({ ...formData, banner_url: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div
          className="p-6 border space-y-4"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium" style={{ color: colors.heading }}>
            Contact Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Business Phone
              </label>
              <div className="relative">
                <Phone
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.body }}
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+62..."
                  className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Business Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.body }}
                />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="farm@example.com"
                  className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div
          className="p-6 border space-y-4"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium" style={{ color: colors.heading }}>
            Location
          </h3>

          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: colors.heading }}
            >
              Address
            </label>
            <div className="relative">
              <MapPin
                size={18}
                className="absolute left-3 top-3"
                style={{ color: colors.body }}
              />
              <textarea
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={2}
                placeholder="Street address..."
                className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700 resize-none"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                State/Province
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Zip Code
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) =>
                  setFormData({ ...formData, zip_code: e.target.value })
                }
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Latitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) =>
                  setFormData({ ...formData, latitude: e.target.value })
                }
                placeholder="e.g. -6.2088"
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: colors.heading }}
              >
                Longitude
              </label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) =>
                  setFormData({ ...formData, longitude: e.target.value })
                }
                placeholder="e.g. 106.8456"
                className="w-full px-3 py-2 border outline-none transition-colors focus:border-green-700"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div
          className="p-6 border space-y-4"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium" style={{ color: colors.heading }}>
            Specialties
          </h3>
          <p className="text-sm" style={{ color: colors.body }}>
            Select the types of products you specialize in
          </p>

          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((specialty) => {
              const isSelected = formData.specialties.includes(specialty);
              return (
                <button
                  key={specialty}
                  type="button"
                  onClick={() => toggleSpecialty(specialty)}
                  className="px-4 py-2 text-sm border transition-colors"
                  style={{
                    backgroundColor: isSelected ? colors.accent : "transparent",
                    borderColor: isSelected ? colors.accent : colors.border,
                    color: isSelected ? colors.white : colors.body,
                    borderRadius: "4px",
                  }}
                >
                  {specialty}
                </button>
              );
            })}
          </div>
        </div>

        {/* Certifications */}
        <div
          className="p-6 border space-y-4"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h3 className="font-medium" style={{ color: colors.heading }}>
            Certifications
          </h3>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_organic_certified}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  is_organic_certified: e.target.checked,
                })
              }
              className="w-5 h-5 rounded border-2"
              style={{ accentColor: colors.accent }}
            />
            <div className="flex items-center gap-2">
              <Leaf size={18} style={{ color: colors.accent }} />
              <span style={{ color: colors.heading }}>Organic Certified</span>
            </div>
          </label>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 font-medium flex items-center gap-2 transition-colors"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            {isSaving ? (
              <>
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: colors.white, borderTopColor: "transparent" }}
                />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
