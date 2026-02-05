"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Check,
  FolderTree,
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
  warning: "#ea580c",
  warningBg: "#ffedd5",
  error: "#dc2626",
  errorBg: "#fee2e2",
};

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  emoji: string | null;
  gradient_colors: string[] | null;
  display_order: number;
  is_active: boolean;
  products_count?: number;
  subcategories_count?: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    emoji: "",
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/v1/admin/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setCategories(
        Array.isArray(data.data) ? data.data : data.data.categories || [],
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      emoji: "",
      display_order: categories.length,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      emoji: category.emoji || "",
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("accessToken");
      const url = editingCategory
        ? `/api/v1/admin/categories/${editingCategory.id}`
        : "/api/v1/admin/categories";
      const method = editingCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(
        editingCategory
          ? "Category updated successfully"
          : "Category created successfully",
      );
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Category deleted successfully");
      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !category.is_active }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      fetchCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: colors.heading }}
          >
            Category Management
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.body }}>
            Manage product categories for your platform
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.accent,
            color: colors.white,
            borderRadius: "4px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.accentHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.accent;
          }}
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Categories Table */}
      <div
        className="border overflow-hidden"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {loading ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            Loading categories...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            <FolderTree
              size={48}
              strokeWidth={1}
              className="mx-auto mb-4 opacity-50"
            />
            <p>No categories found</p>
            <button
              onClick={handleCreate}
              className="mt-4 text-sm font-medium underline"
              style={{ color: colors.accent }}
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead
                className="border-b"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                }}
              >
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Category
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Slug
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Products
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Order
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Status
                  </th>
                  <th
                    className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                    style={{ color: colors.body }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className="border-b last:border-b-0"
                    style={{ borderColor: colors.border }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {category.emoji && (
                          <span className="text-xl">{category.emoji}</span>
                        )}
                        <div>
                          <div
                            className="font-medium text-sm"
                            style={{ color: colors.heading }}
                          >
                            {category.name}
                          </div>
                          {category.description && (
                            <div
                              className="text-xs truncate max-w-xs"
                              style={{ color: colors.body }}
                            >
                              {category.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code
                        className="text-xs px-2 py-1"
                        style={{
                          backgroundColor: colors.background,
                          color: colors.body,
                          borderRadius: "4px",
                        }}
                      >
                        {category.slug}
                      </code>
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.body }}
                    >
                      {category.products_count || 0}
                    </td>
                    <td
                      className="px-6 py-4 text-sm"
                      style={{ color: colors.body }}
                    >
                      {category.display_order}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className="text-xs px-2 py-1 font-medium"
                        style={{
                          backgroundColor: category.is_active
                            ? colors.successBg
                            : colors.warningBg,
                          color: category.is_active
                            ? colors.success
                            : colors.warning,
                          borderRadius: "4px",
                        }}
                      >
                        {category.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 transition-colors hover:bg-stone-100"
                          style={{ borderRadius: "4px" }}
                          title="Edit"
                        >
                          <Pencil
                            size={16}
                            strokeWidth={1.5}
                            style={{ color: colors.body }}
                          />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 transition-colors hover:bg-red-50"
                          style={{ borderRadius: "4px" }}
                          title="Delete"
                        >
                          <Trash2
                            size={16}
                            strokeWidth={1.5}
                            style={{ color: colors.error }}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowModal(false)}
          />
          <div
            className="relative w-full max-w-md border p-6"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ color: colors.heading }}
              >
                {editingCategory ? "Edit Category" : "Create Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                <X size={20} style={{ color: colors.body }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name: e.target.value,
                      slug: generateSlug(e.target.value),
                    });
                  }}
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  placeholder="Category name"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Slug
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  placeholder="category-slug"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 text-sm border outline-none resize-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  placeholder="Category description (optional)"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.heading }}
                  >
                    Emoji (optional)
                  </label>
                  <input
                    type="text"
                    value={formData.emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, emoji: e.target.value })
                    }
                    className="w-full px-4 py-2 text-sm border outline-none"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                    placeholder="🥬"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.heading }}
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        display_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-4 py-2 text-sm border outline-none"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="is_active"
                  className="text-sm"
                  style={{ color: colors.heading }}
                >
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium border transition-colors hover:bg-stone-50"
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
                  className="flex-1 px-4 py-2 text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accentHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent;
                  }}
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
