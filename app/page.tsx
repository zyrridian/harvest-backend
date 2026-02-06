"use client";

import {
  Leaf,
  Truck,
  Shield,
  Users,
  ArrowRight,
  Menu,
  X,
  Check,
  Mail,
} from "lucide-react";
import { useState } from "react";

// Design System Colors
const colors = {
  background: "#FAFAF9",
  white: "#FFFFFF",
  heading: "#18181b",
  body: "#475569",
  accent: "#166534", // Deep Forest Green
  accentHover: "#14532d",
  border: "#E4E4E7",
};

// Navbar Component
function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b"
      style={{ backgroundColor: colors.white, borderColor: colors.border }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a
            href="#"
            className="text-xl font-bold tracking-tight"
            style={{ color: colors.heading }}
          >
            Harvest
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: colors.body }}
            >
              Features
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: colors.body }}
            >
              Pricing
            </a>
            <a
              href="/docs"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: colors.body }}
            >
              API Docs
            </a>
            <a
              href="#"
              className="text-sm font-medium transition-colors hover:opacity-70"
              style={{ color: colors.body }}
            >
              About
            </a>
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="/login"
              className="inline-flex items-center px-4 py-2 text-sm font-medium border transition-colors"
              style={{
                color: colors.accent,
                borderColor: colors.accent,
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.accent;
                e.currentTarget.style.color = colors.white;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = colors.accent;
              }}
            >
              Get Started
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} style={{ color: colors.heading }} />
            ) : (
              <Menu size={24} style={{ color: colors.heading }} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div
            className="md:hidden border-t py-4"
            style={{ borderColor: colors.border }}
          >
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm font-medium"
                style={{ color: colors.body }}
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm font-medium"
                style={{ color: colors.body }}
              >
                Pricing
              </a>
              <a
                href="/docs"
                className="text-sm font-medium"
                style={{ color: colors.body }}
              >
                API Docs
              </a>
              <a
                href="#"
                className="text-sm font-medium"
                style={{ color: colors.body }}
              >
                About
              </a>
              <a
                href="/login"
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border"
                style={{
                  color: colors.accent,
                  borderColor: colors.accent,
                  borderRadius: "4px",
                }}
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function Hero() {
  return (
    <section
      className="pt-32 pb-16 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
              style={{ color: colors.heading }}
            >
              Farm Fresh,
              <br />
              Direct to You
            </h1>
            <p
              className="mt-6 text-lg leading-relaxed max-w-lg"
              style={{ color: colors.body }}
            >
              Connect directly with local farmers for fresh, sustainable
              produce. Skip the middleman and support your community while
              enjoying the highest quality food.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href="/login"
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium transition-colors"
                style={{
                  backgroundColor: colors.accent,
                  color: colors.white,
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accentHover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accent;
                }}
              >
                Start Shopping
                <ArrowRight size={18} className="ml-2" />
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center text-base font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: colors.heading }}
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Image Placeholder */}
          <div
            className="border aspect-[4/3] flex items-center justify-center"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.white,
              borderRadius: "4px",
            }}
          >
            <div className="text-center p-8">
              <Leaf
                size={64}
                strokeWidth={1}
                style={{ color: colors.accent }}
                className="mx-auto mb-4"
              />
              <p
                className="text-sm font-medium uppercase tracking-widest"
                style={{ color: colors.body }}
              >
                Fresh Produce Image
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Social Proof Strip
function SocialProof() {
  const companies = [
    "FARMCO",
    "GREENLEAF",
    "AGRITECH",
    "HARVEST+",
    "FIELDWORK",
  ];

  return (
    <section
      className="border-t border-b py-8 px-4 sm:px-6 lg:px-8"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.white,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <p
          className="text-center text-xs font-medium uppercase tracking-widest mb-6"
          style={{ color: colors.body }}
        >
          Trusted by leading agricultural partners
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12">
          {companies.map((company) => (
            <span
              key={company}
              className="text-lg sm:text-xl font-bold tracking-tight opacity-40"
              style={{ color: colors.heading }}
            >
              {company}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// Value Proposition Grid
function ValueGrid() {
  const values = [
    {
      icon: Leaf,
      title: "100% Organic",
      description:
        "All produce is certified organic, grown without harmful pesticides or synthetic fertilizers.",
    },
    {
      icon: Truck,
      title: "Same-Day Delivery",
      description:
        "Order by 10am and receive your fresh produce the same day. Farm to table in hours, not days.",
    },
    {
      icon: Shield,
      title: "Quality Guaranteed",
      description:
        "Not satisfied? We offer full refunds on any product that doesn't meet your expectations.",
    },
    {
      icon: Users,
      title: "Support Local",
      description:
        "Every purchase directly supports local farmers and sustainable farming practices.",
    },
    {
      icon: Leaf,
      title: "Seasonal Selection",
      description:
        "Curated seasonal produce that's at peak freshness and flavor throughout the year.",
    },
    {
      icon: Shield,
      title: "Transparent Sourcing",
      description:
        "Know exactly where your food comes from. Meet the farmers who grow your produce.",
    },
  ];

  return (
    <section
      id="features"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: colors.heading }}
          >
            Why Choose Harvest
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: colors.body }}
          >
            We're building the future of local food systems, connecting
            conscious consumers with sustainable farmers.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div
              key={index}
              className="border p-6"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.white,
                borderRadius: "4px",
              }}
            >
              <value.icon
                size={24}
                strokeWidth={1.5}
                style={{ color: colors.accent }}
                className="mb-4"
              />
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: colors.heading }}
              >
                {value.title}
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: colors.body }}
              >
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Feature Split Sections
function FeatureSplit() {
  return (
    <section
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.white }}
    >
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Feature 1 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-4"
              style={{ color: colors.accent }}
            >
              For Consumers
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
              style={{ color: colors.heading }}
            >
              Shop from Local Farmers
            </h2>
            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: colors.body }}
            >
              Browse products from farmers in your area. Filter by distance,
              product type, or farming practices. Build your cart and checkout
              with flexible delivery options.
            </p>
            <ul className="space-y-3">
              {[
                "Browse nearby farmers and their products",
                "Read reviews from other customers",
                "Flexible delivery and pickup options",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    size={18}
                    strokeWidth={2}
                    style={{ color: colors.accent }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm" style={{ color: colors.body }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <div
            className="border aspect-[4/3] flex items-center justify-center order-first lg:order-last"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              borderRadius: "4px",
            }}
          >
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color: colors.body }}
            >
              App Screenshot
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div
            className="border aspect-[4/3] flex items-center justify-center"
            style={{
              borderColor: colors.border,
              backgroundColor: colors.background,
              borderRadius: "4px",
            }}
          >
            <p
              className="text-sm font-medium uppercase tracking-widest"
              style={{ color: colors.body }}
            >
              Dashboard Preview
            </p>
          </div>
          <div>
            <p
              className="text-xs font-medium uppercase tracking-widest mb-4"
              style={{ color: colors.accent }}
            >
              For Farmers
            </p>
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight mb-6"
              style={{ color: colors.heading }}
            >
              Manage Your Farm Business
            </h2>
            <p
              className="text-lg leading-relaxed mb-6"
              style={{ color: colors.body }}
            >
              A complete dashboard to manage your products, orders, and customer
              relationships. Track inventory, fulfill orders, and grow your
              direct-to-consumer business.
            </p>
            <ul className="space-y-3">
              {[
                "Easy product and inventory management",
                "Order tracking and fulfillment tools",
                "Customer insights and analytics",
              ].map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check
                    size={18}
                    strokeWidth={2}
                    style={{ color: colors.accent }}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm" style={{ color: colors.body }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function Pricing() {
  const plans = [
    {
      name: "Consumer",
      price: "Free",
      period: "",
      description: "For individuals buying fresh produce",
      features: [
        "Browse all farmers and products",
        "Place unlimited orders",
        "Save favorite farmers",
        "Order history and tracking",
        "Customer support",
      ],
    },
    {
      name: "Farmer Basic",
      price: "$29",
      period: "/month",
      description: "For small farms getting started",
      features: [
        "List up to 50 products",
        "Basic analytics dashboard",
        "Order management tools",
        "Customer messaging",
        "Email support",
      ],
    },
    {
      name: "Farmer Pro",
      price: "$79",
      period: "/month",
      description: "For established farms scaling up",
      features: [
        "Unlimited products",
        "Advanced analytics",
        "Inventory management",
        "Priority placement",
        "Priority support",
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="py-20 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: colors.heading }}
          >
            Simple, Transparent Pricing
          </h2>
          <p
            className="mt-4 text-lg max-w-2xl mx-auto"
            style={{ color: colors.body }}
          >
            Choose the plan that fits your needs. No hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="border p-8"
              style={{
                borderColor: colors.border,
                backgroundColor: colors.white,
                borderRadius: "4px",
              }}
            >
              <h3
                className="text-lg font-bold mb-2"
                style={{ color: colors.heading }}
              >
                {plan.name}
              </h3>
              <p className="text-sm mb-4" style={{ color: colors.body }}>
                {plan.description}
              </p>
              <div className="mb-6">
                <span
                  className="text-4xl font-bold"
                  style={{ color: colors.heading }}
                >
                  {plan.price}
                </span>
                <span className="text-sm" style={{ color: colors.body }}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <Check
                      size={16}
                      strokeWidth={2}
                      style={{ color: colors.accent }}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-sm" style={{ color: colors.body }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <a
                href="/api/v1/auth/register"
                className="block w-full text-center px-4 py-3 text-sm font-medium border transition-colors"
                style={{
                  color: index === 0 ? colors.accent : colors.white,
                  backgroundColor: index === 0 ? "transparent" : colors.accent,
                  borderColor: colors.accent,
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => {
                  if (index === 0) {
                    e.currentTarget.style.backgroundColor = colors.accent;
                    e.currentTarget.style.color = colors.white;
                  } else {
                    e.currentTarget.style.backgroundColor = colors.accentHover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (index === 0) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = colors.accent;
                  } else {
                    e.currentTarget.style.backgroundColor = colors.accent;
                  }
                }}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  const [email, setEmail] = useState("");

  const footerLinks = {
    Product: ["Features", "Pricing", "API Docs", "Changelog"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Cookies"],
  };

  return (
    <footer
      className="border-t py-16 px-4 sm:px-6 lg:px-8"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.white,
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <a
              href="#"
              className="text-xl font-bold tracking-tight"
              style={{ color: colors.heading }}
            >
              Harvest
            </a>
            <p className="mt-4 text-sm max-w-xs" style={{ color: colors.body }}>
              Connecting local farmers with conscious consumers for a more
              sustainable food system.
            </p>
            <div className="mt-6">
              <p
                className="text-sm font-medium mb-3"
                style={{ color: colors.heading }}
              >
                Subscribe to our newsletter
              </p>
              <form
                className="flex"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(`Subscribed: ${email}`);
                  setEmail("");
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 text-sm border outline-none"
                  style={{
                    borderColor: colors.border,
                    backgroundColor: colors.white,
                    color: colors.heading,
                    borderRadius: "4px 0 0 4px",
                  }}
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 border border-l-0 transition-colors"
                  style={{
                    backgroundColor: colors.accent,
                    borderColor: colors.accent,
                    color: colors.white,
                    borderRadius: "0 4px 4px 0",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accentHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.accent;
                  }}
                >
                  <Mail size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4
                className="text-sm font-bold mb-4"
                style={{ color: colors.heading }}
              >
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-opacity hover:opacity-70"
                      style={{ color: colors.body }}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div
          className="mt-12 pt-8 border-t"
          style={{ borderColor: colors.border }}
        >
          <p className="text-sm" style={{ color: colors.body }}>
            &copy; 2026 Harvest. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Main Page Component
export default function Home() {
  return (
    <div style={{ backgroundColor: colors.background }}>
      <Navbar />
      <main>
        <Hero />
        <SocialProof />
        <ValueGrid />
        <FeatureSplit />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}
