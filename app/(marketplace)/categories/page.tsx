"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Loader2 } from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  product_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/v1/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load categories");
      }

      setCategories(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <p className="mb-4" style={{ color: colors.heading }}>
            {error}
          </p>
          <button
            onClick={fetchCategories}
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

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-24 md:pb-8"
    >
      {/* Header */}
      <section
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: colors.heading }}
          >
            All Categories
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.body }}>
            Browse products by category
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p style={{ color: colors.body }}>No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.slug}`}
                className="flex flex-col items-center p-6 border transition-all hover:border-green-600 hover:shadow-sm group"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "8px",
                }}
              >
                <span className="text-4xl mb-3">{category.emoji || "📦"}</span>
                <h3
                  className="font-medium text-center mb-1 group-hover:text-green-700"
                  style={{ color: colors.heading }}
                >
                  {category.name}
                </h3>
                <span className="text-sm" style={{ color: colors.body }}>
                  {category.product_count} products
                </span>
                {category.description && (
                  <p
                    className="text-xs text-center mt-2 line-clamp-2"
                    style={{ color: colors.body }}
                  >
                    {category.description}
                  </p>
                )}
                <div
                  className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: colors.accent }}
                >
                  Browse <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
