"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle,
  Package,
  Copy,
  Clock,
  Building2,
  Wallet,
  CreditCard,
  ArrowRight,
  Home,
  Loader2,
} from "lucide-react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534",
  border: "#E4E4E7",
  success: "#16a34a",
  successBg: "#dcfce7",
  warning: "#ca8a04",
  warningBg: "#fef9c3",
};

const paymentInstructions: Record<
  string,
  { title: string; icon: any; steps: string[] }
> = {
  bank_transfer: {
    title: "Bank Transfer",
    icon: Building2,
    steps: [
      "Transfer the exact amount to the account below",
      "Use your Order ID as transfer reference",
      "Upload proof of payment (optional)",
      "Payment will be verified within 1-2 hours",
    ],
  },
  e_wallet: {
    title: "E-Wallet",
    icon: Wallet,
    steps: [
      "Open your e-wallet app (GoPay, OVO, DANA, ShopeePay)",
      "Scan the QR code or use the payment code",
      "Confirm the payment in your app",
      "Payment will be verified instantly",
    ],
  },
  credit_card: {
    title: "Credit Card",
    icon: CreditCard,
    steps: [
      "You will be redirected to secure payment page",
      "Enter your card details",
      "Complete 3D Secure verification",
      "Payment will be processed immediately",
    ],
  },
};

const bankDetails = {
  bank_name: "Bank Mandiri",
  account_number: "1234567890123",
  account_name: "PT Farm Market Indonesia",
};

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderIds = searchParams.get("orders") || "";
  const total = searchParams.get("total") || "0";
  const method = searchParams.get("method") || "bank_transfer";

  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const instructions =
    paymentInstructions[method] || paymentInstructions.bank_transfer;
  const Icon = instructions.icon;

  return (
    <div
      style={{ backgroundColor: colors.background }}
      className="min-h-screen py-8 px-4"
    >
      <div className="max-w-lg mx-auto">
        {/* Success Header */}
        <div
          className="text-center p-8 border mb-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "8px",
          }}
        >
          <div
            className="w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.successBg }}
          >
            <CheckCircle size={40} style={{ color: colors.success }} />
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: colors.heading }}
          >
            Order Placed Successfully!
          </h1>
          <p className="text-sm" style={{ color: colors.body }}>
            Your order has been received and is waiting for payment
          </p>
        </div>

        {/* Order Summary */}
        <div
          className="p-6 border mb-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "8px",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} style={{ color: colors.accent }} />
            <h2 className="font-bold" style={{ color: colors.heading }}>
              Order Summary
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.body }}>Order ID</span>
              <span
                className="font-medium font-mono"
                style={{ color: colors.heading }}
              >
                {orderIds.split(",")[0]?.substring(0, 8) || "---"}...
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: colors.body }}>Payment Method</span>
              <span className="font-medium" style={{ color: colors.heading }}>
                {instructions.title}
              </span>
            </div>
            <div
              className="flex justify-between pt-3 border-t"
              style={{ borderColor: colors.border }}
            >
              <span className="font-bold" style={{ color: colors.heading }}>
                Total Amount
              </span>
              <span
                className="font-bold text-xl"
                style={{ color: colors.accent }}
              >
                IDR {Number(total).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Countdown */}
        <div
          className="p-4 mb-6 flex items-center justify-center gap-3"
          style={{
            backgroundColor: colors.warningBg,
            borderRadius: "8px",
          }}
        >
          <Clock size={20} style={{ color: colors.warning }} />
          <div className="text-center">
            <p className="text-sm" style={{ color: colors.warning }}>
              Complete payment within
            </p>
            <p
              className="text-2xl font-bold font-mono"
              style={{ color: colors.warning }}
            >
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div
          className="p-6 border mb-6"
          style={{
            backgroundColor: colors.white,
            borderColor: colors.border,
            borderRadius: "8px",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Icon size={20} style={{ color: colors.accent }} />
            <h2 className="font-bold" style={{ color: colors.heading }}>
              {instructions.title} Instructions
            </h2>
          </div>

          {method === "bank_transfer" && (
            <div
              className="p-4 mb-4"
              style={{
                backgroundColor: colors.background,
                borderRadius: "4px",
              }}
            >
              <div className="space-y-3">
                <div>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Bank Name
                  </p>
                  <p className="font-medium" style={{ color: colors.heading }}>
                    {bankDetails.bank_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Account Number
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className="font-medium font-mono text-lg"
                      style={{ color: colors.heading }}
                    >
                      {bankDetails.account_number}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(bankDetails.account_number)
                      }
                      className="p-2 flex items-center gap-1 text-xs"
                      style={{ color: colors.accent }}
                    >
                      <Copy size={14} />
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Account Name
                  </p>
                  <p className="font-medium" style={{ color: colors.heading }}>
                    {bankDetails.account_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs" style={{ color: colors.body }}>
                    Amount
                  </p>
                  <div className="flex items-center justify-between">
                    <p
                      className="font-bold text-lg"
                      style={{ color: colors.accent }}
                    >
                      IDR {Number(total).toLocaleString()}
                    </p>
                    <button
                      onClick={() => copyToClipboard(total)}
                      className="p-2 flex items-center gap-1 text-xs"
                      style={{ color: colors.accent }}
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <ol className="space-y-3">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex gap-3 text-sm">
                <span
                  className="w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: colors.successBg,
                    color: colors.accent,
                  }}
                >
                  {index + 1}
                </span>
                <span style={{ color: colors.body }}>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={`/orders/${orderIds.split(",")[0]}`}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              backgroundColor: colors.accent,
              color: colors.white,
              borderRadius: "4px",
            }}
          >
            View Order Details
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/orders"
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium border"
            style={{
              backgroundColor: colors.white,
              color: colors.heading,
              borderColor: colors.border,
              borderRadius: "4px",
            }}
          >
            <Package size={16} />
            My Orders
          </Link>

          <Link
            href="/home"
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium"
            style={{
              color: colors.accent,
            }}
          >
            <Home size={16} />
            Back to Home
          </Link>
        </div>

        {/* Help Text */}
        <p className="text-xs text-center mt-6" style={{ color: colors.body }}>
          Having trouble? Contact our support at{" "}
          <a
            href="mailto:support@farmmarket.id"
            style={{ color: colors.accent }}
          >
            support@farmmarket.id
          </a>
        </p>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  );
}
