"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  MapPin,
  Truck,
  CreditCard,
  Wallet,
  Building2,
  Clock,
  Loader2,
  Plus,
  CheckCircle,
  AlertCircle,
  Leaf,
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
};

interface Address {
  address_id: string;
  label: string;
  recipient_name: string;
  phone: string;
  full_address: string;
  city: string;
  is_primary: boolean;
}

interface CartItem {
  cart_item_id: string;
  quantity: number;
  is_selected: boolean;
  product: {
    product_id: string;
    name: string;
    price: number;
    discount: { discounted_price: number } | null;
    image: string | null;
    unit: string;
    seller: { user_id: string; name: string };
  };
  subtotal: number;
}

interface CartSummary {
  subtotal: number;
  total_discount: number;
  total_delivery_fee: number;
  service_fee: number;
  grand_total: number;
}

const paymentMethods = [
  {
    id: "bank_transfer",
    name: "Bank Transfer",
    icon: Building2,
    description: "Transfer to our bank account",
  },
  {
    id: "e_wallet",
    name: "E-Wallet",
    icon: Wallet,
    description: "GoPay, OVO, DANA, ShopeePay",
  },
  {
    id: "credit_card",
    name: "Credit Card",
    icon: CreditCard,
    description: "Visa, Mastercard, JCB",
  },
];

const deliveryOptions = [
  {
    id: "home_delivery",
    name: "Home Delivery",
    description: "Delivered to your address",
    fee: 15000,
  },
  {
    id: "pickup",
    name: "Store Pickup",
    description: "Pick up at farmer's location",
    fee: 0,
  },
];

const timeSlots = [
  { id: "morning", label: "Morning", time: "08:00 - 12:00" },
  { id: "afternoon", label: "Afternoon", time: "12:00 - 17:00" },
  { id: "evening", label: "Evening", time: "17:00 - 21:00" },
];

