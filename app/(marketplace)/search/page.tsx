"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  ArrowLeft,
  Loader2,
  Leaf,
  ShoppingCart,
  Star,
  CheckCircle,
} from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  warning: "#ca8a04",
  success: "#16a34a",
  successBg: "#dcfce7",
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/v1/products?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      if (response.ok) {
        setResults(data.data?.products || data.data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      performSearch(query);
    }
  };

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2"
              style={{ color: colors.body }}
            >
              <ArrowLeft size={20} />
            </button>
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: colors.body }}
                />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, farmers..."
                  autoFocus
                  className="w-full pl-12 pr-4 py-3 text-sm border outline-none focus:border-green-600"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2
              size={32}
              className="animate-spin"
              style={{ color: colors.accent }}
            />
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-sm mb-6" style={{ color: colors.body }}>
              Found {results.length} results for "{initialQuery}"
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="border overflow-hidden"
                  style={{
                    backgroundColor: colors.white,
                    borderColor: colors.border,
                    borderRadius: "4px",
                  }}
                >
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
                  <div className="p-3">
                    <h3
                      className="font-medium text-sm mb-1 truncate"
                      style={{ color: colors.heading }}
                    >
                      {product.name}
                    </h3>
                    {product.farmer && ( <p
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
                    <p className="font-bold" style={{ color: colors.accent }}>
                      {product.currency} {Number(product.price).toLocaleString()}
                      <span
                        className="text-xs font-normal"
                        style={{ color: colors.body }}
                      >
                        /{product.unit}
                      </span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        ) : initialQuery ? (
          <div className="text-center py-16">
            <Search
              size={64}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              No results found
            </h2>
            <p className="mb-6" style={{ color: colors.body }}>
              Try different keywords or browse our{" "}
              <Link
                href="/products"
                className="font-medium hover:underline"
                style={{ color: colors.accent }}
              >
                products
              </Link>
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search
              size={64}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-xl font-bold mb-2"
              style={{ color: colors.heading }}
            >
              Search for products
            </h2>
            <p style={{ color: colors.body }}>
              Start typing to find fresh produce from local farmers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
