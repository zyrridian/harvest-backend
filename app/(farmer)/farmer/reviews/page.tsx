"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  AlertCircle,
  Package,
  Calendar,
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

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  createdAt: string;
  user: {
    name: string;
    avatar_url: string | null;
  };
  product: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    [key: number]: number;
  };
}

export default function FarmerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/farmer/reviews", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok) {
        setReviews(data.data.reviews || []);
        setSummary(data.data.summary || null);
      } else {
        throw new Error(data.message || "Failed to fetch reviews");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{
              borderColor: colors.accent,
              borderTopColor: "transparent",
            }}
          />
          <p style={{ color: colors.body }}>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
          Reviews
        </h1>
        <p className="text-sm" style={{ color: colors.body }}>
          See what customers are saying about your products
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          className="p-4 border flex items-center gap-3"
          style={{
            backgroundColor: colors.errorBg,
            borderColor: colors.error,
            borderRadius: "4px",
          }}
        >
          <AlertCircle size={20} style={{ color: colors.error }} />
          <p style={{ color: colors.error }}>{error}</p>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div
          className="p-6 border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="flex flex-col md:flex-row gap-6">
            {/* Overall Rating */}
            <div className="text-center md:text-left">
              <div
                className="text-5xl font-bold"
                style={{ color: colors.heading }}
              >
                {summary.average_rating?.toFixed(1) || "0.0"}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
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
              <p className="text-sm mt-1" style={{ color: colors.body }}>
                {summary.total_reviews} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = summary.rating_distribution?.[rating] || 0;
                const percentage =
                  summary.total_reviews > 0
                    ? (count / summary.total_reviews) * 100
                    : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span
                      className="text-sm w-12"
                      style={{ color: colors.body }}
                    >
                      {rating} star
                    </span>
                    <div
                      className="flex-1 h-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: colors.border }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: colors.warning,
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

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div
          className="p-12 text-center border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <Star
            size={48}
            className="mx-auto mb-4"
            style={{ color: colors.border }}
          />
          <h2
            className="text-lg font-bold mb-2"
            style={{ color: colors.heading }}
          >
            No reviews yet
          </h2>
          <p style={{ color: colors.body }}>
            Reviews will appear here when customers rate your products
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              {/* Product info */}
              <Link
                href={`/farmer/products/${review.product.id}`}
                className="flex items-center gap-3 pb-3 border-b mb-3 hover:opacity-80"
                style={{ borderColor: colors.border }}
              >
                <div
                  className="w-12 h-12 shrink-0 overflow-hidden flex items-center justify-center"
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: "4px",
                  }}
                >
                  {review.product.image ? (
                    <img
                      src={review.product.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package size={20} style={{ color: colors.border }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: colors.heading }}
                  >
                    {review.product.name}
                  </p>
                </div>
              </Link>

              {/* Review Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
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
                        alt=""
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
                            size={14}
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
                      {review.isVerifiedPurchase && (
                        <span
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: colors.successBg,
                            color: colors.success,
                            borderRadius: "4px",
                          }}
                        >
                          Verified Purchase
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className="text-xs" style={{ color: colors.body }}>
                  {formatDate(review.createdAt)}
                </span>
              </div>

              {/* Review Content */}
              {review.title && (
                <p
                  className="font-medium mb-1"
                  style={{ color: colors.heading }}
                >
                  {review.title}
                </p>
              )}
              {review.comment && (
                <p className="text-sm" style={{ color: colors.body }}>
                  {review.comment}
                </p>
              )}

              {/* Helpful count */}
              {review.helpfulCount > 0 && (
                <div
                  className="flex items-center gap-1 mt-3 text-sm"
                  style={{ color: colors.body }}
                >
                  <ThumbsUp size={14} />
                  {review.helpfulCount} found this helpful
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
