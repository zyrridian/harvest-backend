"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Trash2, Loader2, Save } from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  error: "#dc2626",
};

export default function NewRecipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [prepTime, setPrepTime] = useState("");
  const [cookTime, setCookTime] = useState("");
  const [servings, setServings] = useState("");

  const [ingredients, setIngredients] = useState([{ name: "", quantity: "", unit: "" }]);
  const [instructions, setInstructions] = useState([""]);

  const handleSave = async () => {
    if (!title) {
      setError("Title is required");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/recipes/new");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/v1/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description: description || null,
          image_url: imageUrl || null,
          prep_time_minutes: prepTime ? parseInt(prepTime) : null,
          cook_time_minutes: cookTime ? parseInt(cookTime) : null,
          servings: servings ? parseInt(servings) : null,
          ingredients: ingredients.filter(i => i.name).map(i => ({
            name: i.name,
            quantity: i.quantity ? parseFloat(i.quantity) : null,
            unit: i.unit || null,
          })),
          instructions: instructions.filter(i => i),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create recipe");

      router.push(`/recipes/${data.data.recipe.id}`);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24">
      {/* Header */}
      <div className="border-b sticky top-0 z-10" style={{ backgroundColor: colors.white, borderColor: colors.border }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} style={{ color: colors.body }}>
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>Share Recipe</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium"
            style={{ backgroundColor: colors.accent, color: colors.white, borderRadius: "4px" }}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Publish
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="p-3 text-sm rounded border border-red-200 bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
          <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Basic Info</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="E.g. Fresh Organic Salad"
                className="w-full p-3 border text-sm"
                style={{ borderColor: colors.border, borderRadius: "4px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                placeholder="A short story about this recipe..."
                className="w-full p-3 border text-sm"
                style={{ borderColor: colors.border, borderRadius: "4px" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL</label>
              <input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border text-sm"
                style={{ borderColor: colors.border, borderRadius: "4px" }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Prep Time (min)</label>
                <input type="number" value={prepTime} onChange={e => setPrepTime(e.target.value)} className="w-full p-2 border text-sm rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cook Time (min)</label>
                <input type="number" value={cookTime} onChange={e => setCookTime(e.target.value)} className="w-full p-2 border text-sm rounded" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Servings</label>
                <input type="number" value={servings} onChange={e => setServings(e.target.value)} className="w-full p-2 border text-sm rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
          <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Ingredients</h2>
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  placeholder="Qty"
                  value={ing.quantity}
                  onChange={e => { const newIngs = [...ingredients]; newIngs[i].quantity = e.target.value; setIngredients(newIngs); }}
                  className="w-20 p-2 border text-sm rounded"
                />
                <input
                  placeholder="Unit (e.g. cup)"
                  value={ing.unit}
                  onChange={e => { const newIngs = [...ingredients]; newIngs[i].unit = e.target.value; setIngredients(newIngs); }}
                  className="w-24 p-2 border text-sm rounded"
                />
                <input
                  placeholder="Ingredient name"
                  value={ing.name}
                  onChange={e => { const newIngs = [...ingredients]; newIngs[i].name = e.target.value; setIngredients(newIngs); }}
                  className="flex-1 p-2 border text-sm rounded"
                />
                <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="p-2 text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setIngredients([...ingredients, { name: "", quantity: "", unit: "" }])}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: colors.accent }}
            >
              <Plus size={16} /> Add Ingredient
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-5 border" style={{ backgroundColor: colors.white, borderColor: colors.border, borderRadius: "4px" }}>
          <h2 className="font-semibold mb-4" style={{ color: colors.heading }}>Instructions</h2>
          <div className="space-y-3">
            {instructions.map((step, i) => (
              <div key={i} className="flex gap-3 items-start">
                <span className="font-bold text-gray-400 mt-2">{i + 1}.</span>
                <textarea
                  value={step}
                  onChange={e => { const newInst = [...instructions]; newInst[i] = e.target.value; setInstructions(newInst); }}
                  placeholder={`Step ${i + 1}...`}
                  rows={2}
                  className="flex-1 p-3 border text-sm rounded resize-none"
                />
                <button onClick={() => setInstructions(instructions.filter((_, idx) => idx !== i))} className="p-2 text-red-500 mt-1">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
            <button
              onClick={() => setInstructions([...instructions, ""])}
              className="flex items-center gap-2 text-sm font-medium"
              style={{ color: colors.accent }}
            >
              <Plus size={16} /> Add Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
