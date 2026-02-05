"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ShieldCheck,
  ShieldX,
  X,
  AlertCircle,
  Award,
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
  warning: "#ea580c",
  warningBg: "#ffedd5",
  error: "#dc2626",
  errorBg: "#fee2e2",
};

interface Farmer {
  id: string;
  farm_name: string;
  description: string;
  location: string;
  is_verified: boolean;
  verification_badge: string | null;
  created_at: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    _count: {
      products: number;
    };
  };
}

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationBadge, setVerificationBadge] = useState("");

  useEffect(() => {
    fetchFarmers();
  }, [searchTerm, filterVerified, currentPage]);

  const fetchFarmers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterVerified && { is_verified: filterVerified }),
      });

      const response = await fetch(`/api/v1/admin/farmers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setFarmers(data.data.farmers);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openVerifyModal = (farmer: Farmer) => {
    setEditingFarmer(farmer);
    setVerificationBadge(farmer.verification_badge || "");
    setShowVerifyModal(true);
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarmer) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/admin/farmers/${editingFarmer.id}/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            is_verified: !editingFarmer.is_verified,
            verification_badge: verificationBadge || null,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(
        `Farmer ${editingFarmer.is_verified ? "unverified" : "verified"} successfully`,
      );
      setShowVerifyModal(false);
      fetchFarmers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-bold tracking-tight"
          style={{ color: colors.heading }}
        >
          Farmer Management
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Verify and manage farmers on your platform
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
              placeholder="Search by farm name or description..."
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
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-4 py-2 text-sm border outline-none"
            style={{
              borderColor: colors.border,
              borderRadius: "4px",
              color: colors.heading,
            }}
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
        </div>
      </div>

      {/* Farmers Table */}
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
            Loading farmers...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : farmers.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            No farmers found
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
                      "Farm",
                      "Owner",
                      "Contact",
                      "Location",
                      "Products",
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
                  {farmers.map((farmer) => (
                    <tr
                      key={farmer.id}
                      className="border-b last:border-b-0"
                      style={{ borderColor: colors.border }}
                    >
                      <td className="px-6 py-4">
                        <div
                          className="font-medium text-sm"
                          style={{ color: colors.heading }}
                        >
                          {farmer.farm_name}
                        </div>
                        <div
                          className="text-xs truncate max-w-xs mt-1"
                          style={{ color: colors.body }}
                        >
                          {farmer.description}
                        </div>
                        {farmer.verification_badge && (
                          <div className="flex items-center gap-1 mt-2">
                            <Award
                              size={12}
                              style={{ color: colors.warning }}
                            />
                            <span
                              className="text-xs px-2 py-0.5"
                              style={{
                                backgroundColor: colors.warningBg,
                                color: colors.warning,
                                borderRadius: "4px",
                              }}
                            >
                              {farmer.verification_badge}
                            </span>
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.heading }}
                      >
                        {farmer.user.name}
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="text-sm"
                          style={{ color: colors.heading }}
                        >
                          {farmer.user.email}
                        </div>
                        {farmer.user.phone_number && (
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: colors.body }}
                          >
                            {farmer.user.phone_number}
                          </div>
                        )}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.heading }}
                      >
                        {farmer.location}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.heading }}
                      >
                        {farmer.user._count.products} products
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: farmer.is_verified
                              ? colors.successBg
                              : colors.warningBg,
                            color: farmer.is_verified
                              ? colors.success
                              : colors.warning,
                            borderRadius: "4px",
                          }}
                        >
                          {farmer.is_verified ? "Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <button
                            onClick={() => openVerifyModal(farmer)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border transition-colors hover:bg-stone-50"
                            style={{
                              borderColor: farmer.is_verified
                                ? colors.warning
                                : colors.success,
                              color: farmer.is_verified
                                ? colors.warning
                                : colors.success,
                              borderRadius: "4px",
                            }}
                          >
                            {farmer.is_verified ? (
                              <>
                                <ShieldX size={14} strokeWidth={1.5} />
                                Unverify
                              </>
                            ) : (
                              <>
                                <ShieldCheck size={14} strokeWidth={1.5} />
                                Verify
                              </>
                            )}
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

      {/* Verification Modal */}
      {showVerifyModal && editingFarmer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowVerifyModal(false)}
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
              <div>
                <h2
                  className="text-lg font-bold"
                  style={{ color: colors.heading }}
                >
                  {editingFarmer.is_verified
                    ? "Unverify Farmer"
                    : "Verify Farmer"}
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.body }}>
                  {editingFarmer.farm_name}
                </p>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="p-1 hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                <X size={20} style={{ color: colors.body }} />
              </button>
            </div>
            <form onSubmit={handleVerification} className="space-y-4">
              {!editingFarmer.is_verified && (
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.heading }}
                  >
                    Verification Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={verificationBadge}
                    onChange={(e) => setVerificationBadge(e.target.value)}
                    placeholder="e.g., Organic Certified, Premium Farmer"
                    className="w-full px-4 py-2 text-sm border outline-none"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                      color: colors.heading,
                    }}
                  />
                  <p className="text-xs mt-2" style={{ color: colors.body }}>
                    Optional badge to display on farmer's profile
                  </p>
                </div>
              )}
              <div
                className="p-4 border"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.border,
                  borderRadius: "4px",
                }}
              >
                <p className="text-sm" style={{ color: colors.body }}>
                  {editingFarmer.is_verified
                    ? "This will remove the verification status and badge from this farmer."
                    : "This will mark the farmer as verified and display the badge on their profile."}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
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
                    backgroundColor: editingFarmer.is_verified
                      ? colors.warning
                      : colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  {editingFarmer.is_verified
                    ? "Unverify Farmer"
                    : "Verify Farmer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
