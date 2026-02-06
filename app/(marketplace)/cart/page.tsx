"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingCart,
  Loader2,
  AlertCircle,
  ChevronRight,
  Leaf,
  CheckCircle,
  Truck,
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

interface CartItem {
  cart_item_id: string;
  quantity: number;
  is_selected: boolean;
  product: {
    product_id: string;
    name: string;
    price: number;
    discount: {
      discounted_price: number;
      value: number;
    } | null;
    image: string | null;
    unit: string;
    stock_quantity: number;
    minimum_order: number;
    maximum_order: number | null;
    seller: {
      user_id: string;
      name: string;
    };
    availability: {
      status: string;
    };
  };
  subtotal: number;
}

interface Cart {
  cart_id: string;
  items: CartItem[];
  item_count: number;
  selected_count: number;
  subtotal: number;
  discount_total: number;
  total: number;
  currency: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (cart) {
      setSelectAll(
        cart.items.length > 0 && cart.items.every((item) => item.is_selected)
      );
    }
  }, [cart]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login?redirect=/cart");
      return null;
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const fetchCart = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch("/api/v1/cart", { headers });
      
      if (response.status === 401) {
        router.push("/login?redirect=/cart");
        return;
      }

      const data = await response.json();
      if (response.ok) {
        setCart(data.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (itemId: string, quantity: number) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setUpdatingItem(itemId);
    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Update item error:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: string) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    setUpdatingItem(itemId);
    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        fetchCart();
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Remove item error:", error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const toggleItemSelection = async (itemId: string, selected: boolean) => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await fetch(`/api/v1/cart/items/${itemId}/select`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_selected: selected }),
      });

      if (response.ok) {
        fetchCart();
      }
    } catch (error) {
      console.error("Toggle selection error:", error);
    }
  };

  const toggleSelectAll = async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    const newSelectAll = !selectAll;
    
    try {
      // Update all items
      await Promise.all(
        cart!.items.map((item) =>
          fetch(`/api/v1/cart/items/${item.cart_item_id}/select`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({ is_selected: newSelectAll }),
          })
        )
      );
      fetchCart();
    } catch (error) {
      console.error("Toggle select all error:", error);
    }
  };

  const proceedToCheckout = () => {
    if (!cart || cart.selected_count === 0) return;
    router.push("/checkout");
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

  if (!cart || cart.items.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: colors.background }}
      >
        <div className="text-center max-w-md">
          <ShoppingCart
            size={64}
            className="mx-auto mb-4"
            style={{ color: colors.border }}
          />
          <h1
            className="text-xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Your cart is empty
          </h1>
          <p className="mb-6" style={{ color: colors.body }}>
            Looks like you haven't added anything to your cart yet. Start
            shopping to discover fresh produce from local farmers!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            Browse Products
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.background }} className="min-h-screen pb-24 md:pb-8">
      {/* Header */}
      <div
        className="border-b"
        style={{ backgroundColor: colors.white, borderColor: colors.border }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1
            className="text-xl font-bold"
            style={{ color: colors.heading }}
          >
            Shopping Cart ({cart.item_count} items)
          </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="md:col-span-2 space-y-4">
            {/* Select all */}
            <div
              className="p-4 border flex items-center gap-3"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="w-5 h-5"
                style={{ accentColor: colors.accent }}
              />
              <span className="text-sm font-medium" style={{ color: colors.heading }}>
                Select all items
              </span>
            </div>

            {/* Items list */}
            {cart.items.map((item) => (
              <div
                key={item.cart_item_id}
                className="border overflow-hidden"
                style={{
                  backgroundColor: colors.white,
                  borderColor: colors.border,
                  borderRadius: "4px",
                  opacity:
                    item.product.availability.status === "out_of_stock"
                      ? 0.6
                      : 1,
                }}
              >
                <div className="p-4 flex gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={item.is_selected}
                    onChange={(e) =>
                      toggleItemSelection(item.cart_item_id, e.target.checked)
                    }
                    disabled={
                      item.product.availability.status === "out_of_stock"
                    }
                    className="w-5 h-5 flex-shrink-0"
                    style={{ accentColor: colors.accent }}
                  />

                  {/* Product image */}
                  <Link
                    href={`/products/${item.product.product_id}`}
                    className="w-24 h-24 flex-shrink-0 border overflow-hidden"
                    style={{
                      borderColor: colors.border,
                      borderRadius: "4px",
                    }}
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
                        <Leaf size={32} style={{ color: colors.border }} />
                      </div>
                    )}
                  </Link>

                  {/* Product details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${item.product.product_id}`}
                      className="font-medium text-sm hover:underline"
                      style={{ color: colors.heading }}
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-xs mt-1" style={{ color: colors.body }}>
                      Sold by {item.product.seller.name}
                    </p>

                    {/* Stock status */}
                    {item.product.availability.status === "out_of_stock" ? (
                      <p
                        className="text-xs mt-2 flex items-center gap-1"
                        style={{ color: colors.error }}
                      >
                        <AlertCircle size={12} />
                        Out of stock
                      </p>
                    ) : item.product.stock_quantity < 10 ? (
                      <p
                        className="text-xs mt-2"
                        style={{ color: colors.warning }}
                      >
                        Only {item.product.stock_quantity} left
                      </p>
                    ) : null}

                    {/* Price & Quantity on mobile */}
                    <div className="md:hidden mt-3">
                      <div className="flex items-center justify-between mb-2">
                        {item.product.discount ? (
                          <div>
                            <span
                              className="font-bold"
                              style={{ color: colors.accent }}
                            >
                              {cart.currency}{" "}
                              {Number(
                                item.product.discount.discounted_price
                              ).toLocaleString()}
                            </span>
                            <span
                              className="text-xs line-through ml-2"
                              style={{ color: colors.body }}
                            >
                              {cart.currency}{" "}
                              {Number(item.product.price).toLocaleString()}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="font-bold"
                            style={{ color: colors.accent }}
                          >
                            {cart.currency}{" "}
                            {Number(item.product.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateItemQuantity(
                              item.cart_item_id,
                              Math.max(
                                item.product.minimum_order || 1,
                                item.quantity - 1
                              )
                            )
                          }
                          disabled={
                            updatingItem === item.cart_item_id ||
                            item.quantity <= (item.product.minimum_order || 1)
                          }
                          className="w-8 h-8 flex items-center justify-center border disabled:opacity-50"
                          style={{
                            borderColor: colors.border,
                            borderRadius: "4px",
                          }}
                        >
                          <Minus size={14} style={{ color: colors.heading }} />
                        </button>
                        <span
                          className="w-12 text-center text-sm"
                          style={{ color: colors.heading }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(
                              item.cart_item_id,
                              Math.min(
                                item.product.maximum_order ||
                                  item.product.stock_quantity,
                                item.quantity + 1
                              )
                            )
                          }
                          disabled={
                            updatingItem === item.cart_item_id ||
                            item.quantity >=
                              (item.product.maximum_order ||
                                item.product.stock_quantity)
                          }
                          className="w-8 h-8 flex items-center justify-center border disabled:opacity-50"
                          style={{
                            borderColor: colors.border,
                            borderRadius: "4px",
                          }}
                        >
                          <Plus size={14} style={{ color: colors.heading }} />
                        </button>
                        <button
                          onClick={() => removeItem(item.cart_item_id)}
                          disabled={updatingItem === item.cart_item_id}
                          className="ml-auto p-2"
                        >
                          <Trash2 size={18} style={{ color: colors.error }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Price & Quantity on desktop */}
                  <div className="hidden md:flex flex-col items-end gap-3">
                    {item.product.discount ? (
                      <div className="text-right">
                        <span
                          className="font-bold"
                          style={{ color: colors.accent }}
                        >
                          {cart.currency}{" "}
                          {Number(
                            item.product.discount.discounted_price
                          ).toLocaleString()}
                        </span>
                        <span
                          className="text-xs line-through block"
                          style={{ color: colors.body }}
                        >
                          {cart.currency}{" "}
                          {Number(item.product.price).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span
                        className="font-bold"
                        style={{ color: colors.accent }}
                      >
                        {cart.currency}{" "}
                        {Number(item.product.price).toLocaleString()}
                      </span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateItemQuantity(
                            item.cart_item_id,
                            Math.max(
                              item.product.minimum_order || 1,
                              item.quantity - 1
                            )
                          )
                        }
                        disabled={
                          updatingItem === item.cart_item_id ||
                          item.quantity <= (item.product.minimum_order || 1)
                        }
                        className="w-8 h-8 flex items-center justify-center border disabled:opacity-50"
                        style={{
                          borderColor: colors.border,
                          borderRadius: "4px",
                        }}
                      >
                        <Minus size={14} style={{ color: colors.heading }} />
                      </button>
                      <span
                        className="w-12 text-center text-sm"
                        style={{ color: colors.heading }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateItemQuantity(
                            item.cart_item_id,
                            Math.min(
                              item.product.maximum_order ||
                                item.product.stock_quantity,
                              item.quantity + 1
                            )
                          )
                        }
                        disabled={
                          updatingItem === item.cart_item_id ||
                          item.quantity >=
                            (item.product.maximum_order ||
                              item.product.stock_quantity)
                        }
                        className="w-8 h-8 flex items-center justify-center border disabled:opacity-50"
                        style={{
                          borderColor: colors.border,
                          borderRadius: "4px",
                        }}
                      >
                        <Plus size={14} style={{ color: colors.heading }} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.cart_item_id)}
                      disabled={updatingItem === item.cart_item_id}
                      className="text-xs flex items-center gap-1 hover:underline"
                      style={{ color: colors.error }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Item subtotal */}
                <div
                  className="px-4 py-2 border-t flex justify-between"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }}
                >
                  <span className="text-sm" style={{ color: colors.body }}>
                    Subtotal
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.heading }}
                  >
                    {cart.currency} {Number(item.subtotal).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="md:sticky md:top-4 h-fit">
            <div
              className="border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div
                className="p-4 border-b"
                style={{ borderColor: colors.border }}
              >
                <h2
                  className="font-bold"
                  style={{ color: colors.heading }}
                >
                  Order Summary
                </h2>
              </div>

              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>
                    Subtotal ({cart.selected_count} items)
                  </span>
                  <span style={{ color: colors.heading }}>
                    {cart.currency} {Number(cart.subtotal).toLocaleString()}
                  </span>
                </div>

                {cart.discount_total > 0 && (
                  <div className="flex justify-between text-sm">
                    <span style={{ color: colors.success }}>Discount</span>
                    <span style={{ color: colors.success }}>
                      -{cart.currency}{" "}
                      {Number(cart.discount_total).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span style={{ color: colors.body }}>Shipping</span>
                  <span style={{ color: colors.body }}>
                    Calculated at checkout
                  </span>
                </div>

                <div
                  className="pt-3 border-t flex justify-between"
                  style={{ borderColor: colors.border }}
                >
                  <span
                    className="font-bold"
                    style={{ color: colors.heading }}
                  >
                    Total
                  </span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: colors.accent }}
                  >
                    {cart.currency} {Number(cart.total).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <button
                  onClick={proceedToCheckout}
                  disabled={cart.selected_count === 0}
                  className="w-full py-3 text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.white,
                    borderRadius: "4px",
                  }}
                >
                  Proceed to Checkout
                  <ChevronRight size={16} />
                </button>

                <Link
                  href="/products"
                  className="block text-center text-sm mt-3 hover:underline"
                  style={{ color: colors.accent }}
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Trust badges */}
            <div
              className="mt-4 p-4 border"
              style={{
                backgroundColor: colors.white,
                borderColor: colors.border,
                borderRadius: "4px",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <Truck size={20} style={{ color: colors.accent }} />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.heading }}
                  >
                    Fast Delivery
                  </p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Fresh from farm to your door
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle size={20} style={{ color: colors.accent }} />
                <div>
                  <p
                    className="text-sm font-medium"
                    style={{ color: colors.heading }}
                  >
                    Quality Guarantee
                  </p>
                  <p className="text-xs" style={{ color: colors.body }}>
                    100% fresh or money back
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
