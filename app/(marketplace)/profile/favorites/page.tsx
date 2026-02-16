"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  Loader2,
  Leaf,
  Star,
  ShoppingCart,
  Trash2,
  ArrowLeft,
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
};

interface FavoriteProduct {
  id: string;
  product_id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    currency: string;
    unit: string;
    image: string | null;
    rating: number;
    is_available: boolean;
    seller_name: string;
  };
  created_at: string;
}

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/profile/favorites");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/v1/users/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setFavorites(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setRemovingIds((prev) => new Set(prev).add(favoriteId));

    try {
      const response = await fetch(`/api/v1/users/favorites/${favoriteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== favoriteId));
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    } finally {
      setRemovingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(favoriteId);
        return newSet;
      });
    }
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: 1,
        }),
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (currency === "IDR") {
      return `Rp ${price.toLocaleString("id-ID")}`;
    }
    return `$${price.toFixed(2)}`;
  };

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
              My Favorites
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: colors.successBg }}
            >
              <Heart size={32} style={{ color: colors.accent }} />
            </div>
            <h3
              className="text-lg font-medium mb-2"
              style={{ color: colors.heading }}
            >
              No favorites yet
            </h3>
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              Save products you love by tapping the heart icon
            </p>
            <Link
              href="/products"
              className="px-4 py-2 text-sm font-medium rounded-lg"
              style={{ backgroundColor: colors.accent, color: colors.white }}
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.body }}>
              {favorites.length} item{favorites.length !== 1 ? "s" : ""} saved
            </p>

            <div className="grid gap-4">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex gap-4 p-4 border"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                    opacity: favorite.product.is_available ? 1 : 0.6,
                  }}
                >
                  {/* Product image */}
                  <Link
                    href={`/products/${favorite.product.slug}`}
                    className="flex-shrink-0"
                  >
                    <div
                      className="w-24 h-24 overflow-hidden flex items-center justify-center"
                      style={{
                        backgroundColor: colors.background,
                        borderRadius: "4px",
                      }}
                    >
                      {favorite.product.image ? (
                        <img
                          src={favorite.product.image}
                          alt={favorite.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Leaf size={24} style={{ color: colors.border }} />
                      )}
                    </div>
                  </Link>

                  {/* Product info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${favorite.product.slug}`}>
                      <h3
                        className="font-medium text-sm mb-1 hover:underline"
                        style={{ color: colors.heading }}
                      >
                        {favorite.product.name}
                      </h3>
                    </Link>

                    <p className="text-xs mb-2" style={{ color: colors.body }}>
                      by {favorite.product.seller_name}
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star
                          size={12}
                          fill={colors.warning}
                          style={{ color: colors.warning }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: colors.body }}
                        >
                          {favorite.product.rating.toFixed(1)}
                        </span>
                      </div>
                      {!favorite.product.is_available && (
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: colors.errorBg,
                            color: colors.error,
                          }}
                        >
                          Out of stock
                        </span>
                      )}
                    </div>

                    <p
                      className="font-semibold text-sm"
                      style={{ color: colors.accent }}
                    >
                      {formatPrice(
                        favorite.product.price,
                        favorite.product.currency,
                      )}
                      <span
                        className="font-normal text-xs ml-1"
                        style={{ color: colors.body }}
                      >
                        / {favorite.product.unit}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => removeFavorite(favorite.id)}
                      disabled={removingIds.has(favorite.id)}
                      className="p-2 rounded border transition-colors hover:bg-red-50"
                      style={{ borderColor: colors.border }}
                    >
                      {removingIds.has(favorite.id) ? (
                        <Loader2
                          size={18}
                          className="animate-spin"
                          style={{ color: colors.error }}
                        />
                      ) : (
                        <Trash2 size={18} style={{ color: colors.error }} />
                      )}
                    </button>

                    {favorite.product.is_available && (
                      <button
                        onClick={() => addToCart(favorite.product.id)}
                        className="p-2 rounded transition-colors"
                        style={{
                          backgroundColor: colors.accent,
                          color: colors.white,
                        }}
                      >
                        <ShoppingCart size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
