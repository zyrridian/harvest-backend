"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, AlertCircle } from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
  error: "#dc2626",
  errorBg: "#fef2f2",
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (data.data.user.user_type !== "ADMIN") {
        throw new Error("Access denied. Admin privileges required.");
      }

      localStorage.setItem("accessToken", data.data.access_token);
      localStorage.setItem("refreshToken", data.data.refresh_token);

      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: colors.background }}
    >
      <div className="w-full max-w-md">
        <div
          className="border p-8"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Leaf size={32} style={{ color: colors.accent }} />
              <span
                className="text-2xl font-bold tracking-tight"
                style={{ color: colors.heading }}
              >
                Harvest
              </span>
            </div>
            <h2 className="text-xl font-bold" style={{ color: colors.heading }}>
              Admin Panel
            </h2>
            <p className="text-sm mt-2" style={{ color: colors.body }}>
              Sign in to manage your platform
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 border flex items-start gap-3"
              style={{
                backgroundColor: colors.errorBg,
                borderColor: colors.error,
                borderRadius: "4px",
              }}
            >
              <AlertCircle
                size={18}
                style={{ color: colors.error }}
                className="flex-shrink-0 mt-0.5"
              />
              <p className="text-sm" style={{ color: colors.error }}>
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 text-sm border outline-none transition-colors"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="admin@harvest.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 text-sm border outline-none transition-colors"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = colors.accentHover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.accent;
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: colors.body }}>
              Admin access only
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
