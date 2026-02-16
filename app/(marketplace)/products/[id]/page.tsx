"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Share2,
  Star,
  CheckCircle,
  Leaf,
  Truck,
  Shield,
  MapPin,
  MessageSquare,
  Loader2,
  Clock,
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

interface ProductImage {
  image_id: string;
  url: string;
  thumbnail_url: string | null;
  alt_text: string | null;
  is_primary: boolean;
}

interface ProductDetail {
  product_id: string;
  name: string;
  slug: string;
  description: string | null;
  long_description: string | null;
  category: {
    category_id: string;
    name: string;
    slug: string;
  } | null;
  price: number;
  currency: string;
  unit: string;
  discount: {
    discounted_price: number;
    value: number;
    type: string;
    valid_until: string;
  } | null;
  stock_quantity: number;
  minimum_order: number;
  maximum_order: number | null;
  images: ProductImage[];
  seller: {
    seller_id: string;
    name: string;
    avatar_url: string | null;
    joined_date: string;
  };
  farmer: {
    name: string;
    farm_name: string | null;
    city: string | null;
    is_verified: boolean;
    rating: number;
    total_products: number;
  } | null;
  attributes: {
    is_organic: boolean;
    is_local: boolean;
    is_seasonal: boolean;
    harvest_date: string | null;
    expiry_date: string | null;
    origin: string | null;
    storage_instructions: string | null;
    nutritional_info: string | null;
  };
  rating: number;
  review_count: number;
  view_count: number;
  specifications: Array<{ key: string; value: string }>;
  certifications: Array<{ name: string; url: string | null }>;
}

interface Review {
  review_id: string;
  user: { name: string; avatar_url: string | null };
  rating: number;
  comment: string | null;
  created_at: string;
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/v1/products/${productId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Product not found");
      }

