"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Search,
  MapPin,
  Star,
  CheckCircle,
  Loader2,
  ChevronRight,
  Leaf,
  Filter,
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
  warning: "#ca8a04",
};

interface Farmer {
  id: string;
  name: string;
  profile_image: string | null;
  cover_image: string | null;
  description: string | null;
  city: string | null;
  state: string | null;
  rating: number;
  review_count: number;
  total_products: number;
  is_verified: boolean;
  distance_km?: number;
  specialties?: string[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function FarmersContent() {
  const searchParams = useSearchParams();

  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState("rating");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    // Try to get user location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          // Location access denied, continue without it
        }
      );
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [sortBy, verifiedOnly, userLocation]);

  const fetchFarmers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", "20");
      if (sortBy) params.set("sort_by", sortBy);
      if (verifiedOnly) params.set("verified", "true");
      if (userLocation) {
        params.set("latitude", userLocation.latitude.toString());
        params.set("longitude", userLocation.longitude.toString());
      }

      const response = await fetch(`/api/v1/farmers?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const farmerData = data.data.farmers || data.data || [];
        setFarmers(farmerData);
        setPagination(data.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch farmers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search functionality
    fetchFarmers();
  };

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Local Farmers
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Connect directly with farmers in your area
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: colors.body }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search farmers..."
                className="w-full pl-12 pr-4 py-3 text-sm border outline-none focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm border outline-none bg-white cursor-pointer"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            >
              <option value="rating">Top Rated</option>
              <option value="products">Most Products</option>
              <option value="newest">Newest</option>
              {userLocation && <option value="distance">Nearest</option>}
            </select>

            {/* Verified filter */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className="px-4 py-2 text-sm border transition-colors whitespace-nowrap"
              style={{
                borderColor: verifiedOnly ? colors.accent : colors.border,
                backgroundColor: verifiedOnly ? colors.successBg : colors.white,
                color: verifiedOnly ? colors.accent : colors.body,
                borderRadius: "4px",
              }}
            >
              <CheckCircle
                size={14}
                className="inline mr-1"
                style={{ color: verifiedOnly ? colors.success : colors.body }}
              />
              Verified Only
            </button>

            {userLocation && (
              <span
                className="px-4 py-2 text-sm flex items-center gap-1 whitespace-nowrap"
                style={{ color: colors.body }}
              >
                <MapPin size={14} style={{ color: colors.accent }} />
                Location enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {pagination && (
          <p className="text-sm mb-4" style={{ color: colors.body }}>
            {pagination.total} farmers found
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : farmers.length === 0 ? (
          <div className="text-center py-16">
            <Leaf
              size={64}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              No farmers found
            </h2>
            <p style={{ color: colors.body }}>
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farmers.map((farmer) => (
              <Link
                key={farmer.id}
                href={`/farmers/${farmer.id}`}
                className="border overflow-hidden transition-colors hover:border-green-600"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                {/* Cover image */}
                <div
                  className="h-32 relative"
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
                      <Leaf size={48} style={{ color: colors.border }} />
                    </div>
                  )}

                  {/* Profile image overlay */}
                  <div
                    className="absolute -bottom-8 left-4 w-16 h-16 border-4 overflow-hidden"
                    style={{
                      backgroundColor: colors.white,
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
                      <div
                        className="w-full h-full flex items-center justify-center"
                        style={{ backgroundColor: colors.background }}
                      >
                        <Leaf size={24} style={{ color: colors.accent }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="pt-10 pb-4 px-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold truncate"
                      style={{ color: colors.heading }}
                    >
                      {farmer.name}
                    </h3>
                    {farmer.is_verified && (
                      <CheckCircle
                        size={16}
                        className="flex-shrink-0"
                        style={{ color: colors.success }}
                      />
                    )}
                  </div>

                  {(farmer.city || farmer.state) && (
                    <p
                      className="text-sm flex items-center gap-1 mb-2"
                      style={{ color: colors.body }}
                    >
                      <MapPin size={14} />
                      {farmer.city}
                      {farmer.state && `, ${farmer.state}`}
                      {farmer.distance_km !== undefined && (
                        <span className="ml-1">
                          ({farmer.distance_km.toFixed(1)} km)
                        </span>
                      )}
                    </p>
                  )}

                  {farmer.description && (
                    <p
                      className="text-sm line-clamp-2 mb-3"
                      style={{ color: colors.body }}
                    >
                      {farmer.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm">
                      <span
                        className="flex items-center gap-1"
                        style={{ color: colors.body }}
                      >
                        <Star
                          size={14}
                          fill={colors.warning}
                          style={{ color: colors.warning }}
                        />
                        {farmer.rating?.toFixed(1) || "New"}
                        {farmer.review_count > 0 && (
                          <span>({farmer.review_count})</span>
                        )}
                      </span>
                      <span style={{ color: colors.body }}>
                        {farmer.total_products} products
                      </span>
                    </div>
                    <ChevronRight size={18} style={{ color: colors.body }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function FarmersPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <FarmersContent />
    </Suspense>
  );
}
