"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, MapPin, Phone, Camera, Check, ArrowRight } from "lucide-react";

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
};

const specialtyOptions = [
  "Vegetables",
  "Fruits",
  "Grains",
  "Dairy",
  "Eggs",
  "Meat",
  "Poultry",
  "Honey",
  "Herbs",
  "Organic Produce",
  "Hydroponics",
  "Mushrooms",
];

export default function FarmerOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone_number: "",
    address: "",
    city: "",
    state: "",
    latitude: null as number | null,
    longitude: null as number | null,
    specialties: [] as string[],
    profile_image: "",
    cover_image: "",
  });

  const handleSpecialtyToggle = (specialty: string) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        },
      );
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/farmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create profile");
      }

      router.push("/farmer/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return formData.name.trim().length >= 2;
    if (step === 2) return formData.specialties.length > 0;
    if (step === 3) return true; // Location is optional
    return true;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-lg border"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-3 mb-4">
            <Leaf size={32} style={{ color: colors.accent }} />
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: colors.heading }}
              >
                Welcome to Harvest
              </h1>
              <p className="text-sm" style={{ color: colors.body }}>
                Let's set up your farmer profile
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex-1 flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: s <= step ? colors.accent : colors.border,
                    color: s <= step ? colors.white : colors.body,
                  }}
                >
                  {s < step ? <Check size={16} /> : s}
                </div>
                {s < 3 && (
                  <div
                    className="flex-1 h-1"
                    style={{
                      backgroundColor: s < step ? colors.accent : colors.border,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div
              className="mb-4 p-3 text-sm"
              style={{
                backgroundColor: "#fee2e2",
                color: colors.error,
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: colors.heading }}
              >
                Basic Information
              </h2>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  Farm/Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Green Valley Farm"
                  className="w-full px-4 py-3 border outline-none transition-colors focus:border-green-700"
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Tell customers about your farm..."
                  rows={4}
                  className="w-full px-4 py-3 border outline-none transition-colors focus:border-green-700 resize-none"
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
                  Phone Number
                </label>
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: colors.body }}
                  />
                  <input
                    type="tel"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone_number: e.target.value,
                      }))
                    }
                    placeholder="+62 812 3456 7890"
                    className="w-full pl-10 pr-4 py-3 border outline-none transition-colors focus:border-green-700"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Specialties */}
          {step === 2 && (
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: colors.heading }}
              >
                What do you produce?
              </h2>
              <p className="text-sm mb-4" style={{ color: colors.body }}>
                Select all that apply
              </p>

              <div className="grid grid-cols-2 gap-2">
                {specialtyOptions.map((specialty) => {
                  const isSelected = formData.specialties.includes(specialty);
                  return (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => handleSpecialtyToggle(specialty)}
                      className="flex items-center gap-2 px-4 py-3 border text-left transition-colors"
                      style={{
                        borderColor: isSelected ? colors.accent : colors.border,
                        backgroundColor: isSelected
                          ? colors.successBg
                          : "transparent",
                        color: isSelected ? colors.accent : colors.body,
                        borderRadius: "4px",
                      }}
                    >
                      <div
                        className="w-5 h-5 border rounded flex items-center justify-center flex-shrink-0"
                        style={{
                          borderColor: isSelected
                            ? colors.accent
                            : colors.border,
                          backgroundColor: isSelected
                            ? colors.accent
                            : "transparent",
                        }}
                      >
                        {isSelected && <Check size={14} color={colors.white} />}
                      </div>
                      <span className="text-sm font-medium">{specialty}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-4">
              <h2
                className="text-lg font-semibold mb-2"
                style={{ color: colors.heading }}
              >
                Farm Location
              </h2>
              <p className="text-sm mb-4" style={{ color: colors.body }}>
                Help customers find you nearby
              </p>

              <button
                type="button"
                onClick={getLocation}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border transition-colors"
                style={{
                  borderColor: formData.latitude
                    ? colors.accent
                    : colors.border,
                  backgroundColor: formData.latitude
                    ? colors.successBg
                    : "transparent",
                  color: formData.latitude ? colors.accent : colors.body,
                  borderRadius: "4px",
                }}
              >
                <MapPin size={18} />
                {formData.latitude ? "Location detected" : "Detect my location"}
              </button>

              <div className="grid grid-cols-2 gap-4">
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
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    placeholder="Jakarta"
                    className="w-full px-4 py-3 border outline-none transition-colors focus:border-green-700"
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
                      setFormData((prev) => ({
                        ...prev,
                        state: e.target.value,
                      }))
                    }
                    placeholder="DKI Jakarta"
                    className="w-full px-4 py-3 border outline-none transition-colors focus:border-green-700"
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
                  Full Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Street address, village, district..."
                  rows={3}
                  className="w-full px-4 py-3 border outline-none transition-colors focus:border-green-700 resize-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-6 border-t flex items-center justify-between"
          style={{ borderColor: colors.border }}
        >
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-sm font-medium"
              style={{ color: colors.body }}
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              Continue
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              {isLoading ? "Creating..." : "Complete Setup"}
              <Check size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
