"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  MapPin,
  Edit2,
  Trash2,
  Loader2,
  CheckCircle,
  Star,
} from "lucide-react";

const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  error: "#dc2626",
};

interface Address {
  address_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  city: string;
  postal_code: string;
  is_primary: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/profile/addresses");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchAddresses = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch("/api/v1/addresses", { headers });
      const data = await response.json();
      if (response.ok) {
        setAddresses(data.data.addresses || []);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (addressId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setDeleting(addressId);
    try {
      const response = await fetch(`/api/v1/addresses/${addressId}`, {
        method: "DELETE",
        headers,
      });
      if (response.ok) {
        setAddresses((prev) => prev.filter((a) => a.address_id !== addressId));
      }
    } catch (error) {
      console.error("Failed to delete address:", error);
    } finally {
      setDeleting(null);
    }
  };

  const setPrimary = async (addressId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`/api/v1/addresses/${addressId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_primary: true }),
      });
      if (response.ok) {
        fetchAddresses();
      }
    } catch (error) {
      console.error("Failed to set primary:", error);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <Loader2
          size={32}
          className="animate-spin"
          style={{ color: colors.accent }}
        />
      </div>
    );
  }

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen pb-8"
    >
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-1"
              style={{ color: colors.body }}
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
              My Addresses
            </h1>
          </div>
          <Link
            href="/profile/addresses/new"
            className="p-2 flex items-center gap-2 text-sm font-medium"
            style={{ color: colors.accent }}
          >
            <Plus size={20} />
            Add
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin
              size={48}
              className="mx-auto mb-4"
              style={{ color: colors.border }}
            />
            <h2
              className="text-lg font-bold mb-2"
              style={{ color: colors.heading }}
            >
              No addresses yet
            </h2>
            <p className="mb-6" style={{ color: colors.body }}>
              Add your delivery addresses to make checkout faster
            </p>
            <Link
              href="/profile/addresses/new"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
              style={{
                backgroundColor: colors.accent,
                color: colors.white,
                borderRadius: "4px",
              }}
            >
              <Plus size={18} />
              Add New Address
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div
                key={addr.address_id}
                className="p-4 border"
                style={{
                  backgroundColor: colors.white,
                  borderColor: addr.is_primary ? colors.accent : colors.border,
                  borderRadius: "4px",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="font-medium"
                      style={{ color: colors.heading }}
                    >
                      {addr.label}
                    </span>
                    {addr.is_primary && (
                      <span
                        className="text-xs px-2 py-0.5"
                        style={{
                          backgroundColor: colors.successBg,
                          color: colors.success,
                          borderRadius: "4px",
                        }}
                      >
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/profile/addresses/${addr.address_id}/edit`}
                      className="p-2"
                      style={{ color: colors.body }}
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button
                      onClick={() => deleteAddress(addr.address_id)}
                      disabled={deleting === addr.address_id}
                      className="p-2"
                      style={{ color: colors.error }}
                    >
                      {deleting === addr.address_id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <p
                  className="text-sm font-medium"
                  style={{ color: colors.heading }}
                >
                  {addr.recipient_name}
                </p>
                <p className="text-sm" style={{ color: colors.body }}>
                  {addr.phone}
                </p>
                <p className="text-sm mt-2" style={{ color: colors.body }}>
                  {addr.full_address}
                </p>
                <p className="text-sm" style={{ color: colors.body }}>
                  {addr.city} {addr.postal_code}
                </p>

                {!addr.is_primary && (
                  <button
                    onClick={() => setPrimary(addr.address_id)}
                    className="mt-3 text-sm flex items-center gap-1"
                    style={{ color: colors.accent }}
                  >
                    <Star size={14} />
                    Set as primary
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
