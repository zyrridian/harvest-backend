"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, AlertCircle, Eye, EyeOff, Check } from "lucide-react";

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
};

type UserType = "CONSUMER" | "PRODUCER";

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("CONSUMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone_number: phoneNumber || undefined,
          user_type: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Store tokens
      localStorage.setItem("accessToken", data.data.access_token);
      localStorage.setItem("refreshToken", data.data.refresh_token);

      // Redirect based on user type
      if (userType === "PRODUCER") {
        router.push("/farmer/onboarding");
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
      className="min-h-screen flex items-center justify-center p-4 py-12"
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
            Join our community of local food enthusiasts
          </p>
        </div>

        {/* Register Card */}
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
            Create your account
          </h1>

          {/* Account Type Selection */}
          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{ color: colors.heading }}
            >
              I want to...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUserType("CONSUMER")}
                className="p-4 border text-left transition-colors"
                style={{
                  borderColor:
                    userType === "CONSUMER" ? colors.accent : colors.border,
                  backgroundColor:
                    userType === "CONSUMER" ? colors.successBg : colors.white,
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🛒</span>
                  {userType === "CONSUMER" && (
                    <Check size={16} style={{ color: colors.accent }} />
                  )}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.heading }}
                >
                  Buy Products
                </p>
                <p className="text-xs mt-1" style={{ color: colors.body }}>
                  Shop fresh produce from local farmers
                </p>
              </button>
              <button
                type="button"
                onClick={() => setUserType("PRODUCER")}
                className="p-4 border text-left transition-colors"
                style={{
                  borderColor:
                    userType === "PRODUCER" ? colors.accent : colors.border,
                  backgroundColor:
                    userType === "PRODUCER" ? colors.successBg : colors.white,
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">🌾</span>
                  {userType === "PRODUCER" && (
                    <Check size={16} style={{ color: colors.accent }} />
                  )}
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.heading }}
                >
                  Sell Products
                </p>
                <p className="text-xs mt-1" style={{ color: colors.body }}>
                  List and sell your farm produce
                </p>
              </button>
            </div>
          </div>

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
                htmlFor="name"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Full name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border outline-none transition-colors focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="John Doe"
              />
            </div>

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
                htmlFor="phone"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Phone number{" "}
                <span style={{ color: colors.body }}>(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 text-sm border outline-none transition-colors focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="+62 812 3456 7890"
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
                  minLength={8}
                  className="w-full px-4 py-3 pr-12 text-sm border outline-none transition-colors focus:border-green-600"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  placeholder="Minimum 8 characters"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
                style={{ color: colors.heading }}
              >
                Confirm password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 text-sm border outline-none transition-colors focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
                placeholder="Re-enter your password"
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5"
                style={{ accentColor: colors.accent }}
              />
              <span className="text-sm" style={{ color: colors.body }}>
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium underline"
                  style={{ color: colors.accent }}
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium underline"
                  style={{ color: colors.accent }}
                >
                  Privacy Policy
                </Link>
              </span>
            </label>

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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div
            className="mt-6 pt-6 border-t text-center"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium"
                style={{ color: colors.accent }}
              >
                Sign in
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
