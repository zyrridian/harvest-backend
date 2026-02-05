"use client";

import { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Search,
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
  info: "#2563eb",
  infoBg: "#dbeafe",
  purple: "#7c3aed",
  purpleBg: "#f3e8ff",
};

interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string | null;
  user_type: string;
  is_verified: boolean;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [searchTerm, filterType, filterVerified, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(searchTerm && { search: searchTerm }),
        ...(filterType && { user_type: filterType }),
        ...(filterVerified && { is_verified: filterVerified }),
      });

      const response = await fetch(`/api/v1/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUsers(data.data.users);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("User deleted successfully");
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`/api/v1/admin/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone_number: editingUser.phone_number,
          user_type: editingUser.user_type,
          is_verified: editingUser.is_verified,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getUserTypeStyle = (type: string) => {
    switch (type) {
      case "ADMIN":
        return { bg: colors.purpleBg, color: colors.purple };
      case "PRODUCER":
        return { bg: colors.successBg, color: colors.success };
      default:
        return { bg: colors.infoBg, color: colors.info };
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
          User Management
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Manage all users on your platform
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: colors.body }}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
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
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 text-sm border outline-none"
            style={{
              borderColor: colors.border,
              borderRadius: "4px",
              color: colors.heading,
            }}
          >
            <option value="">All User Types</option>
            <option value="CONSUMER">Consumer</option>
            <option value="PRODUCER">Producer</option>
            <option value="ADMIN">Admin</option>
          </select>
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

      {/* Users Table */}
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
            Loading users...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            No users found
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
                      "Name",
                      "Email",
                      "Phone",
                      "Type",
                      "Status",
                      "Joined",
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
                  {users.map((user) => {
                    const typeStyle = getUserTypeStyle(user.user_type);
                    return (
                      <tr
                        key={user.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: colors.border }}
                      >
                        <td className="px-6 py-4">
                          <div
                            className="font-medium text-sm"
                            style={{ color: colors.heading }}
                          >
                            {user.name}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.body }}
                        >
                          {user.email}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.body }}
                        >
                          {user.phone_number || "-"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: typeStyle.bg,
                              color: typeStyle.color,
                              borderRadius: "4px",
                            }}
                          >
                            {user.user_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: user.is_verified
                                ? colors.successBg
                                : colors.background,
                              color: user.is_verified
                                ? colors.success
                                : colors.body,
                              borderRadius: "4px",
                            }}
                          >
                            {user.is_verified ? "Verified" : "Not Verified"}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.body }}
                        >
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2 transition-colors hover:bg-stone-100"
                              style={{ borderRadius: "4px" }}
                            >
                              <Pencil
                                size={16}
                                strokeWidth={1.5}
                                style={{ color: colors.body }}
                              />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
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
                    );
                  })}
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

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowEditModal(false)}
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
                Edit User
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                <X size={20} style={{ color: colors.body }} />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Name
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Phone
                </label>
                <input
                  type="text"
                  value={editingUser.phone_number || ""}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  User Type
                </label>
                <select
                  value={editingUser.user_type}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      user_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                >
                  <option value="CONSUMER">Consumer</option>
                  <option value="PRODUCER">Producer</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_verified"
                  checked={editingUser.is_verified}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      is_verified: e.target.checked,
                    })
                  }
                  className="w-4 h-4"
                />
                <label
                  htmlFor="is_verified"
                  className="text-sm"
                  style={{ color: colors.heading }}
                >
                  Verified
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
