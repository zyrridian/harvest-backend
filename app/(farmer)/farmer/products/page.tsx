"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Package,
  AlertCircle,
  Check,
  X,
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
  warningBg: "#fef9c3",
};

interface Product {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  category?: string;
  category_id?: string;
  price: number;
  unit: string;
  stock: number;
  is_organic: boolean;
  is_available: boolean;
  image_url?: string;
  rating: number;
  review_count: number;
  view_count: number;
  orders_count: number;
  harvest_date?: string;
  created_at: string;
  updated_at: string;
}

interface Pagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

export default function FarmerProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    product?: Product;
  }>({
    show: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const status = searchParams.get("status") || "all";
  const page = parseInt(searchParams.get("page") || "1");

  useEffect(() => {
    fetchProducts();
  }, [status, page]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        status,
      });

      const response = await fetch(`/api/v1/farmer/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/farmer/products/${deleteModal.product.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete product");
      }

      setProducts((prev) =>
        prev.filter((p) => p.id !== deleteModal.product!.id),
      );
      setDeleteModal({ show: false });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (product: Product) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/farmer/products/${product.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: !product.is_available }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to update product");
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_available: !p.is_available } : p,
        ),
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const statusTabs = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "out_of_stock", label: "Out of Stock" },
  ];

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.heading }}>
            Products
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Manage your product inventory
          </p>
        </div>
        <Link
          href="/farmer/products/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-colors"
          style={{
            backgroundColor: colors.accent,
            color: colors.white,
            borderRadius: "4px",
          }}
        >
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div
        className="p-4 border flex flex-col sm:flex-row gap-4"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: colors.body }}
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border outline-none transition-colors focus:border-green-700"
            style={{
              borderColor: colors.border,
              borderRadius: "4px",
              color: colors.heading,
            }}
          />
        </div>

        {/* Status Tabs */}
        <div
          className="flex border rounded overflow-hidden"
          style={{ borderColor: colors.border }}
        >
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() =>
                router.push(
                  `/farmer/products${tab.value !== "all" ? `?status=${tab.value}` : ""}`,
                )
              }
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                backgroundColor:
                  status === tab.value ? colors.accent : "transparent",
                color: status === tab.value ? colors.white : colors.body,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
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

      {/* Products Table */}
      <div
        className="border overflow-hidden"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        {isLoading ? (
          <div className="p-8 text-center">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4"
              style={{
                borderColor: colors.accent,
                borderTopColor: "transparent",
              }}
            />
            <p style={{ color: colors.body }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <Package
              size={48}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <p className="font-medium mb-2" style={{ color: colors.heading }}>
              No products found
            </p>
            <p className="text-sm mb-4" style={{ color: colors.body }}>
              {searchQuery
                ? "Try a different search term"
                : "Start by adding your first product"}
            </p>
            {!searchQuery && (
              <Link
                href="/farmer/products/new"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                <Plus size={16} />
                Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Product
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Category
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Price
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Stock
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Status
                  </th>
                  <th
                    className="text-left px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Sales
                  </th>
                  <th
                    className="text-right px-4 py-3 text-sm font-medium"
                    style={{ color: colors.body }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 transition-colors"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: colors.background,
                            borderRadius: "4px",
                          }}
                        >
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <Package size={20} style={{ color: colors.body }} />
                          )}
                        </div>
                        <div>
                          <p
                            className="font-medium"
                            style={{ color: colors.heading }}
                          >
                            {product.name}
                          </p>
                          {product.is_organic && (
                            <span
                              className="text-xs px-2 py-0.5"
                              style={{
                                backgroundColor: colors.successBg,
                                color: colors.accent,
                                borderRadius: "4px",
                              }}
                            >
                              Organic
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm" style={{ color: colors.body }}>
                        {product.category || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="font-medium"
                        style={{ color: colors.heading }}
                      >
                        {formatCurrency(product.price)}
                      </p>
                      <p className="text-xs" style={{ color: colors.body }}>
                        per {product.unit}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p
                        className="font-medium"
                        style={{
                          color:
                            product.stock === 0
                              ? colors.error
                              : product.stock < 10
                                ? colors.warning
                                : colors.heading,
                        }}
                      >
                        {product.stock}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div
                          className={`w-10 h-6 rounded-full relative transition-colors ${
                            product.is_available
                              ? "bg-green-600"
                              : "bg-gray-300"
                          }`}
                        >
                          <div
                            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              product.is_available ? "left-5" : "left-1"
                            }`}
                          />
                        </div>
                        <span style={{ color: colors.body }}>
                          {product.is_available ? "Active" : "Inactive"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p
                          className="font-medium"
                          style={{ color: colors.heading }}
                        >
                          {product.orders_count} orders
                        </p>
                        <p className="text-xs" style={{ color: colors.body }}>
                          {product.view_count} views
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === product.id ? null : product.id,
                            )
                          }
                        >
                          <MoreVertical
                            size={18}
                            style={{ color: colors.body }}
                          />
                        </button>
                        {activeMenu === product.id && (
                          <div
                            className="absolute right-0 mt-1 w-40 py-1 border shadow-lg z-10"
                            style={{
                              backgroundColor: colors.white,
                              borderColor: colors.border,
                              borderRadius: "4px",
                            }}
                          >
                            <Link
                              href={`/products/${product.id}`}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              style={{ color: colors.body }}
                              onClick={() => setActiveMenu(null)}
                            >
                              <Eye size={16} />
                              View
                            </Link>
                            <Link
                              href={`/farmer/products/${product.id}/edit`}
                              className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              style={{ color: colors.body }}
                              onClick={() => setActiveMenu(null)}
                            >
                              <Edit size={16} />
                              Edit
                            </Link>
                            <button
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                              style={{ color: colors.error }}
                              onClick={() => {
                                setDeleteModal({ show: true, product });
                                setActiveMenu(null);
                              }}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.total_pages > 1 && (
          <div
            className="px-4 py-3 border-t flex items-center justify-between"
            style={{ borderColor: colors.border }}
          >
            <p className="text-sm" style={{ color: colors.body }}>
              Showing{" "}
              {(pagination.current_page - 1) * pagination.items_per_page + 1} -{" "}
              {Math.min(
                pagination.current_page * pagination.items_per_page,
                pagination.total_items,
              )}{" "}
              of {pagination.total_items}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.current_page === 1}
                onClick={() =>
                  router.push(
                    `/farmer/products?page=${pagination.current_page - 1}${status !== "all" ? `&status=${status}` : ""}`,
                  )
                }
                className="px-3 py-1 border text-sm disabled:opacity-50"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.body,
                }}
              >
                Previous
              </button>
              <button
                disabled={pagination.current_page === pagination.total_pages}
                onClick={() =>
                  router.push(
                    `/farmer/products?page=${pagination.current_page + 1}${status !== "all" ? `&status=${status}` : ""}`,
                  )
                }
                className="px-3 py-1 border text-sm disabled:opacity-50"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.body,
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0"
            style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
            onClick={() => setDeleteModal({ show: false })}
          />
          <div
            className="relative w-full max-w-md p-6 border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <h3
              className="text-lg font-semibold mb-2"
              style={{ color: colors.heading }}
            >
              Delete Product
            </h3>
            <p className="text-sm mb-6" style={{ color: colors.body }}>
              Are you sure you want to delete "{deleteModal.product?.name}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false })}
                className="px-4 py-2 border text-sm font-medium"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.body,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium disabled:opacity-50"
                style={{
                  backgroundColor: colors.error,
                  color: colors.white,
                  borderRadius: "4px",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
