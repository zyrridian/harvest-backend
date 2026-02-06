"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Leaf,
  ChevronRight,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Loader2,
  ShoppingCart,
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

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  productCount: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  unit: string;
  stock_quantity: number;
  rating: number | null;
  review_count: number;
  is_organic: boolean;
  image: string | null;
  farmer?: {
    name: string;
    profile_image: string | null;
    is_verified: boolean;
  };
  // Pre-order specific
  harvest_date?: string;
  days_until_harvest?: number;
  countdown_label?: string;
  pre_order_count?: number;
}

interface Farmer {
  id: string;
  name: string;
  profile_image: string | null;
  city: string | null;
  rating: number;
  total_products: number;
  is_verified: boolean;
  distance_km?: number;
}

interface HomeData {
  categories: Category[];
  preOrders: Product[];
  nearbyFarmers: {
    count: number;
    radius_km: number;
    farmers: Farmer[];
  };
  freshToday: Product[];
}

export default function HomePage() {
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      // Try to get user location for nearby farmers
      let params = "";
      if ("geolocation" in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              });
            },
          );
          params = `?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`;
        } catch {
          // Location not available, continue without it
        }
      }

      const response = await fetch(`/api/v1/home${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load home data");
      }

      setHomeData(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = "/login?redirect=/home";
      return;
    }

    setAddingToCart(productId);
    try {
      const response = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      // Trigger cart update event
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (err: any) {
      console.error("Add to cart error:", err.message);
    } finally {
      setAddingToCart(null);
    }
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

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <p className="mb-4" style={{ color: colors.error }}>
            {error}
          </p>
          <button
            onClick={fetchHomeData}
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

  const categories = homeData?.categories || [];
  const preOrders = homeData?.preOrders || [];
  const nearbyFarmers = homeData?.nearbyFarmers?.farmers || [];
  const freshToday = homeData?.freshToday || [];

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Hero Banner */}
      <section
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl">
            <h1
              className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: colors.heading }}
            >
              Fresh from local farms
            </h1>
            <p className="text-lg mb-6" style={{ color: colors.body }}>
              Discover quality produce directly from farmers in your area.
              Support local agriculture and enjoy the freshest ingredients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                Browse Products
                <ChevronRight size={16} />
              </Link>
              <Link
                href="/farmers"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  color: colors.heading,
                  borderRadius: "4px",
                }}
              >
                Find Farmers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: colors.heading }}>
              Categories
            </h2>
            <Link
              href="/categories"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: colors.accent }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center p-4 border transition-colors hover:border-green-600"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <span className="text-2xl mb-2">{category.emoji || "📦"}</span>
                <span
                  className="text-xs font-medium text-center truncate w-full"
                  style={{ color: colors.heading }}
                >
                  {category.name}
                </span>
                <span className="text-xs" style={{ color: colors.body }}>
                  {category.productCount} items
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Pre-orders / Upcoming Harvests */}
      {preOrders.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: colors.heading }}
              >
                Upcoming Harvests
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.body }}>
                Pre-order fresh produce before it's harvested
              </p>
            </div>
            <Link
              href="/products?preorder=true"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: colors.accent }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {preOrders.slice(0, 5).map((product) => (
              <div
                key={product.id}
                className="border overflow-hidden"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <Link href={`/products/${product.slug || product.id}`}>
                  <div
                    className="aspect-square relative"
                    style={{ backgroundColor: "#f4f4f5" }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf size={48} style={{ color: colors.border }} />
                      </div>
                    )}
                    {/* Countdown badge */}
                    <div
                      className="absolute top-2 left-2 px-2 py-1 text-xs font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: colors.warningBg,
                        color: colors.warning,
                        borderRadius: "4px",
                      }}
                    >
                      <Clock size={12} />
                      {product.countdown_label}
                    </div>
                    {product.is_organic && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.success,
                          borderRadius: "4px",
                        }}
                      >
                        Organic
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/products/${product.slug || product.id}`}>
                    <h3
                      className="font-medium text-sm mb-1 truncate hover:underline"
                      style={{ color: colors.heading }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  {product.farmer && (
                    <p
                      className="text-xs mb-2 flex items-center gap-1"
                      style={{ color: colors.body }}
                    >
                      {product.farmer.name}
                      {product.farmer.is_verified && (
                        <CheckCircle
                          size={12}
                          style={{ color: colors.success }}
                        />
                      )}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p className="font-bold" style={{ color: colors.accent }}>
                      {product.currency}{" "}
                      {Number(product.price).toLocaleString()}
                      <span
                        className="text-xs font-normal"
                        style={{ color: colors.body }}
                      >
                        /{product.unit}
                      </span>
                    </p>
                  </div>
                  {product.pre_order_count !== undefined && (
                    <p className="text-xs mt-2" style={{ color: colors.body }}>
                      {product.pre_order_count} pre-orders
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Farmers */}
      {nearbyFarmers.length > 0 && (
        <section
          className="border-y py-8"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
          }}
        >
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: colors.heading }}
                >
                  Farmers Near You
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.body }}>
                  Support local farmers in your area
                </p>
              </div>
              <Link
                href="/farmers"
                className="text-sm font-medium flex items-center gap-1 hover:underline"
                style={{ color: colors.accent }}
              >
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {nearbyFarmers.slice(0, 5).map((farmer) => (
                <Link
                  key={farmer.id}
                  href={`/farmers/${farmer.id}`}
                  className="p-4 border transition-colors hover:border-green-600"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundColor: colors.white,
                        borderRadius: "4px",
                      }}
                    >
                      {farmer.profile_image ? (
                        <img
                          src={farmer.profile_image}
                          alt={farmer.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf size={24} style={{ color: colors.accent }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3
                        className="font-medium text-sm truncate flex items-center gap-1"
                        style={{ color: colors.heading }}
                      >
                        {farmer.name}
                        {farmer.is_verified && (
                          <CheckCircle
                            size={12}
                            style={{ color: colors.success }}
                          />
                        )}
                      </h3>
                      {farmer.city && (
                        <p
                          className="text-xs truncate"
                          style={{ color: colors.body }}
                        >
                          {farmer.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className="flex items-center gap-1"
                      style={{ color: colors.body }}
                    >
                      <Star
                        size={12}
                        fill={colors.warning}
                        style={{ color: colors.warning }}
                      />
                      {farmer.rating?.toFixed(1) || "New"}
                    </span>
                    {farmer.distance_km !== undefined && (
                      <span
                        className="flex items-center gap-1"
                        style={{ color: colors.body }}
                      >
                        <MapPin size={12} />
                        {farmer.distance_km} km
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-2" style={{ color: colors.body }}>
                    {farmer.total_products} products
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Fresh Today */}
      {freshToday.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-xl font-bold"
                style={{ color: colors.heading }}
              >
                Fresh Today
              </h2>
              <p className="text-sm mt-1" style={{ color: colors.body }}>
                Available now and ready to ship
              </p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium flex items-center gap-1 hover:underline"
              style={{ color: colors.accent }}
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {freshToday.slice(0, 10).map((product) => (
              <div
                key={product.id}
                className="border overflow-hidden group"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <Link href={`/products/${product.slug || product.id}`}>
                  <div
                    className="aspect-square relative"
                    style={{ backgroundColor: "#f4f4f5" }}
                  >
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf size={48} style={{ color: colors.border }} />
                      </div>
                    )}
                    {product.is_organic && (
                      <div
                        className="absolute top-2 right-2 px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.success,
                          borderRadius: "4px",
                        }}
                      >
                        Organic
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <Link href={`/products/${product.slug || product.id}`}>
                    <h3
                      className="font-medium text-sm mb-1 truncate hover:underline"
                      style={{ color: colors.heading }}
                    >
                      {product.name}
                    </h3>
                  </Link>
                  {product.farmer && (
                    <p
                      className="text-xs mb-2 flex items-center gap-1"
                      style={{ color: colors.body }}
                    >
                      {product.farmer.name}
                      {product.farmer.is_verified && (
                        <CheckCircle
                          size={12}
                          style={{ color: colors.success }}
                        />
                      )}
                    </p>
                  )}
                  {product.rating !== null && (
                    <p
                      className="text-xs mb-2 flex items-center gap-1"
                      style={{ color: colors.body }}
                    >
                      <Star
                        size={12}
                        fill={colors.warning}
                        style={{ color: colors.warning }}
                      />
                      {product.rating?.toFixed(1)} ({product.review_count})
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold" style={{ color: colors.accent }}>
                      {product.currency}{" "}
                      {Number(product.price).toLocaleString()}
                      <span
                        className="text-xs font-normal"
                        style={{ color: colors.body }}
                      >
                        /{product.unit}
                      </span>
                    </p>
                    <button
                      onClick={() => addToCart(product.id)}
                      disabled={addingToCart === product.id}
                      className="p-2 border transition-colors hover:bg-green-50 hover:border-green-600 disabled:opacity-50"
                      style={{
                        borderColor: colors.border,
                        borderRadius: "4px",
                      }}
                      title="Add to cart"
                    >
                      {addingToCart === product.id ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                          style={{ color: colors.accent }}
                        />
                      ) : (
                        <ShoppingCart
                          size={16}
                          style={{ color: colors.accent }}
                        />
                      )}
                    </button>
                  </div>
                  <p
                    className="text-xs mt-2"
                    style={{
                      color:
                        product.stock_quantity < 10
                          ? colors.error
                          : colors.body,
                    }}
                  >
                    {product.stock_quantity < 10
                      ? `Only ${product.stock_quantity} left`
                      : "In stock"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {categories.length === 0 && freshToday.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <Leaf
            size={64}
            className="mx-auto mb-4"
            style={{ color: colors.border }}
          />
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            No products available yet
          </h2>
          <p className="mb-6" style={{ color: colors.body }}>
            Check back soon for fresh produce from local farmers.
          </p>
        </div>
      )}
    </div>
  );
}
