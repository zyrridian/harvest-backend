"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  Moon,
  Globe,
  Shield,
  Key,
  Trash2,
  Loader2,
  ChevronRight,
  AlertCircle,
  CheckCircle,
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

interface NotificationPreferences {
  enable_push_notifications: boolean;
  enable_order_updates: boolean;
  enable_new_messages: boolean;
  enable_reviews: boolean;
  enable_promotions: boolean;
  enable_email_notifications: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enable_push_notifications: true,
    enable_order_updates: true,
    enable_new_messages: true,
    enable_reviews: true,
    enable_promotions: true,
    enable_email_notifications: true,
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/profile/settings");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/notification-settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.data) {
        setPreferences({
          enable_push_notifications: data.data.enablePushNotifications ?? true,
          enable_order_updates: data.data.enableOrderUpdates ?? true,
          enable_new_messages: data.data.enableNewMessages ?? true,
          enable_reviews: data.data.enableReviews ?? true,
          enable_promotions: data.data.enablePromotions ?? true,
          enable_email_notifications:
            data.data.enableEmailNotifications ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/v1/notification-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSuccess("Settings saved successfully");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to save settings");
      }
    } catch (error) {
      setError("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/v1/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Password changed successfully");
        setShowPasswordChange(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (error) {
      setError("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setIsDeleting(true);

    try {
      const response = await fetch("/api/v1/users/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password: deletePassword }),
      });

      if (response.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
      } else {
        const data = await response.json();
        setError(data.message || "Failed to delete account");
      }
    } catch (error) {
      setError("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
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

  return (
    <div
      className="min-h-screen pb-24 md:pb-8"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-40 border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-1 -ml-1"
              style={{ color: colors.heading }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1
              className="text-xl font-semibold"
              style={{ color: colors.heading }}
            >
              Settings
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Messages */}
        {error && (
          <div
            className="flex items-center gap-3 p-4 border"
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
            className="flex items-center gap-3 p-4 border"
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

        {/* Notification Settings */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.border }}
          >
            <Bell size={20} style={{ color: colors.accent }} />
            <h2 className="font-semibold" style={{ color: colors.heading }}>
              Notifications
            </h2>
          </div>

          <div className="p-4 space-y-4">
            <ToggleItem
              label="Push Notifications"
              description="Receive push notifications"
              checked={preferences.enable_push_notifications}
              onChange={() => handleToggle("enable_push_notifications")}
            />
            <ToggleItem
              label="Email Notifications"
              description="Receive notifications via email"
              checked={preferences.enable_email_notifications}
              onChange={() => handleToggle("enable_email_notifications")}
            />
            <ToggleItem
              label="Order Updates"
              description="Get notified about order status changes"
              checked={preferences.enable_order_updates}
              onChange={() => handleToggle("enable_order_updates")}
            />
            <ToggleItem
              label="New Messages"
              description="Get notified about new messages"
              checked={preferences.enable_new_messages}
              onChange={() => handleToggle("enable_new_messages")}
            />
            <ToggleItem
              label="Reviews"
              description="Get notified when you receive reviews"
              checked={preferences.enable_reviews}
              onChange={() => handleToggle("enable_reviews")}
            />
            <ToggleItem
              label="Promotions"
              description="Receive promotional offers"
              checked={preferences.enable_promotions}
              onChange={() => handleToggle("enable_promotions")}
            />

            <button
              onClick={savePreferences}
              disabled={isSaving}
              className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              {isSaving ? "Saving..." : "Save Notification Settings"}
            </button>
          </div>
        </div>

        {/* Security */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.border }}
          >
            <Shield size={20} style={{ color: colors.accent }} />
            <h2 className="font-semibold" style={{ color: colors.heading }}>
              Security
            </h2>
          </div>

          <div className="divide-y" style={{ borderColor: colors.border }}>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              className="w-full p-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <Key size={18} style={{ color: colors.body }} />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.heading }}
                  >
                    Change Password
                  </p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Update your account password
                  </p>
                </div>
              </div>
              <ChevronRight
                size={18}
                style={{
                  color: colors.body,
                  transform: showPasswordChange ? "rotate(90deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {showPasswordChange && (
              <form onSubmit={handlePasswordChange} className="p-4 space-y-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-1"
                    style={{ color: colors.heading }}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
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
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
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
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-sm border outline-none focus:border-green-600"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.error }}
          >
            <Trash2 size={20} style={{ color: colors.error }} />
            <h2 className="font-semibold" style={{ color: colors.error }}>
              Danger Zone
            </h2>
          </div>

          <div className="p-4">
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              Once you delete your account, there is no going back. Please be
              certain.
            </p>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full py-2.5 text-sm font-medium border transition-colors hover:bg-red-50"
                style={{
                  borderColor: colors.error,
                  color: colors.error,
                  borderRadius: "4px",
                }}
              >
                Delete Account
              </button>
            ) : (
              <div className="space-y-4">
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.error }}
                >
                  Enter your password to confirm:
                </p>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  className="w-full px-3 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.error,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="flex-1 py-2.5 text-sm font-medium border transition-colors"
                    style={{
                      borderColor: colors.border,
                      color: colors.body,
                      borderRadius: "4px",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || isDeleting}
                    className="flex-1 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                    style={{
                      backgroundColor: colors.error,
                      color: colors.white,
                      borderRadius: "4px",
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete Forever"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleItem({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium" style={{ color: colors.heading }}>
          {label}
        </p>
        <p className="text-xs" style={{ color: colors.body }}>
          {description}
        </p>
      </div>
      <button
        onClick={onChange}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{
          backgroundColor: checked ? colors.accent : colors.border,
        }}
      >
        <span
          className="absolute top-1 w-4 h-4 rounded-full transition-transform"
          style={{
            backgroundColor: colors.white,
            left: checked ? "calc(100% - 20px)" : "4px",
          }}
        />
      </button>
    </div>
  );
}
