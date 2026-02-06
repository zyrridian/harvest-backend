"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Heart,
  Package,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  Camera,
  Loader2,
  AlertCircle,
  CheckCircle,
  Leaf,
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
};

interface UserProfile {
  user_id: string;
  name: string;
  email: string;
  phone_number: string | null;
  avatar_url: string | null;
  user_type: string;
  is_verified: boolean;
  created_at: string;
  profile?: {
    bio: string | null;
    date_of_birth: string | null;
    gender: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postal_code: string | null;
    preferred_language: string;
    notification_preferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  stats?: {
    total_orders: number;
    total_spent: number;
    favorites_count: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/profile");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchProfile = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch("/api/v1/auth/me", { headers });

      if (response.status === 401) {
        router.push("/login?redirect=/profile");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
        setName(data.data.name || "");
        setPhoneNumber(data.data.phone_number || "");
        setBio(data.data.profile?.bio || "");
        setAddress(data.data.profile?.address || "");
        setCity(data.data.profile?.city || "");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/users/profile", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          name,
          phone_number: phoneNumber || null,
          bio: bio || null,
          address: address || null,
          city: city || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Profile updated successfully");
        setEditing(false);
        fetchProfile();
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/login");
  };

  if (loading) {
    return (
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
    );
  }

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <p className="mb-4" style={{ color: colors.error }}>
            Failed to load profile
          </p>
          <button
            onClick={fetchProfile}
            className="px-6 py-2 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      icon: Package,
      label: "My Orders",
      description: `${user.stats?.total_orders || 0} orders`,
      href: "/orders",
    },
    {
      icon: Heart,
      label: "Favorites",
      description: `${user.stats?.favorites_count || 0} items`,
      href: "/favorites",
    },
    {
      icon: MapPin,
      label: "Addresses",
      description: "Manage delivery addresses",
      href: "/addresses",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Notification preferences",
      href: "/notifications/settings",
    },
    {
      icon: MessageSquare,
      label: "Messages",
      description: "Chat with sellers",
      href: "/messages",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "Account settings",
      href: "/settings",
    },
  ];

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Avatar & basic info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-20 h-20 flex items-center justify-center overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  borderRadius: "4px",
                }}
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={32} style={{ color: colors.accent }} />
                )}
              </div>
              <button
                className="absolute -bottom-1 -right-1 w-8 h-8 flex items-center justify-center border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <Camera size={14} style={{ color: colors.body }} />
              </button>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="text-xl font-bold truncate"
                  style={{ color: colors.heading }}
                >
                  {user.name}
                </h1>
                {user.is_verified && (
                  <CheckCircle size={18} style={{ color: colors.success }} />
                )}
              </div>
              <p className="text-sm truncate" style={{ color: colors.body }}>
                {user.email}
              </p>
              <p className="text-xs mt-1" style={{ color: colors.body }}>
                Member since{" "}
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Stats */}
          {user.stats && (
            <div
              className="grid grid-cols-3 gap-4 mt-6 p-4 border"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="text-center">
                <p
                  className="text-xl font-bold"
                  style={{ color: colors.heading }}
                >
                  {user.stats.total_orders}
                </p>
                <p className="text-xs" style={{ color: colors.body }}>
                  Orders
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xl font-bold"
                  style={{ color: colors.heading }}
                >
                  {user.stats.favorites_count}
                </p>
                <p className="text-xs" style={{ color: colors.body }}>
                  Favorites
                </p>
              </div>
              <div className="text-center">
                <p
                  className="text-xl font-bold"
                  style={{ color: colors.accent }}
                >
                  IDR {(user.stats.total_spent / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs" style={{ color: colors.body }}>
                  Spent
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Messages */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 mb-6 border"
            style={{
              backgroundColor: colors.errorBg,
              borderColor: colors.error,
              borderRadius: "4px",
            }}
          >
            <AlertCircle size={18} style={{ color: colors.error }} />
            <p className="text-sm" style={{ color: colors.error }}>
              {error}
            </p>
          </div>
        )}

        {success && (
          <div
            className="flex items-center gap-3 p-4 mb-6 border"
            style={{
              backgroundColor: colors.successBg,
              borderColor: colors.success,
              borderRadius: "4px",
            }}
          >
            <CheckCircle size={18} style={{ color: colors.success }} />
            <p className="text-sm" style={{ color: colors.success }}>
              {success}
            </p>
          </div>
        )}

        {/* Profile info / Edit form */}
        <div
          className="border mb-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center justify-between"
            style={{ borderColor: colors.border }}
          >
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Personal Information
            </h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-sm font-medium"
                style={{ color: colors.accent }}
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="text-sm font-medium"
                style={{ color: colors.body }}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="p-4">
            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User size={18} style={{ color: colors.accent }} />
                  <div>
                    <p className="text-xs" style={{ color: colors.body }}>
                      Full Name
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.heading }}
                    >
                      {user.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail size={18} style={{ color: colors.accent }} />
                  <div>
                    <p className="text-xs" style={{ color: colors.body }}>
                      Email
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.heading }}
                    >
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.phone_number && (
                  <div className="flex items-center gap-3">
                    <Phone size={18} style={{ color: colors.accent }} />
                    <div>
                      <p className="text-xs" style={{ color: colors.body }}>
                        Phone
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.heading }}
                      >
                        {user.phone_number}
                      </p>
                    </div>
                  </div>
                )}

                {user.profile?.city && (
                  <div className="flex items-center gap-3">
                    <MapPin size={18} style={{ color: colors.accent }} />
                    <div>
                      <p className="text-xs" style={{ color: colors.body }}>
                        Location
                      </p>
                      <p
                        className="text-sm font-medium"
                        style={{ color: colors.heading }}
                      >
                        {user.profile.city}
                        {user.profile.state && `, ${user.profile.state}`}
                      </p>
                    </div>
                  </div>
                )}

                {user.profile?.bio && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: colors.body }}>
                      Bio
                    </p>
                    <p className="text-sm" style={{ color: colors.heading }}>
                      {user.profile.bio}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveProfile();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.heading }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
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
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                    placeholder="+62 812 3456 7890"
                  />
                </div>

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
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
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
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
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
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Menu items */}
        <div
          className="border divide-y"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-4 p-4 transition-colors hover:bg-gray-50"
              >
                <div
                  className="w-10 h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: "4px",
                  }}
                >
                  <Icon size={20} style={{ color: colors.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.heading }}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    {item.description}
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: colors.body }} />
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full mt-6 p-4 border flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:bg-red-50"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.error,
            color: colors.error,
            borderRadius: "4px",
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
