"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Loader2, Plus, ChefHat, Heart, Eye, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  error: "#dc2626",
};

export default function MyRecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRecipes();
  }, []);

  const fetchMyRecipes = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/login?redirect=/profile/recipes");
        return;
      }

      // First get current user ID
      const meRes = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const meData = await meRes.json();
      const myId = meData.data?.id;

      if (!myId) return;

      // Then fetch all recipes and filter (simple hack until API has my-recipes endpoint)
      const res = await fetch("/api/v1/recipes");
      const data = await res.json();
      if (res.ok) {
        setRecipes(data.data.recipes.filter((r: any) => r.author.id === myId));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!confirm("Delete this recipe?")) return;
    
    // Placeholder for delete API (if implemented)
    // await fetch(`/api/v1/recipes/${id}`, { method: 'DELETE', headers: ... })
    setRecipes(recipes.filter(r => r.id !== id));
  };

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-10" style={{ borderColor: colors.border }}>
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} style={{ color: colors.body }}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold" style={{ color: colors.heading }}>
              My Recipes
            </h1>
          </div>
          <Link
            href="/recipes/new"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded"
            style={{ backgroundColor: colors.accent }}
          >
            <Plus size={16} /> New
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={32} className="animate-spin" style={{ color: colors.accent }} />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 border rounded bg-white" style={{ borderColor: colors.border }}>
            <ChefHat size={48} className="mx-auto mb-4" style={{ color: colors.border }} />
            <p className="mb-4" style={{ color: colors.body }}>You haven't shared any recipes yet.</p>
            <Link
              href="/recipes/new"
              className="inline-block px-6 py-2 text-sm font-medium text-white rounded"
              style={{ backgroundColor: colors.accent }}
            >
              Share your first recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recipes.map(recipe => (
              <Link key={recipe.id} href={`/recipes/${recipe.id}`} className="block border rounded bg-white overflow-hidden group hover:border-green-600 transition-colors" style={{ borderColor: colors.border }}>
                <div className="aspect-square bg-gray-100 relative">
                  {recipe.imageUrl ? (
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat size={32} style={{ color: colors.border }} />
                    </div>
                  )}
                  <button onClick={(e) => handleDelete(e, recipe.id)} className="absolute top-2 right-2 p-2 bg-white rounded-full shadow text-red-500 hover:bg-red-50">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-1" style={{ color: colors.heading }}>{recipe.title}</h3>
                  <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: colors.body }}>
                    <div className="flex items-center gap-1"><Heart size={14} /> {recipe.likesCount}</div>
                    <div className="flex items-center gap-1"><Eye size={14} /> {recipe.viewsCount}</div>
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
