"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ChevronLeft,
  Star,
  User,
  Loader2,
  Camera,
  X,
  CheckCircle,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
  warning: "#ca8a04",
};

interface Review {
  review_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  buyer: {
    user_id: string;
    name: string;
    profile_picture: string | null;
    is_verified_purchase: boolean;
  };
  images: { image_id: string; url: string; thumbnail_url: string }[];
  helpful_count: number;
  is_helpful: boolean;
}

interface Summary {
  average_rating: number;
  total_reviews: number;
  distribution: {
    "5_star": number;
    "4_star": number;
    "3_star": number;
    "2_star": number;
    "1_star": number;
  };
}

interface Product {
  product_id: string;
  name: string;
  slug: string;
}

export default function ProductReviewsPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Review form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews(1);
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/v1/products/${productId}`);
      const data = await response.json();
      if (response.ok) {
        setProduct({
          product_id: data.data.product_id,
          name: data.data.name,
          slug: data.data.slug,
        });
      }
    } catch (error) {
      console.error("Failed to fetch product:", error);
    }
  };

  const fetchReviews = async (pageNum: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/products/${productId}/reviews?page=${pageNum}&limit=10`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      const data = await response.json();

      if (response.ok) {
        if (pageNum === 1) {
          setReviews(data.data.reviews || []);
        } else {
          setReviews((prev) => [...prev, ...(data.data.reviews || [])]);
        }
        setSummary(data.data.summary || null);
        setHasMore(pageNum < data.data.pagination.total_pages);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");

    if (!token) {
      router.push(`/login?redirect=/products/${productId}/reviews`);
      return;
    }

    if (rating === 0) {
      setSubmitError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch(`/api/v1/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || undefined,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitSuccess(true);
        setShowForm(false);
        setRating(0);
        setTitle("");
        setComment("");
        // Refresh reviews
        fetchReviews(1);
      } else {
        setSubmitError(data.message || "Failed to submit review");
      }
    } catch (error: any) {
      setSubmitError(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string, isHelpful: boolean) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/products/${productId}/reviews`);
      return;
    }

    try {
      const response = await fetch(`/api/v1/reviews/${reviewId}/helpful`, {
        method: isHelpful ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) => {
            if (r.review_id === reviewId) {
              return {
                ...r,
                is_helpful: !isHelpful,
                helpful_count: isHelpful
                  ? r.helpful_count - 1
                  : r.helpful_count + 1,
              };
            }
            return r;
          }),
        );
      }
    } catch (error) {
      console.error("Helpful error:", error);
    }
  };

  if (loading && reviews.length === 0) {
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

  const displayRating = hoverRating || rating;

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <header
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2"
            style={{ color: colors.heading }}
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 min-w-0">
            <h1
              className="font-semibold truncate"
              style={{ color: colors.heading }}
            >
              Reviews
            </h1>
            {product && (
              <p className="text-sm truncate" style={{ color: colors.body }}>
                {product.name}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Summary */}
        {summary && (
          <div
            className="p-6 border mb-6"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "8px",
            }}
          >
            <div className="flex items-start gap-6">
              <div className="text-center">
                <p
                  className="text-4xl font-bold"
                  style={{ color: colors.heading }}
                >
                  {summary.average_rating.toFixed(1)}
                </p>
                <div className="flex justify-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      fill={
                        star <= Math.round(summary.average_rating)
                          ? colors.warning
                          : "none"
                      }
                      style={{
                        color:
                          star <= Math.round(summary.average_rating)
                            ? colors.warning
                            : colors.border,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm" style={{ color: colors.body }}>
                  {summary.total_reviews} reviews
                </p>
              </div>
              <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const key =
                    `${star}_star` as keyof typeof summary.distribution;
                  const count = summary.distribution[key];
                  const percentage =
                    summary.total_reviews > 0
                      ? (count / summary.total_reviews) * 100
                      : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span
                        className="text-sm w-12"
                        style={{ color: colors.body }}
                      >
                        {star} star
                      </span>
                      <div
                        className="flex-1 h-2 overflow-hidden"
                        style={{
                          backgroundColor: colors.border,
                          borderRadius: "4px",
                        }}
                      >
                        <div
                          className="h-full"
                          style={{
                            backgroundColor: colors.warning,
                            width: `${percentage}%`,
                          }}
                        />
                      </div>
                      <span
                        className="text-sm w-8 text-right"
                        style={{ color: colors.body }}
                      >
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Success message */}
        {submitSuccess && (
          <div
            className="p-4 mb-4 flex items-center gap-3"
            style={{
              backgroundColor: colors.successBg,
              borderRadius: "8px",
            }}
          >
            <CheckCircle size={20} style={{ color: colors.success }} />
            <p className="text-sm" style={{ color: colors.success }}>
              Your review has been submitted successfully!
            </p>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="ml-auto"
              style={{ color: colors.success }}
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Write Review Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full p-4 mb-6 text-sm font-medium border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.accent,
              color: colors.accent,
              borderRadius: "8px",
            }}
          >
            Write a Review
          </button>
        )}

        {/* Review Form */}
        {showForm && (
          <form
            onSubmit={handleSubmitReview}
            className="p-6 border mb-6"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "8px",
            }}
          >
            <h3
              className="font-semibold mb-4"
              style={{ color: colors.heading }}
            >
              Write Your Review
            </h3>

            {submitError && (
              <div
                className="p-3 mb-4 text-sm"
                style={{
                  backgroundColor: "#fee2e2",
                  color: colors.error,
                  borderRadius: "4px",
                }}
              >
                {submitError}
              </div>
            )}

            {/* Rating */}
            <div className="mb-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: colors.heading }}
              >
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1"
                  >
                    <Star
                      size={32}
                      fill={star <= displayRating ? colors.warning : "none"}
                      style={{
                        color:
                          star <= displayRating
                            ? colors.warning
                            : colors.border,
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: colors.heading }}
              >
                Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Summarize your review"
                className="w-full px-4 py-2 border text-sm outline-none"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  backgroundColor: colors.background,
                }}
              />
            </div>

            {/* Comment */}
            <div className="mb-4">
              <label
                className="text-sm font-medium mb-2 block"
                style={{ color: colors.heading }}
              >
                Review (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this product"
                rows={4}
                className="w-full px-4 py-2 border text-sm outline-none resize-none"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  backgroundColor: colors.background,
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 text-sm font-medium border"
                style={{
                  borderColor: colors.border,
                  color: colors.body,
                  borderRadius: "4px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0}
                className="flex-1 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin mx-auto" />
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div
            className="p-8 border text-center"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "8px",
            }}
          >
            <Star
              size={32}
              className="mx-auto mb-2"
              style={{ color: colors.border }}
            />
            <p style={{ color: colors.body }}>
              No reviews yet. Be the first to review!
            </p>
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
                  borderRadius: "8px",
                }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 flex items-center justify-center overflow-hidden"
                    style={{
                      backgroundColor: colors.background,
                      borderRadius: "9999px",
                    }}
                  >
                    {review.buyer.profile_picture ? (
                      <img
                        src={review.buyer.profile_picture}
                        alt={review.buyer.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={20} style={{ color: colors.body }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p
                        className="font-medium text-sm"
                        style={{ color: colors.heading }}
                      >
                        {review.buyer.name}
                      </p>
                      {review.buyer.is_verified_purchase && (
                        <span
                          className="px-2 py-0.5 text-xs font-medium"
                          style={{
                            backgroundColor: colors.successBg,
                            color: colors.success,
                            borderRadius: "9999px",
                          }}
                        >
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={12}
                            fill={
                              star <= review.rating ? colors.warning : "none"
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
                      <span className="text-xs" style={{ color: colors.body }}>
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title */}
                {review.title && (
                  <h4
                    className="font-medium mb-1"
                    style={{ color: colors.heading }}
                  >
                    {review.title}
                  </h4>
                )}

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm mb-3" style={{ color: colors.body }}>
                    {review.comment}
                  </p>
                )}

                {/* Images */}
                {review.images.length > 0 && (
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {review.images.map((img) => (
                      <img
                        key={img.image_id}
                        src={img.thumbnail_url || img.url}
                        alt=""
                        className="w-16 h-16 object-cover flex-shrink-0"
                        style={{ borderRadius: "4px" }}
                      />
                    ))}
                  </div>
                )}

                {/* Helpful */}
                <button
                  onClick={() =>
                    handleHelpful(review.review_id, review.is_helpful)
                  }
                  className="text-sm flex items-center gap-1"
                  style={{
                    color: review.is_helpful ? colors.accent : colors.body,
                  }}
                >
                  {review.is_helpful ? "✓ Helpful" : "Helpful"}
                  {review.helpful_count > 0 && ` (${review.helpful_count})`}
                </button>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2 text-sm font-medium border"
                  style={{
                    borderColor: colors.border,
                    color: colors.heading,
                    borderRadius: "4px",
                    backgroundColor: colors.white,
                  }}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
