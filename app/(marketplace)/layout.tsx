"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  ShoppingCart,
  User,
  Package,
  Menu,
  X,
  Leaf,
  Bell,
  MessageSquare,
  LogOut,
  ChevronDown,
  MapPin,
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
};

interface User {
  id: string;
  name: string;
  email: string;
  user_type: string;
}

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    checkAuth();
    if (!isAuthPage) {
      fetchCartCount();
    }
  }, [pathname]);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.data);
        // Redirect farmers to their dashboard
        if (data.data.user_type === "PRODUCER" && !isAuthPage) {
          router.push("/farmer/dashboard");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCartCount = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const response = await fetch("/api/v1/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok && data.data?.items) {
        setCartCount(data.data.items.length);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
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
      setUser(null);
      router.push("/login");
    }
  };

  // Don't show layout for auth pages
  if (isAuthPage) {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/products", label: "Products", icon: Package },
    { href: "/farmers", label: "Farmers", icon: MapPin },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/home" className="flex items-center gap-2">
              <Leaf size={24} style={{ color: colors.accent }} />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: colors.heading }}
              >
                Harvest
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium transition-colors"
                  style={{
                    color: pathname === item.href ? colors.accent : colors.body,
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              {/* Search */}
              <Link
                href="/search"
                className="p-2 transition-colors hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                <Search size={20} style={{ color: colors.body }} />
              </Link>

              {user ? (
                <>
                  {/* Notifications */}
                  <Link
                    href="/notifications"
                    className="p-2 transition-colors hover:bg-stone-100 hidden sm:block"
                    style={{ borderRadius: "4px" }}
                  >
                    <Bell size={20} style={{ color: colors.body }} />
                  </Link>

                  {/* Cart */}
                  <Link
                    href="/cart"
                    className="relative p-2 transition-colors hover:bg-stone-100"
                    style={{ borderRadius: "4px" }}
                  >
                    <ShoppingCart size={20} style={{ color: colors.body }} />
                    {cartCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-medium text-white"
                        style={{
                          backgroundColor: colors.accent,
                          borderRadius: "50%",
                        }}
                      >
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 p-2 transition-colors hover:bg-stone-100"
                      style={{ borderRadius: "4px" }}
                    >
                      <div
                        className="w-8 h-8 flex items-center justify-center text-sm font-medium"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.accent,
                          borderRadius: "50%",
                        }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <ChevronDown
                        size={16}
                        className="hidden sm:block"
                        style={{ color: colors.body }}
                      />
                    </button>

                    {showUserMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserMenu(false)}
                        />
                        <div
                          className="absolute right-0 top-full mt-2 w-56 z-50 border py-2"
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
                              className="text-sm font-medium"
                              style={{ color: colors.heading }}
                            >
                              {user.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: colors.body }}
                            >
                              {user.email}
                            </p>
                          </div>
                          <Link
                            href="/profile"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-stone-50"
                            style={{ color: colors.body }}
                          >
                            <User size={16} />
                            My Profile
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-stone-50"
                            style={{ color: colors.body }}
                          >
                            <Package size={16} />
                            My Orders
                          </Link>
                          <Link
                            href="/messages"
                            onClick={() => setShowUserMenu(false)}
                            className="flex items-center gap-3 px-4 py-2 text-sm transition-colors hover:bg-stone-50"
                            style={{ color: colors.body }}
                          >
                            <MessageSquare size={16} />
                            Messages
                          </Link>
                          <div
                            className="border-t my-1"
                            style={{ borderColor: colors.border }}
                          />
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2 text-sm w-full transition-colors hover:bg-stone-50"
                            style={{ color: colors.error }}
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{ color: colors.body }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.white,
                      borderRadius: "4px",
                    }}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 md:hidden transition-colors hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                {showMobileMenu ? (
                  <X size={20} style={{ color: colors.body }} />
                ) : (
                  <Menu size={20} style={{ color: colors.body }} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div
              className="md:hidden border-t py-4"
              style={{ borderColor: colors.border }}
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors"
                    style={{
                      color:
                        pathname === item.href ? colors.accent : colors.body,
                      backgroundColor:
                        pathname === item.href
                          ? colors.successBg
                          : "transparent",
                      borderRadius: "4px",
                    }}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t"
          style={{ backgroundColor: colors.white, borderColor: colors.border }}
        >
          <div className="flex items-center justify-around h-16">
            {[
              { href: "/home", icon: Home, label: "Home" },
              { href: "/products", icon: Search, label: "Browse" },
              {
                href: "/cart",
                icon: ShoppingCart,
                label: "Cart",
                badge: cartCount,
              },
              { href: "/orders", icon: Package, label: "Orders" },
              { href: "/profile", icon: User, label: "Profile" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-1 py-2 px-3 relative"
              >
                <item.icon
                  size={20}
                  style={{
                    color: pathname === item.href ? colors.accent : colors.body,
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    color: pathname === item.href ? colors.accent : colors.body,
                  }}
                >
                  {item.label}
                </span>
                {item.badge && item.badge > 0 && (
                  <span
                    className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-[10px] font-medium text-white"
                    style={{
                      backgroundColor: colors.accent,
                      borderRadius: "50%",
                    }}
                  >
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Bottom padding for mobile nav */}
      {user && <div className="h-16 md:hidden" />}
    </div>
  );
}
