"use client";

import { useEffect, useState } from "react";
import {
  Package,
  X,
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
  warning: "#ea580c",
  warningBg: "#ffedd5",
  error: "#dc2626",
  errorBg: "#fee2e2",
  info: "#2563eb",
  infoBg: "#dbeafe",
  purple: "#7c3aed",
  purpleBg: "#f3e8ff",
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_price: number;
  tracking_number: string | null;
  created_at: string;
  buyer: {
    id: string;
    name: string;
    email: string;
  };
  seller: {
    id: string;
    name: string;
  };
  items_count: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newTrackingNumber, setNewTrackingNumber] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [filterStatus, currentPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        ...(filterStatus && { status: filterStatus }),
      });

      const response = await fetch(`/api/v1/admin/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setOrders(data.data.orders);
      setTotalPages(data.data.pagination.total_pages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `/api/v1/admin/orders/${editingOrder.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            ...(newTrackingNumber && { tracking_number: newTrackingNumber }),
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      alert("Order status updated successfully");
      setShowStatusModal(false);
      fetchOrders();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openStatusModal = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setNewTrackingNumber(order.tracking_number || "");
    setShowStatusModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return { bg: colors.warningBg, color: colors.warning };
      case "PROCESSING":
        return { bg: colors.infoBg, color: colors.info };
      case "SHIPPED":
        return { bg: colors.purpleBg, color: colors.purple };
      case "DELIVERED":
        return { bg: colors.successBg, color: colors.success };
      case "CANCELLED":
        return { bg: colors.errorBg, color: colors.error };
      default:
        return { bg: colors.background, color: colors.body };
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
          Order Management
        </h1>
        <p className="text-sm mt-1" style={{ color: colors.body }}>
          Monitor and manage all orders
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
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 text-sm border outline-none"
          style={{
            borderColor: colors.border,
            borderRadius: "4px",
            color: colors.heading,
          }}
        >
          <option value="">All Order Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
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
            Loading orders...
          </div>
        ) : error ? (
          <div
            className="p-8 text-center flex items-center justify-center gap-2"
            style={{ color: colors.error }}
          >
            <AlertCircle size={18} />
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center" style={{ color: colors.body }}>
            No orders found
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
                      "Order",
                      "Buyer",
                      "Seller",
                      "Items",
                      "Total",
                      "Status",
                      "Date",
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
                  {orders.map((order) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <tr
                        key={order.id}
                        className="border-b last:border-b-0"
                        style={{ borderColor: colors.border }}
                      >
                        <td className="px-6 py-4">
                          <div
                            className="font-medium text-sm"
                            style={{ color: colors.heading }}
                          >
                            #{order.order_number}
                          </div>
                          {order.tracking_number && (
                            <div
                              className="text-xs mt-0.5"
                              style={{ color: colors.body }}
                            >
                              Track: {order.tracking_number}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div
                            className="font-medium text-sm"
                            style={{ color: colors.heading }}
                          >
                            {order.buyer.name}
                          </div>
                          <div
                            className="text-xs mt-0.5"
                            style={{ color: colors.body }}
                          >
                            {order.buyer.email}
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.heading }}
                        >
                          {order.seller.name}
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.heading }}
                        >
                          {order.items_count} items
                        </td>
                        <td
                          className="px-6 py-4 font-medium text-sm"
                          style={{ color: colors.heading }}
                        >
                          {formatCurrency(order.total_price)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: statusStyle.bg,
                              color: statusStyle.color,
                              borderRadius: "4px",
                            }}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td
                          className="px-6 py-4 text-sm"
                          style={{ color: colors.body }}
                        >
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <button
                              onClick={() => openStatusModal(order)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border transition-colors hover:bg-stone-50"
                              style={{
                                borderColor: colors.border,
                                color: colors.heading,
                                borderRadius: "4px",
                              }}
                            >
                              <Package size={14} strokeWidth={1.5} />
                              Update
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

      {/* Status Update Modal */}
      {showStatusModal && editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/20"
            onClick={() => setShowStatusModal(false)}
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
                  Update Order Status
                </h2>
                <p className="text-sm mt-1" style={{ color: colors.body }}>
                  Order #{editingOrder.order_number}
                </p>
              </div>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 hover:bg-stone-100"
                style={{ borderRadius: "4px" }}
              >
                <X size={20} style={{ color: colors.body }} />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                  required
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Tracking Number (Optional)
                </label>
                <input
                  type="text"
                  value={newTrackingNumber}
                  onChange={(e) => setNewTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    borderRadius: "4px",
                    color: colors.heading,
                  }}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
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
                  Update Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
