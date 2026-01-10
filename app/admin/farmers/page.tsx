"use client";

import { useEffect, useState } from "react";

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
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert(
        `Farmer ${
          editingFarmer.is_verified ? "unverified" : "verified"
        } successfully`
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
        <h1 className="text-3xl font-bold text-gray-900">Farmer Management</h1>
        <p className="text-gray-600 mt-1">
          Verify and manage farmers on your platform
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Search by farm name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          >
            <option value="">All Verification Status</option>
            <option value="true">Verified</option>
            <option value="false">Not Verified</option>
          </select>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-600">
            Loading farmers...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : farmers.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No farmers found</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Farm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {farmers.map((farmer) => (
                    <tr key={farmer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {farmer.farm_name}
                          </div>
                          <div className="text-sm text-gray-600 truncate max-w-xs">
                            {farmer.description}
                          </div>
                          {farmer.verification_badge && (
                            <div className="mt-1">
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                🏅 {farmer.verification_badge}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{farmer.user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-gray-900">
                            {farmer.user.email}
                          </div>
                          {farmer.user.phone_number && (
                            <div className="text-xs text-gray-600">
                              {farmer.user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">{farmer.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900">
                          {farmer.user._count.products} products
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            farmer.is_verified
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {farmer.is_verified ? "✓ Verified" : "Not Verified"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => openVerifyModal(farmer)}
                          className={`font-medium ${
                            farmer.is_verified
                              ? "text-orange-600 hover:text-orange-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                        >
                          {farmer.is_verified ? "Unverify" : "Verify"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Verification Modal */}
      {showVerifyModal && editingFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingFarmer.is_verified ? "Unverify Farmer" : "Verify Farmer"}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {editingFarmer.farm_name}
            </p>
            <form onSubmit={handleVerification} className="space-y-4">
              {!editingFarmer.is_verified && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verification Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={verificationBadge}
                    onChange={(e) => setVerificationBadge(e.target.value)}
                    placeholder="e.g., Organic Certified, Premium Farmer"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional badge to display on farmer's profile
                  </p>
                </div>
              )}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  {editingFarmer.is_verified
                    ? "This will remove the verification status and badge from this farmer."
                    : "This will mark the farmer as verified and display the badge on their profile."}
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className={`flex-1 font-semibold py-2 rounded-lg ${
                    editingFarmer.is_verified
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {editingFarmer.is_verified
                    ? "Unverify Farmer"
                    : "Verify Farmer"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
