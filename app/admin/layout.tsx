"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Sprout,
  MessageSquare,
  FolderTree,
  LogOut,
  Menu,
  X,
  Leaf,
} from "lucide-react";

// Design System Colors (matching landing page)
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  accentHover: "#14532d",
  border: "#E4E4E7",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(!!token);
      setLoading(false);
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-base font-medium" style={{ color: colors.body }}>
          Loading...
        </div>
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Categories", href: "/admin/categories", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Farmers", href: "/admin/farmers", icon: Sprout },
    { name: "Community", href: "/admin/community", icon: MessageSquare },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 border-b flex items-center justify-between px-4"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="flex items-center gap-2">
          <Leaf size={24} style={{ color: colors.accent }} />
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: colors.heading }}
          >
            Harvest Admin
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <X size={24} style={{ color: colors.heading }} />
          ) : (
            <Menu size={24} style={{ color: colors.heading }} />
          )}
        </button>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r transform transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div
            className="p-6 border-b hidden lg:block"
            style={{ borderColor: colors.border }}
          >
            <div className="flex items-center gap-2">
              <Leaf size={24} style={{ color: colors.accent }} />
              <span
                className="text-xl font-bold tracking-tight"
                style={{ color: colors.heading }}
              >
                Harvest Admin
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 mt-16 lg:mt-0">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? colors.background
                      : "transparent",
                    color: isActive ? colors.accent : colors.body,
                    borderRadius: "4px",
                  }}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t" style={{ borderColor: colors.border }}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-stone-50"
              style={{
                color: colors.body,
                borderRadius: "4px",
              }}
            >
              <LogOut size={18} strokeWidth={1.5} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