export default function CheckoutPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);

  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState("bank_transfer");
  const [selectedDelivery, setSelectedDelivery] = useState("home_delivery");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("morning");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchData();
    // Set default delivery date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDeliveryDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/checkout");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchData = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const [cartRes, addressRes] = await Promise.all([
        fetch("/api/v1/cart", { headers }),
        fetch("/api/v1/addresses", { headers }),
      ]);

      if (cartRes.status === 401 || addressRes.status === 401) {
        router.push("/login?redirect=/checkout");
        return;
      }

      const cartData = await cartRes.json();
      const addressData = await addressRes.json();

      if (cartRes.ok) {
        const selectedItems = (cartData.data.items || []).filter(
          (item: CartItem) => item.is_selected,
        );
        setCartItems(selectedItems);
        setSummary(cartData.data.summary);

        if (selectedItems.length === 0) {
          router.push("/cart");
          return;
        }
      }

      if (addressRes.ok) {
        setAddresses(addressData.data.addresses || []);
        const primaryAddr = (addressData.data.addresses || []).find(
          (a: Address) => a.is_primary,
        );
        if (primaryAddr) {
          setSelectedAddress(primaryAddr.address_id);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress && selectedDelivery === "home_delivery") {
      setError("Please select a delivery address");
      return;
    }

    const headers = getAuthHeaders();
    if (!headers) return;

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/v1/orders", {
        method: "POST",
        headers,
        body: JSON.stringify({
          cart_item_ids: cartItems.map((item) => item.cart_item_id),
          delivery_address_id: selectedAddress || null,
          delivery_method: selectedDelivery,
          delivery_date: deliveryDate,
          delivery_time_slot: selectedTimeSlot,
          payment_method: selectedPayment,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      // Navigate to payment success page with order details
      const orderIds = data.data.orders.map((o: any) => o.order_id).join(",");
      router.push(
        `/checkout/success?orders=${orderIds}&total=${data.data.payment_summary.grand_total}&method=${selectedPayment}`,
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDeliveryOption = deliveryOptions.find(
    (d) => d.id === selectedDelivery,
  );
  const selectedAddressData = addresses.find(
    (a) => a.address_id === selectedAddress,
  );

  const calculatedTotal = summary
    ? summary.subtotal +
      (selectedDeliveryOption?.fee || 0) +
      summary.service_fee -
      summary.total_discount
    : 0;

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
      className="min-h-screen pb-80"
    >
      {/* Header */}
      <div
        className="border-b sticky top-0 z-10"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1"
            style={{ color: colors.body }}
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold" style={{ color: colors.heading }}>
            Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div
            className="p-4 flex items-center gap-3"
            style={{
              backgroundColor: colors.errorBg,
              borderRadius: "4px",
            }}
          >
            <AlertCircle size={20} style={{ color: colors.error }} />
            <p className="text-sm" style={{ color: colors.error }}>
              {error}
            </p>
          </div>
        )}

        {/* Delivery Address */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.border }}
          >
            <MapPin size={20} style={{ color: colors.accent }} />
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Delivery Address
            </h2>
          </div>
          <div className="p-4">
            {addresses.length === 0 ? (
              <Link
                href="/profile/addresses/new?redirect=/checkout"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed"
                style={{
                  borderColor: colors.border,
                  borderRadius: "4px",
                  color: colors.accent,
                }}
              >
                <Plus size={20} />
                <span className="font-medium">Add New Address</span>
              </Link>
            ) : (
              <div className="space-y-3">
                {addresses.map((addr) => (
                  <label
                    key={addr.address_id}
                    className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                      selectedAddress === addr.address_id
                        ? "border-green-600"
                        : ""
                    }`}
                    style={{
                      borderColor:
                        selectedAddress === addr.address_id
                          ? colors.accent
                          : colors.border,
                      borderRadius: "4px",
                      backgroundColor:
                        selectedAddress === addr.address_id
                          ? colors.successBg
                          : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.address_id}
                      checked={selectedAddress === addr.address_id}
                      onChange={(e) => setSelectedAddress(e.target.value)}
                      className="mt-1"
                      style={{ accentColor: colors.accent }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="font-medium text-sm"
                          style={{ color: colors.heading }}
                        >
                          {addr.label}
                        </span>
                        {addr.is_primary && (
                          <span
                            className="text-xs px-2 py-0.5"
                            style={{
                              backgroundColor: colors.accent,
                              color: colors.white,
                              borderRadius: "4px",
                            }}
                          >
                            Primary
                          </span>
                        )}
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
                      <p
                        className="text-sm mt-1"
                        style={{ color: colors.body }}
                      >
                        {addr.full_address}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Delivery Options */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.border }}
          >
            <Truck size={20} style={{ color: colors.accent }} />
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Delivery Method
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {deliveryOptions.map((option) => (
              <label
                key={option.id}
                className={`flex items-center justify-between p-3 border cursor-pointer ${
                  selectedDelivery === option.id ? "border-green-600" : ""
                }`}
                style={{
                  borderColor:
                    selectedDelivery === option.id
                      ? colors.accent
                      : colors.border,
                  borderRadius: "4px",
                  backgroundColor:
                    selectedDelivery === option.id
                      ? colors.successBg
                      : "transparent",
                }}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="delivery"
                    value={option.id}
                    checked={selectedDelivery === option.id}
                    onChange={(e) => setSelectedDelivery(e.target.value)}
                    style={{ accentColor: colors.accent }}
                  />
                  <div>
                    <p
                      className="font-medium text-sm"
                      style={{ color: colors.heading }}
                    >
                      {option.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.body }}>
                      {option.description}
                    </p>
                  </div>
                </div>
                <span
                  className="font-medium text-sm"
                  style={{ color: colors.accent }}
                >
                  {option.fee > 0
                    ? `IDR ${option.fee.toLocaleString()}`
                    : "Free"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Delivery Schedule */}
        {selectedDelivery === "home_delivery" && (
          <div
            className="border"
            style={{
              backgroundColor: colors.white,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <div
              className="p-4 border-b flex items-center gap-3"
              style={{ borderColor: colors.border }}
            >
              <Clock size={20} style={{ color: colors.accent }} />
              <h2 className="font-bold" style={{ color: colors.heading }}>
                Delivery Schedule
              </h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.heading }}
                >
                  Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  min={
                    new Date(Date.now() + 86400000).toISOString().split("T")[0]
                  }
                  className="w-full p-3 border text-sm"
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
                  Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.id)}
                      className={`p-3 border text-center ${
                        selectedTimeSlot === slot.id ? "border-green-600" : ""
                      }`}
                      style={{
                        borderColor:
                          selectedTimeSlot === slot.id
                            ? colors.accent
                            : colors.border,
                        borderRadius: "4px",
                        backgroundColor:
                          selectedTimeSlot === slot.id
                            ? colors.successBg
                            : "transparent",
                      }}
                    >
                      <p
                        className="font-medium text-sm"
                        style={{ color: colors.heading }}
                      >
                        {slot.label}
                      </p>
                      <p className="text-xs" style={{ color: colors.body }}>
                        {slot.time}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Items */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: colors.border }}>
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Order Items ({cartItems.length})
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: colors.border }}>
            {cartItems.map((item) => (
              <div key={item.cart_item_id} className="p-4 flex gap-3">
                <div
                  className="w-16 h-16 flex-shrink-0 border overflow-hidden"
                  style={{ borderColor: colors.border, borderRadius: "4px" }}
                >
                  {item.product.image ? (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: "#f4f4f5" }}
                    >
                      <Leaf size={24} style={{ color: colors.border }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: colors.heading }}
                  >
                    {item.product.name}
                  </p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    {item.product.seller.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: colors.body }}>
                    {item.quantity} x IDR{" "}
                    {Number(
                      item.product.discount?.discounted_price ||
                        item.product.price,
                    ).toLocaleString()}
                  </p>
                </div>
                <p
                  className="font-medium text-sm"
                  style={{ color: colors.heading }}
                >
                  IDR {Number(item.subtotal).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div
            className="p-4 border-b flex items-center gap-3"
            style={{ borderColor: colors.border }}
          >
            <CreditCard size={20} style={{ color: colors.accent }} />
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Payment Method
            </h2>
          </div>
          <div className="p-4 space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <label
                  key={method.id}
                  className={`flex items-center gap-3 p-3 border cursor-pointer ${
                    selectedPayment === method.id ? "border-green-600" : ""
                  }`}
                  style={{
                    borderColor:
                      selectedPayment === method.id
                        ? colors.accent
                        : colors.border,
                    borderRadius: "4px",
                    backgroundColor:
                      selectedPayment === method.id
                        ? colors.successBg
                        : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={selectedPayment === method.id}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    style={{ accentColor: colors.accent }}
                  />
                  <Icon size={20} style={{ color: colors.heading }} />
                  <div>
                    <p
                      className="font-medium text-sm"
                      style={{ color: colors.heading }}
                    >
                      {method.name}
                    </p>
                    <p className="text-xs" style={{ color: colors.body }}>
                      {method.description}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div
          className="border"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "4px",
          }}
        >
          <div className="p-4">
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: colors.heading }}
            >
              Order Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions..."
              rows={3}
              className="w-full p-3 border text-sm resize-none"
              style={{
                borderColor: colors.border,
                borderRadius: "4px",
                color: colors.heading,
              }}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Summary */}
      <div
        className="fixed bottom-0 left-0 right-0 border-t"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          {/* Summary breakdown */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.body }}>Subtotal</span>
              <span style={{ color: colors.heading }}>
                IDR {Number(summary?.subtotal || 0).toLocaleString()}
              </span>
            </div>
            {(summary?.total_discount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.success }}>Discount</span>
                <span style={{ color: colors.success }}>
                  -IDR {Number(summary?.total_discount || 0).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.body }}>Delivery Fee</span>
              <span style={{ color: colors.heading }}>
                {selectedDeliveryOption?.fee === 0
                  ? "Free"
                  : `IDR ${Number(selectedDeliveryOption?.fee || 0).toLocaleString()}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.body }}>Service Fee</span>
              <span style={{ color: colors.heading }}>
                IDR {Number(summary?.service_fee || 2000).toLocaleString()}
              </span>
            </div>
            <div
              className="flex justify-between pt-2 border-t"
              style={{ borderColor: colors.border }}
            >
              <span className="font-bold" style={{ color: colors.heading }}>
                Total
              </span>
              <span
                className="font-bold text-lg"
                style={{ color: colors.accent }}
              >
                IDR {Number(calculatedTotal).toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={
              submitting ||
              (selectedDelivery === "home_delivery" && !selectedAddress)
            }
            className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Place Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
