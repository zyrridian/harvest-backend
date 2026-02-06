"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, AlertCircle, Eye, EyeOff } from "lucide-react";

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
  errorBg: "#fee2e2",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.data.access_token);
      localStorage.setItem("refreshToken", data.data.refresh_token);

      // Redirect based on user type
      if (data.data.user.user_type === "PRODUCER") {
        router.push("/farmer/dashboard");
      } else if (data.data.user.user_type === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/home");
      }
    } catch (err: any) {
      setError(err.message);
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
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <Leaf size={32} style={{ color: colors.accent }} />
            <span
              className="text-2xl font-bold tracking-tight"
              style={{ color: colors.heading }}
            >
              Harvest
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: colors.body }}>
            Fresh produce directly from local farms
          </p>
        </div>

        {/* Login Card */}
        <div
          className="border p-8"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <h1
            className="text-xl font-bold mb-6"
            style={{ color: colors.heading }}
          >
            Welcome back
          </h1>

          {error && (
            <div
              className="flex items-start gap-3 p-4 mb-6 border"
              style={{
                backgroundColor: colors.errorBg,
                borderColor: colors.error,
                borderRadius: "4px",
              }}
            >
              <AlertCircle
                size={18}
                className="flex-shrink-0 mt-0.5"
                style={{ color: colors.error }}
              />
              <p className="text-sm" style={{ color: colors.error }}>
                {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border outline-none transition-colors focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="you@example.com"
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
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 pr-12 text-sm border outline-none transition-colors focus:border-green-600"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff size={18} style={{ color: colors.body }} />
                  ) : (
                    <Eye size={18} style={{ color: colors.body }} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: colors.accent }}
                />
                <span className="text-sm" style={{ color: colors.body }}>
                  Remember me
                </span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium"
                style={{ color: colors.accent }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 border-t text-center"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium"
                style={{ color: colors.accent }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm" style={{ color: colors.body }}>
          <Link href="/" className="hover:underline">
            ← Back to Harvest
          </Link>
        </p>
      </div>
    </div>
  );
}
