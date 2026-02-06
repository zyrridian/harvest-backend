"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  MapPin,
  Star,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Share2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Loader2,
  Package,
  Calendar,
  Award,
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
  warning: "#ca8a04",
};

interface FarmerDetail {
  id: string;
  user_id: string;
  name: string;
  farm_name: string | null;
  profile_image: string | null;
  cover_image: string | null;
  description: string | null;
  long_description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  total_products: number;
  total_sold: number;
  is_verified: boolean;
  joined_date: string;
  certifications: string[];
  specialties: string[];
  delivery_options: string[];
  operating_hours: {
    day: string;
    open: string;
    close: string;
  }[];
}

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  unit: string;
  stock_quantity: number;
  is_organic: boolean;
  rating: number | null;
  image: string | null;
}

interface Review {
  review_id: string;
  user: { name: string; avatar_url: string | null };
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function FarmerDetailPage() {
  const params = useParams();
  const farmerId = params.id as string;

  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"products" | "about" | "reviews">(
    "products"
  );
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    if (farmerId) {
      fetchFarmer();
      fetchProducts();
      fetchReviews();
    }
  }, [farmerId]);

  const fetchFarmer = async () => {
    try {
      const response = await fetch(`/api/v1/farmers/${farmerId}`);
      const data = await response.json();

      if (response.ok) {
        setFarmer(data.data);
      } else {
        setError(data.message || "Farmer not found");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`/api/v1/farmers/${farmerId}/products`);
      const data = await response.json();
      if (response.ok) {
        setProducts(data.data.products || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/v1/farmers/${farmerId}/reviews`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.data.reviews || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      window.location.href = `/login?redirect=/farmers/${farmerId}`;
      return;
    }

    setAddingToCart(productId);
    try {
      await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity: 1 }),
      });
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: farmer?.name, url });
      } catch {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
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

  if (error || !farmer) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center">
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Farmer not found
          </h1>
          <p className="mb-4" style={{ color: colors.body }}>
            {error || "The farmer you're looking for doesn't exist."}
          </p>
          <Link
            href="/farmers"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            <ChevronLeft size={16} />
            Back to farmers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Cover & Profile */}
      <div className="relative">
        {/* Cover image */}
        <div
          className="h-48 md:h-64"
          style={{ backgroundColor: "#f4f4f5" }}
        >
          {farmer.cover_image ? (
            <img
              src={farmer.cover_image}
              alt={farmer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Leaf size={64} style={{ color: colors.border }} />
            </div>
          )}
        </div>

        {/* Back button */}
        <Link
          href="/farmers"
          className="absolute top-4 left-4 w-10 h-10 flex items-center justify-center"
          style={{
            backgroundColor: colors.white,
            borderRadius: "4px",
          }}
        >
          <ChevronLeft size={20} style={{ color: colors.heading }} />
        </Link>

        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center"
            style={{
              backgroundColor: colors.white,
              borderRadius: "4px",
            }}
          >
            <Share2 size={18} style={{ color: colors.heading }} />
          </button>
        </div>

        {/* Profile card */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          <div
            className="p-4 md:p-6 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              {/* Profile image */}
              <div
                className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 border-4 overflow-hidden"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.white,
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
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf size={48} style={{ color: colors.accent }} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1
                        className="text-xl md:text-2xl font-bold"
                        style={{ color: colors.heading }}
                      >
                        {farmer.name}
                      </h1>
                      {farmer.is_verified && (
                        <CheckCircle
                          size={20}
                          style={{ color: colors.success }}
                        />
                      )}
                    </div>
                    {farmer.farm_name && (
                      <p className="text-sm" style={{ color: colors.body }}>
                        {farmer.farm_name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location */}
                {(farmer.city || farmer.state) && (
                  <p
                    className="text-sm flex items-center gap-1 mt-2"
                    style={{ color: colors.body }}
                  >
                    <MapPin size={14} />
                    {farmer.city}
                    {farmer.state && `, ${farmer.state}`}
                  </p>
                )}

                {/* Stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-1">
                    <Star
                      size={16}
                      fill={colors.warning}
                      style={{ color: colors.warning }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: colors.heading }}
                    >
                      {farmer.rating?.toFixed(1) || "New"}
                    </span>
                    <span className="text-sm" style={{ color: colors.body }}>
                      ({farmer.review_count} reviews)
                    </span>
                  </div>
                  <span className="text-sm" style={{ color: colors.body }}>
                    <Package
                      size={14}
                      className="inline mr-1"
                      style={{ color: colors.accent }}
                    />
                    {farmer.total_products} products
                  </span>
                  <span className="text-sm" style={{ color: colors.body }}>
                    <Calendar
                      size={14}
                      className="inline mr-1"
                      style={{ color: colors.accent }}
                    />
                    Joined{" "}
                    {new Date(farmer.joined_date).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Certifications */}
                {farmer.certifications && farmer.certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {farmer.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.success,
                          borderRadius: "4px",
                        }}
                      >
                        <Award size={12} />
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact button */}
              <div className="flex flex-col gap-2 md:flex-shrink-0">
                <Link
                  href={`/messages?farmer=${farmer.user_id}`}
                  className="px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  <MessageSquare size={16} />
                  Contact
                </Link>
                {farmer.phone && (
                  <a
                    href={`tel:${farmer.phone}`}
                    className="px-6 py-2.5 text-sm font-medium flex items-center justify-center gap-2 border"
                    style={{
                      borderColor: colors.border,
                      color: colors.heading,
                      borderRadius: "4px",
                    }}
                  >
                    <Phone size={16} />
                    Call
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div
          className="flex border-b"
          style={{ borderColor: colors.border }}
        >
          {[
            { key: "products", label: `Products (${farmer.total_products})` },
            { key: "about", label: "About" },
            { key: "reviews", label: `Reviews (${farmer.review_count})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className="px-6 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
              style={{
                borderColor:
                  activeTab === tab.key ? colors.accent : "transparent",
                color:
                  activeTab === tab.key ? colors.accent : colors.body,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="py-6">
          {/* Products tab */}
          {activeTab === "products" && (
            <div>
              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: colors.border }}
                  />
                  <p style={{ color: colors.body }}>No products available</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((product) => (
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
                              <Leaf size={32} style={{ color: colors.border }} />
                            </div>
                          )}
                          {product.is_organic && (
                            <span
                              className="absolute top-2 right-2 px-2 py-1 text-xs font-medium"
                              style={{
                                backgroundColor: colors.successBg,
                                color: colors.success,
                                borderRadius: "4px",
                              }}
                            >
                              Organic
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-3">
                        <Link href={`/products/${product.slug || product.id}`}>
                          <h3
                            className="text-sm font-medium truncate hover:underline"
                            style={{ color: colors.heading }}
                          >
                            {product.name}
                          </h3>
                        </Link>
                        {product.rating !== null && product.rating > 0 && (
                          <p
                            className="text-xs flex items-center gap-1 mt-1"
                            style={{ color: colors.body }}
                          >
                            <Star
                              size={12}
                              fill={colors.warning}
                              style={{ color: colors.warning }}
                            />
                            {product.rating.toFixed(1)}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p
                            className="font-bold text-sm"
                            style={{ color: colors.accent }}
                          >
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
                            className="p-2 border transition-colors hover:bg-green-50 hover:border-green-600"
                            style={{
                              borderColor: colors.border,
                              borderRadius: "4px",
                            }}
                          >
                            {addingToCart === product.id ? (
                              <Loader2
                                size={14}
                                className="animate-spin"
                                style={{ color: colors.accent }}
                              />
                            ) : (
                              <ShoppingCart
                                size={14}
                                style={{ color: colors.accent }}
                              />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* About tab */}
          {activeTab === "about" && (
            <div className="space-y-6">
              {/* Description */}
              {(farmer.description || farmer.long_description) && (
                <div
                  className="p-4 border"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <h3
                    className="font-bold mb-3"
                    style={{ color: colors.heading }}
                  >
                    About
                  </h3>
                  <p className="text-sm" style={{ color: colors.body }}>
                    {farmer.long_description || farmer.description}
                  </p>
                </div>
              )}

              {/* Specialties */}
              {farmer.specialties && farmer.specialties.length > 0 && (
                <div
                  className="p-4 border"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <h3
                    className="font-bold mb-3"
                    style={{ color: colors.heading }}
                  >
                    Specialties
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.specialties.map((specialty, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-sm border"
                        style={{
                          borderColor: colors.border,
                          color: colors.heading,
                          borderRadius: "4px",
                        }}
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact info */}
              <div
                className="p-4 border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <h3 className="font-bold mb-3" style={{ color: colors.heading }}>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  {farmer.address && (
                    <div className="flex items-start gap-3">
                      <MapPin
                        size={18}
                        className="flex-shrink-0 mt-0.5"
                        style={{ color: colors.accent }}
                      />
                      <p className="text-sm" style={{ color: colors.body }}>
                        {farmer.address}
                        {farmer.city && `, ${farmer.city}`}
                        {farmer.state && `, ${farmer.state}`}
                      </p>
                    </div>
                  )}
                  {farmer.phone && (
                    <div className="flex items-center gap-3">
                      <Phone size={18} style={{ color: colors.accent }} />
                      <a
                        href={`tel:${farmer.phone}`}
                        className="text-sm hover:underline"
                        style={{ color: colors.heading }}
                      >
                        {farmer.phone}
                      </a>
                    </div>
                  )}
                  {farmer.email && (
                    <div className="flex items-center gap-3">
                      <Mail size={18} style={{ color: colors.accent }} />
                      <a
                        href={`mailto:${farmer.email}`}
                        className="text-sm hover:underline"
                        style={{ color: colors.heading }}
                      >
                        {farmer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews tab */}
          {activeTab === "reviews" && (
            <div>
              {reviews.length === 0 ? (
                <div className="text-center py-12">
                  <Star
                    size={48}
                    className="mx-auto mb-4"
                    style={{ color: colors.border }}
                  />
                  <p style={{ color: colors.body }}>No reviews yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.review_id}
                      className="p-4 border"
                      style={{
                        backgroundColor: colors.white,
                        borderColor: colors.border,
                        borderRadius: "4px",
                      }}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 flex items-center justify-center text-sm font-medium overflow-hidden"
                          style={{
                            backgroundColor: colors.background,
                            color: colors.accent,
                            borderRadius: "4px",
                          }}
                        >
                          {review.user.avatar_url ? (
                            <img
                              src={review.user.avatar_url}
                              alt={review.user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            review.user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p
                            className="font-medium text-sm"
                            style={{ color: colors.heading }}
                          >
                            {review.user.name}
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  fill={
                                    star <= review.rating
                                      ? colors.warning
                                      : "none"
                                  }
                                  style={{
                                    color:
                                      star <= review.rating
                                        ? colors.warning
                                        : colors.border,
                                  }}
                                />
                              ))}
                            </div>
                            <span
                              className="text-xs"
                              style={{ color: colors.body }}
                            >
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-sm" style={{ color: colors.body }}>
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
