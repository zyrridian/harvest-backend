"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  Star,
  Leaf,
  CheckCircle,
  ShoppingCart,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
    is_verified: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  productCount: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [isOrganic, setIsOrganic] = useState(
    searchParams.get("is_organic") === "true",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "newest");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1"),
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, isOrganic, minPrice, maxPrice, sortBy, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/v1/categories");
      const data = await response.json();
      if (response.ok) {
        setCategories(
          Array.isArray(data.data) ? data.data : data.data.categories || [],
        );
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", currentPage.toString());
      params.set("limit", "20");

      if (selectedCategory) params.set("category", selectedCategory);
      if (isOrganic) params.set("is_organic", "true");
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (sortBy) params.set("sort_by", sortBy);

      const response = await fetch(`/api/v1/products?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        const productData = data.data.products || data.data || [];
        setProducts(productData);
        setPagination(data.data.pagination || null);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const updateFilters = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      params.delete("page"); // Reset page when filters change
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  const clearFilters = () => {
    setSelectedCategory("");
    setIsOrganic(false);
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setCurrentPage(1);
    router.push("/products");
  };

  const addToCart = async (productId: string) => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push(`/login?redirect=/products`);
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

      if (response.ok) {
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Add to cart error:", error);
    } finally {
      setAddingToCart(null);
    }
  };

  const hasActiveFilters =
    selectedCategory ||
    isOrganic ||
    minPrice ||
    maxPrice ||
    sortBy !== "newest";

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Search Bar */}
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
                placeholder="Search products..."
                className="w-full pl-12 pr-4 py-3 text-sm border outline-none focus:border-green-600"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 border flex items-center gap-2 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{
                borderColor: hasActiveFilters ? colors.accent : colors.border,
                color: hasActiveFilters ? colors.accent : colors.heading,
                borderRadius: "4px",
              }}
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: colors.accent }}
                />
              )}
            </button>
          </form>

          {/* Inline Filters */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {/* Sort */}
            <div className="relative flex-shrink-0">
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="appearance-none px-4 py-2 pr-8 text-sm border outline-none bg-white cursor-pointer"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.heading,
                }}
              >
                <option value="newest">Newest</option>
                <option value="price">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="popular">Most Popular</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: colors.body }}
              />
            </div>

            {/* Category chips */}
            {categories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategory(
                    selectedCategory === category.slug ? "" : category.slug,
                  );
                  setCurrentPage(1);
                }}
                className="flex-shrink-0 px-4 py-2 text-sm border transition-colors whitespace-nowrap"
                style={{
                  borderColor:
                    selectedCategory === category.slug
                      ? colors.accent
                      : colors.border,
                  backgroundColor:
                    selectedCategory === category.slug
                      ? colors.successBg
                      : colors.white,
                  color:
                    selectedCategory === category.slug
                      ? colors.accent
                      : colors.body,
                  borderRadius: "4px",
                }}
              >
                {category.emoji && (
                  <span className="mr-1">{category.emoji}</span>
                )}
                {category.name}
              </button>
            ))}

            {/* Organic filter */}
            <button
              onClick={() => {
                setIsOrganic(!isOrganic);
                setCurrentPage(1);
              }}
              className="flex-shrink-0 px-4 py-2 text-sm border transition-colors whitespace-nowrap"
              style={{
                borderColor: isOrganic ? colors.accent : colors.border,
                backgroundColor: isOrganic ? colors.successBg : colors.white,
                color: isOrganic ? colors.accent : colors.body,
                borderRadius: "4px",
              }}
            >
              Organic Only
            </button>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex-shrink-0 px-4 py-2 text-sm flex items-center gap-1 hover:underline"
                style={{ color: colors.error }}
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div
            className="border-t px-4 py-4"
            style={{ borderColor: colors.border }}
          >
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Category select */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: colors.body }}
                >
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 text-sm border outline-none bg-white"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: colors.body }}
                >
                  Min Price
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  onBlur={fetchProducts}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: colors.body }}
                >
                  Max Price
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  onBlur={fetchProducts}
                  placeholder="Any"
                  className="w-full px-3 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>

              {/* Apply/Clear buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={fetchProducts}
                  className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  Apply
                </button>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm border transition-colors hover:bg-gray-50"
                  style={{
                    borderColor: colors.border,
                    color: colors.body,
                    borderRadius: "4px",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        {pagination && (
          <p className="text-sm" style={{ color: colors.body }}>
            Showing {products.length} of {pagination.total} products
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : products.length === 0 ? (
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
              No products found
            </h2>
            <p className="mb-6" style={{ color: colors.body }}>
              Try adjusting your filters or search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
                  {product.rating !== null && product.rating > 0 && (
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 py-8">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 border transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <ChevronLeft size={18} style={{ color: colors.heading }} />
            </button>

            {Array.from(
              { length: Math.min(5, pagination.total_pages) },
              (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 text-sm font-medium border transition-colors"
                    style={{
                      borderColor:
                        currentPage === pageNum ? colors.accent : colors.border,
                      backgroundColor:
                        currentPage === pageNum ? colors.accent : colors.white,
                      color:
                        currentPage === pageNum ? colors.white : colors.heading,
                      borderRadius: "4px",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            <button
              onClick={() =>
                setCurrentPage(
                  Math.min(pagination.total_pages, currentPage + 1),
                )
              }
              disabled={currentPage === pagination.total_pages}
              className="p-2 border transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <ChevronRight size={18} style={{ color: colors.heading }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
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
      <ProductsContent />
    </Suspense>
  );
}
