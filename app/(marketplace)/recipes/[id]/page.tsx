"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, Clock, Users, Heart, Share2 } from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
};

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecipe();
  }, []);

  const fetchRecipe = async () => {
    try {
      const res = await fetch(`/api/v1/recipes/${id}`);
      const data = await res.json();
      if (res.ok) {
        setRecipe(data.data.recipe);
      } else {
        setError(data.message || "Recipe not found");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green-600" size={32} /></div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;
  if (!recipe) return null;

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-4 flex items-center justify-between">
        <button onClick={() => router.back()} style={{ color: colors.body }}><ChevronLeft size={24} /></button>
        <div className="flex gap-4">
          <button style={{ color: colors.body }}><Heart size={20} /></button>
          <button style={{ color: colors.body }}><Share2 size={20} /></button>
        </div>
      </div>

      {/* Hero Image */}
      <div className="max-w-2xl mx-auto px-0 md:px-4 md:mt-4">
        <div className="w-full aspect-video bg-gray-200 overflow-hidden md:rounded-lg max-h-[400px]">
          {recipe.imageUrl && <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: colors.heading }}>{recipe.title}</h1>
        
        {/* Author info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {recipe.author.avatarUrl && <img src={recipe.author.avatarUrl} className="w-full h-full object-cover" />}
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: colors.heading }}>{recipe.author.name}</p>
            <p className="text-xs" style={{ color: colors.body }}>{new Date(recipe.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {recipe.description && <p className="mb-6 text-sm" style={{ color: colors.body }}>{recipe.description}</p>}

        {/* Quick Stats */}
        <div className="flex gap-6 mb-8 py-4 border-y border-gray-200">
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: colors.accent }} />
            <div>
              <p className="text-xs text-gray-500">Prep</p>
              <p className="text-sm font-medium">{recipe.prepTimeMinutes || "-"}m</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={18} style={{ color: colors.accent }} />
            <div>
              <p className="text-xs text-gray-500">Cook</p>
              <p className="text-sm font-medium">{recipe.cookTimeMinutes || "-"}m</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users size={18} style={{ color: colors.accent }} />
            <div>
              <p className="text-xs text-gray-500">Serves</p>
              <p className="text-sm font-medium">{recipe.servings || "-"}</p>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.heading }}>Ingredients</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing: any) => (
              <li key={ing.id} className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm" style={{ color: colors.body }}>{ing.name}</span>
                <span className="text-sm font-medium" style={{ color: colors.heading }}>
                  {ing.quantity} {ing.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: colors.heading }}>Instructions</h2>
          <div className="space-y-6">
            {recipe.instructions.map((step: string, idx: number) => (
              <div key={idx} className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: colors.accent }}>
                  {idx + 1}
                </div>
                <p className="text-sm mt-0.5" style={{ color: colors.body }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