      setProduct(data.data);
      setQuantity(data.data.minimum_order || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/v1/reviews/${productId}?limit=5`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.data.reviews || data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const addToCart = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    setAddingToCart(true);
    try {
      const response = await fetch("/api/v1/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_id: productId, quantity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add to cart");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      // Optionally show success feedback
    } catch (err: any) {
      console.error("Add to cart error:", err.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/products/${productId}`);
      return;
    }

    try {
      const response = await fetch(`/api/v1/products/${productId}/favorite`, {
        method: isFavorite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          url,
        });
      } catch (error) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(url);
      // Optionally show Toast
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

  if (error || !product) {
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
            Product not found
          </h1>
          <p className="mb-4" style={{ color: colors.body }}>
            {error || "The product you're looking for doesn't exist."}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            <ChevronLeft size={16} />
            Back to products
          </Link>
        </div>
      </div>
    );
  }

  const finalPrice = product.discount
    ? product.discount.discounted_price
    : product.price;
  const images =
    product.images.length > 0
      ? product.images
      : [
          {
            image_id: "placeholder",
            url: "",
            thumbnail_url: null,
            alt_text: null,
            is_primary: true,
          },
        ];
  const ratingValue =
    typeof product.rating === "number"
      ? product.rating
      : typeof (product.rating as { average?: number } | null)?.average ===
          "number"
        ? (product.rating as { average: number }).average
        : 0;

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Breadcrumb */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/home"
              style={{ color: colors.body }}
              className="hover:underline"
            >
              Home
            </Link>
            <span style={{ color: colors.body }}>/</span>
            <Link
              href="/products"
              style={{ color: colors.body }}
              className="hover:underline"
            >
              Products
            </Link>
            {product.category && (
              <>
                <span style={{ color: colors.body }}>/</span>
                <Link
                  href={`/products?category=${product.category.slug}`}
                  style={{ color: colors.body }}
                  className="hover:underline"
                >
                  {product.category.name}
                </Link>
              </>
            )}
            <span style={{ color: colors.body }}>/</span>
            <span style={{ color: colors.heading }}>{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div
              className="aspect-square relative border overflow-hidden mb-4"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              {images[selectedImage]?.url ? (
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt_text || product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf size={96} style={{ color: colors.border }} />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.attributes.is_organic && (
                  <span
                    className="px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: colors.successBg,
                      color: colors.success,
                      borderRadius: "4px",
                    }}
                  >
                    Organic
                  </span>
                )}
                {product.discount && (
                  <span
                    className="px-3 py-1 text-xs font-medium"
                    style={{
                      backgroundColor: colors.errorBg,
                      color: colors.error,
                      borderRadius: "4px",
                    }}
                  >
                    {product.discount.type === "percentage"
                      ? `${product.discount.value}% OFF`
                      : `Save ${product.currency} ${product.discount.value}`}
                  </span>
                )}
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border"
                    style={{
                      backgroundColor: colors.white,
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <ChevronLeft size={20} style={{ color: colors.heading }} />
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center border"
                    style={{
                      backgroundColor: colors.white,
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <ChevronRight size={20} style={{ color: colors.heading }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={image.image_id}
                    onClick={() => setSelectedImage(index)}
                    className="w-20 h-20 flex-shrink-0 border overflow-hidden"
                    style={{
                      borderColor:
                        selectedImage === index ? colors.accent : colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    {image.url ? (
                      <img
                        src={image.thumbnail_url || image.url}
                        alt={image.alt_text || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: "#f4f4f5" }}
                      >
                        <Leaf size={24} style={{ color: colors.border }} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1
              className="text-2xl md:text-3xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              {product.name}
            </h1>

            {/* Seller info */}
            {product.farmer && (
              <Link
                href={`/farmers/${product.seller.seller_id}`}
                className="inline-flex items-center gap-2 mb-4 hover:underline"
              >
                <span className="text-sm" style={{ color: colors.body }}>
                  by{" "}
                  <span style={{ color: colors.heading }}>
                    {product.farmer.name}
                  </span>
                </span>
                {product.farmer.is_verified && (
                  <CheckCircle size={14} style={{ color: colors.success }} />
                )}
              </Link>
            )}

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={18}
                    fill={star <= ratingValue ? colors.warning : "none"}
                    style={{
                      color:
                        star <= ratingValue ? colors.warning : colors.border,
                    }}
                  />
                ))}
                <span className="ml-2 text-sm" style={{ color: colors.body }}>
                  {ratingValue > 0 ? ratingValue.toFixed(1) : "No ratings"} (
                  {product.review_count} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              {product.discount ? (
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: colors.accent }}
                  >
                    {product.currency} {Number(finalPrice).toLocaleString()}
                  </span>
                  <span
                    className="text-lg line-through"
                    style={{ color: colors.body }}
                  >
                    {product.currency} {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-sm" style={{ color: colors.body }}>
                    / {product.unit}
                  </span>
                </div>
              ) : (
                <div className="flex items-baseline gap-2">
                  <span
                    className="text-3xl font-bold"
                    style={{ color: colors.accent }}
                  >
                    {product.currency} {Number(product.price).toLocaleString()}
                  </span>
                  <span className="text-sm" style={{ color: colors.body }}>
                    / {product.unit}
                  </span>
                </div>
              )}
            </div>

            {/* Stock status */}
            <div className="mb-6">
              {product.stock_quantity > 0 ? (
                <p
                  className="text-sm"
                  style={{
                    color:
                      product.stock_quantity < 10
                        ? colors.warning
                        : colors.success,
                  }}
                >
                  {product.stock_quantity < 10
                    ? `Only ${product.stock_quantity} left in stock`
                    : "In stock"}
                </p>
              ) : (
                <p className="text-sm" style={{ color: colors.error }}>
                  Out of stock
                </p>
              )}
            </div>

            {/* Quantity selector */}
            {product.stock_quantity > 0 && (
              <div className="mb-6">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.max(product.minimum_order || 1, q - 1),
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <Minus size={18} style={{ color: colors.heading }} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      const min = product.minimum_order || 1;
                      const max =
                        product.maximum_order || product.stock_quantity;
                      setQuantity(Math.min(Math.max(min, val), max));
                    }}
                    className="w-20 h-10 text-center border outline-none"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                  />
                  <button
                    onClick={() =>
                      setQuantity((q) =>
                        Math.min(
                          product.maximum_order || product.stock_quantity,
                          q + 1,
                        ),
                      )
                    }
                    className="w-10 h-10 flex items-center justify-center border"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
                  >
                    <Plus size={18} style={{ color: colors.heading }} />
                  </button>
                  <span className="text-sm" style={{ color: colors.body }}>
                    {product.unit}
                  </span>
                </div>
                {product.minimum_order > 1 && (
                  <p className="text-xs mt-2" style={{ color: colors.body }}>
                    Minimum order: {product.minimum_order} {product.unit}
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={addToCart}
                disabled={addingToCart || product.stock_quantity === 0}
                className="flex-1 py-3 px-6 flex items-center justify-center gap-2 text-sm font-medium transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                {addingToCart ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <ShoppingCart size={18} />
                    Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={toggleFavorite}
                className="w-12 h-12 flex items-center justify-center border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: isFavorite ? colors.error : colors.border,
                  borderRadius: "4px",
                }}
              >
                <Heart
                  size={20}
                  fill={isFavorite ? colors.error : "none"}
                  style={{ color: isFavorite ? colors.error : colors.body }}
                />
              </button>
              <button
                onClick={handleShare}
                className="w-12 h-12 flex items-center justify-center border transition-colors hover:bg-gray-50"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <Share2 size={20} style={{ color: colors.body }} />
              </button>
            </div>

            {/* Trust badges */}
            <div
              className="grid grid-cols-3 gap-4 p-4 border mb-6"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="text-center">
                <Truck
                  size={24}
                  className="mx-auto mb-1"
                  style={{ color: colors.accent }}
                />
                <p className="text-xs" style={{ color: colors.body }}>
                  Fast Delivery
                </p>
              </div>
              <div className="text-center">
                <Shield
                  size={24}
                  className="mx-auto mb-1"
                  style={{ color: colors.accent }}
                />
                <p className="text-xs" style={{ color: colors.body }}>
                  Quality Guaranteed
                </p>
              </div>
              <div className="text-center">
                <Leaf
                  size={24}
                  className="mx-auto mb-1"
                  style={{ color: colors.accent }}
                />
                <p className="text-xs" style={{ color: colors.body }}>
                  Farm Fresh
                </p>
              </div>
            </div>

            {/* Farmer card */}
            {product.farmer && (
              <Link
                href={`/farmers/${product.seller.seller_id}`}
                className="block p-4 border transition-colors hover:border-green-600"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: "4px",
                    }}
                  >
                    {product.seller.avatar_url ? (
                      <img
                        src={product.seller.avatar_url}
                        alt={product.farmer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Leaf size={24} style={{ color: colors.accent }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-medium flex items-center gap-1"
                      style={{ color: colors.heading }}
                    >
                      {product.farmer.name}
                      {product.farmer.is_verified && (
                        <CheckCircle
                          size={14}
                          style={{ color: colors.success }}
                        />
                      )}
                    </p>
                    {product.farmer.farm_name && (
                      <p
                        className="text-sm truncate"
                        style={{ color: colors.body }}
                      >
                        {product.farmer.farm_name}
                      </p>
                    )}
                    <div
                      className="flex items-center gap-3 mt-1 text-xs"
                      style={{ color: colors.body }}
                    >
                      <span className="flex items-center gap-1">
                        <Star
                          size={12}
                          fill={colors.warning}
                          style={{ color: colors.warning }}
                        />
                        {product.farmer.rating?.toFixed(1) || "New"}
                      </span>
                      {product.farmer.city && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {product.farmer.city}
                        </span>
                      )}
                      <span>{product.farmer.total_products} products</span>
                    </div>
                  </div>
                  <ChevronRight size={20} style={{ color: colors.body }} />
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Description & Specs */}
        <div className="mt-8 grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: colors.heading }}
            >
              Description
            </h2>
            <div
              className="p-6 border prose prose-sm max-w-none"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.body,
              }}
            >
              {product.long_description ||
                product.description ||
                "No description available."}
            </div>

            {/* Specifications */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mt-6">
                <h2
                  className="text-lg font-bold mb-4"
                  style={{ color: colors.heading }}
                >
                  Specifications
                </h2>
                <div
                  className="border divide-y"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  {product.specifications.map((spec, idx) => (
                    <div key={idx} className="flex p-3">
                      <span
                        className="w-1/3 text-sm"
                        style={{ color: colors.body }}
                      >
                        {spec.key}
                      </span>
                      <span
                        className="flex-1 text-sm font-medium"
                        style={{ color: colors.heading }}
                      >
                        {spec.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-lg font-bold"
                  style={{ color: colors.heading }}
                >
                  Reviews ({product.review_count})
                </h2>
                <Link
                  href={`/products/${productId}/reviews`}
                  className="text-sm font-medium hover:underline"
                  style={{ color: colors.accent }}
                >
                  See all
                </Link>
              </div>

              {reviews.length > 0 ? (
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
                          className="w-10 h-10 flex items-center justify-center text-sm font-medium"
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
                              className="w-full h-full object-cover rounded-sm"
                            />
                          ) : (
                            review.user.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
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
              ) : (
                <div
                  className="p-8 border text-center"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
                  <MessageSquare
                    size={32}
                    className="mx-auto mb-2"
                    style={{ color: colors.border }}
                  />
                  <p className="text-sm" style={{ color: colors.body }}>
                    No reviews yet. Be the first to review!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Product attributes */}
          <div>
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: colors.heading }}
            >
              Product Details
            </h2>
            <div
              className="p-4 border space-y-4"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              {product.attributes.origin && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} style={{ color: colors.accent }} />
                  <div>
                    <p className="text-xs" style={{ color: colors.body }}>
                      Origin
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.heading }}
                    >
                      {product.attributes.origin}
                    </p>
                  </div>
                </div>
              )}

              {product.attributes.harvest_date && (
                <div className="flex items-center gap-3">
                  <Clock size={18} style={{ color: colors.accent }} />
                  <div>
                    <p className="text-xs" style={{ color: colors.body }}>
                      Harvest Date
                    </p>
                    <p
                      className="text-sm font-medium"
                      style={{ color: colors.heading }}
                    >
                      {new Date(
                        product.attributes.harvest_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {product.attributes.storage_instructions && (
                <div>
                  <p className="text-xs mb-1" style={{ color: colors.body }}>
                    Storage Instructions
                  </p>
                  <p className="text-sm" style={{ color: colors.heading }}>
                    {product.attributes.storage_instructions}
                  </p>
                </div>
              )}

              {product.certifications && product.certifications.length > 0 && (
                <div>
                  <p className="text-xs mb-2" style={{ color: colors.body }}>
                    Certifications
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.success,
                          borderRadius: "4px",
                        }}
                      >
                        {cert.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
