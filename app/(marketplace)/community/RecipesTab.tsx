"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Loader2, ChefHat, Heart, Eye } from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  successBg: "#dcfce7",
};

interface Recipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  prepTimeMinutes: number | null;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  likesCount: number;
  viewsCount: number;
}

export default function RecipesTab() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/v1/recipes");
      const data = await res.json();
      if (res.ok) setRecipes(data.data.recipes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {recipes.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <ChefHat size={48} className="mx-auto mb-4" style={{ color: colors.border }} />
          <p style={{ color: colors.body }}>No recipes found. Be the first to share one!</p>
          <Link
            href="/recipes/new"
            className="inline-block mt-4 px-6 py-2 text-sm font-medium"
            style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
          >
            Share Recipe
          </Link>
        </div>
      ) : (
        recipes.map((recipe) => (
          <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
            <div className="border overflow-hidden group" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "8px" }}>
              <div className="aspect-square bg-gray-100 relative">
                {recipe.imageUrl ? (
                  <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat size={32} style={{ color: colors.border }} />
                  </div>
                )}
                {recipe.prepTimeMinutes && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 text-xs font-medium bg-black/60 text-white rounded">
                    {recipe.prepTimeMinutes}m prep
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-1" style={{ color: colors.heading }}>{recipe.title}</h3>
                <p className="text-xs mt-1" style={{ color: colors.body }}>By {recipe.author.name}</p>
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: colors.body }}>
                  <div className="flex items-center gap-1"><Heart size={14} /> {recipe.likesCount}</div>
                  <div className="flex items-center gap-1"><Eye size={14} /> {recipe.viewsCount}</div>
                </div>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
