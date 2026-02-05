"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  AlertCircle,
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
  errorBg: "#fee2e2",
};

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  is_available: boolean;
  created_at: string;
  seller: {
    id: string;
    name: string;
  };
  category: {
    id: string;
    name: string;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, filterAvailability, currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterAvailability && { is_available: filterAvailability }),
      });

      const response = await fetch(`/api/v1/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setProducts(data.data.products);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (
    productId: string,
    currentStatus: boolean,
  ) => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_available: !currentStatus }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Product availability updated");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Product deleted successfully");
      fetchProducts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.heading }}
        >
          Product Management
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Manage and moderate products on your platform
        </p>
      </div>

      {/* Filters */}
      <div
        className="border p-6"
        style={{
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderRadius: "4px",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.body }}
            />
            <input
              type="text"
              placeholder="Search by product name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border outline-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>
          <select
            value={filterAvailability}
            onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2 text-sm border outline-none"
            style={{
              borderColor: colors.border,
              borderRadius: "4px",
              color: colors.heading,
            }}
          >
            <option value="">All Availability Status</option>
            <option value="true">Available</option>
            <option value="false">Not Available</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
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
            Loading products...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            No products found
          </div>
        ) : (
          <>
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
                    {[
                      "Product",
                      "Seller",
                      "Category",
                      "Price",
                      "Stock",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}
                        style={{ color: colors.body }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: colors.border }}
                    >
                      <td className="px-6 py-4">
                        <div
                          className="font-medium text-sm"
                          style={{ color: colors.heading }}
                        >
                          {product.name}
                        </div>
                        <div
                          className="text-xs truncate max-w-xs mt-1"
                          style={{ color: colors.body }}
                        >
                          {product.description}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.heading }}
                      >
                        {product.seller.name}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: colors.background,
                            color: colors.body,
                            borderRadius: "4px",
                          }}
                        >
                          {product.category.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="font-medium text-sm"
                          style={{ color: colors.heading }}
                        >
                          {formatCurrency(product.price)}
                        </div>
                        <div
                          className="text-xs mt-0.5"
                          style={{ color: colors.body }}
                        >
                          per {product.unit}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.heading }}
                      >
                        {product.stock} {product.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: product.is_available
                              ? colors.successBg
                              : colors.errorBg,
                            color: product.is_available
                              ? colors.success
                              : colors.error,
                            borderRadius: "4px",
                          }}
                        >
                          {product.is_available ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              handleToggleAvailability(
                                product.id,
                                product.is_available,
                              )
                            }
                            className="p-2 transition-colors hover:bg-stone-100"
                            style={{ borderRadius: "4px" }}
                            title={product.is_available ? "Disable" : "Enable"}
                          >
                            {product.is_available ? (
                              <ToggleRight
                                size={18}
                                strokeWidth={1.5}
                                style={{ color: colors.success }}
                              />
                            ) : (
                              <ToggleLeft
                                size={18}
                                strokeWidth={1.5}
                                style={{ color: colors.body }}
                              />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 transition-colors hover:bg-red-50"
                            style={{ borderRadius: "4px" }}
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

            {/* Pagination */}
            <div
              className="px-6 py-4 border-t flex items-center justify-between"
              style={{ borderColor: colors.border }}
            >
              <div className="text-sm" style={{ color: colors.body }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                  style={{ borderColor: colors.border, borderRadius: "4px" }}
                >
                  <ChevronLeft size={16} style={{ color: colors.body }} />
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
                  style={{ borderColor: colors.border, borderRadius: "4px" }}
                >
                  <ChevronRight size={16} style={{ color: colors.body }} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
