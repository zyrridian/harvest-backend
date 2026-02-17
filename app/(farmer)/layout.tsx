"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  User,
  Users,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  Bell,
  ChevronDown,
  Plus,
  Store,
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

interface UserData {
  id: string;
  name: string;
  email: string;
  user_type: string;
  avatar_url?: string;
}

interface FarmerProfile {
  id: string;
  name: string;
  profile_image?: string;
  is_verified: boolean;
}

export default function FarmerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [farmer, setFarmer] = useState<FarmerProfile | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  const isOnboardingPage = pathname === "/farmer/onboarding";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Check user authentication
      const userResponse = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userResponse.json();

      if (!userResponse.ok) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
        return;
      }

      // Only producers can access farmer dashboard
      if (userData.data.user_type !== "PRODUCER") {
        router.push("/home");
        return;
      }

      setUser(userData.data);

      // Check if farmer profile exists
      const farmerResponse = await fetch("/api/v1/farmer", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const farmerData = await farmerResponse.json();

      if (farmerResponse.ok) {
        setFarmer(farmerData.data);
      } else if (farmerResponse.status === 404) {
        // Farmer profile doesn't exist, need onboarding
        setNeedsOnboarding(true);
        if (!isOnboardingPage) {
          router.push("/farmer/onboarding");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      router.push("/login");
    }
  };

  const navItems = [
    { href: "/farmer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/farmer/products", label: "Products", icon: Package },
    { href: "/farmer/orders", label: "Orders", icon: ShoppingCart },
    { href: "/farmer/community", label: "Community", icon: Users },
    { href: "/farmer/reviews", label: "Reviews", icon: Star },
    { href: "/farmer/profile", label: "Profile", icon: Store },
    { href: "/farmer/settings", label: "Settings", icon: Settings },
  ];

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.accent,
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: colors.body }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show onboarding page without layout
  if (needsOnboarding && isOnboardingPage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Top Header */}
      <header
        className="fixed top-0 left-0 right-0 h-16 border-b z-40"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? (
                <X size={24} style={{ color: colors.heading }} />
              ) : (
                <Menu size={24} style={{ color: colors.heading }} />
              )}
            </button>
            <Link href="/farmer/dashboard" className="flex items-center gap-2">
              <Leaf size={28} style={{ color: colors.accent }} />
              <span
                className="text-xl font-bold hidden sm:block"
                style={{ color: colors.heading }}
              >
                Harvest
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: colors.successBg,
                  color: colors.accent,
                }}
              >
                Farmer
              </span>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Quick Actions */}
            <Link
              href="/farmer/products/new"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              <Plus size={16} />
              Add Product
            </Link>

            {/* Notifications */}
            <button className="relative p-2" style={{ color: colors.body }}>
              <Bell size={20} />
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 text-xs flex items-center justify-center rounded-full"
                style={{ backgroundColor: colors.error, color: colors.white }}
              >
                3
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 p-1.5 rounded transition-colors"
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  backgroundColor: showUserMenu
                    ? colors.background
                    : "transparent",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: colors.successBg,
                    color: colors.accent,
                  }}
                >
                  {farmer?.profile_image ? (
                    <img
                      src={farmer.profile_image}
                      alt={farmer.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    (farmer?.name || user?.name || "F").charAt(0).toUpperCase()
                  )}
                </div>
                <ChevronDown size={16} style={{ color: colors.body }} />
              </button>

              {showUserMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 py-2 border shadow-lg"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <div
                    className="px-4 py-2 border-b"
                    style={{ borderColor: colors.border }}
                  >
                    <p
                      className="font-medium"
                      style={{ color: colors.heading }}
                    >
                      {farmer?.name || user?.name}
                    </p>
                    <p className="text-sm" style={{ color: colors.body }}>
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    href="/home"
                    className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: colors.body }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Store size={16} />
                    View Marketplace
                  </Link>
                  <Link
                    href="/farmer/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: colors.body }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    href="/farmer/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: colors.body }}
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    Settings
                  </Link>
                  <div
                    className="border-t my-1"
                    style={{ borderColor: colors.border }}
                  />
                  <button
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-gray-50"
                    style={{ color: colors.error }}
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div
          className="fixed inset-0 z-30 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-64 border-r z-30 transform transition-transform lg:transform-none ${
          showMobileMenu ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded transition-colors"
                style={{
                  backgroundColor: isActive ? colors.successBg : "transparent",
                  color: isActive ? colors.accent : colors.body,
                }}
                onClick={() => setShowMobileMenu(false)}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 border-t"
          style={{ borderColor: colors.border }}
        >
          <p className="text-xs text-center" style={{ color: colors.body }}>
            © 2026 Harvest
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
