"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Package, Star, MessageSquare, Check, Clock } from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch notifications when API is ready
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(false);
    // TODO: Implement when notifications API is ready
    // try {
    //   const token = localStorage.getItem("accessToken");
    //   const response = await fetch("/api/v1/notifications", {
    //     headers: { Authorization: `Bearer ${token}` },
    //   });
    //   const data = await response.json();
    //   if (response.ok) {
    //     setNotifications(data.data || []);
    //   }
    // } catch (error) {
    //   console.error("Failed to fetch notifications:", error);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Notifications
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{ borderColor: colors.accent, borderTopColor: "transparent" }}
            />
            <p style={{ color: colors.body }}>Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 border transition-colors hover:bg-gray-50"
                style={{
                  backgroundColor: notification.is_read
                    ? colors.white
                    : colors.successBg,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <div className="flex gap-4">
                  <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: "4px",
                    }}
                  >
                    {notification.type === "order" && (
                      <Package size={20} style={{ color: colors.accent }} />
                    )}
                    {notification.type === "review" && (
                      <Star size={20} style={{ color: colors.accent }} />
                    )}
                    {notification.type === "message" && (
                      <MessageSquare size={20} style={{ color: colors.accent }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium text-sm mb-1"
                      style={{ color: colors.heading }}
                    >
                      {notification.title}
                    </p>
                    <p className="text-sm mb-2" style={{ color: colors.body }}>
                      {notification.message}
                    </p>
                    <p className="text-xs flex items-center gap-1" style={{ color: colors.body }}>
                      <Clock size={12} />
                      {notification.time}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div
                      className="w-2 h-2 rounded-full shrink-0 mt-2"
                      style={{ backgroundColor: colors.accent }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bell
              size={64}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              No notifications yet
            </h2>
            <p className="mb-6" style={{ color: colors.body }}>
              We'll notify you about orders, messages, and updates
            </p>
            <Link
              href="/home"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
