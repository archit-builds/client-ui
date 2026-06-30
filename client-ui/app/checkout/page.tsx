"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  Banknote,
  ShoppingBag,
  User,
  Mail,
  MapPin,
  MessageSquare,
  CheckCircle2,
  ChevronRight,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/lib/store/hooks";
import {
  selectCartItems,
  selectCartTotal,
} from "@/lib/store/features/cart/cartSlice";
import { useTenantId } from "@/lib/hooks/useTenantId";

type PaymentMode = "card" | "cash";

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  paymentMode: PaymentMode;
  comment: string;
}

const INITIAL_FORM: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  paymentMode: "card",
  comment: "",
};



/* ─── tiny helper ─────────────────────────────────────────────────────────── */
function InputField({
  id,
  label,
  icon: Icon,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-gray-700"
      >
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400
            bg-white transition-all duration-200 outline-none
            focus:ring-2 focus:ring-primary/25 focus:border-primary
            ${error ? "border-red-400 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"}`}
        />
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */
function CheckoutPageInner() {
  const router = useRouter();

  /* ── auth guard ───────────────────────────────────────────────── */
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/self", { cache: "no-store" });
        if (!res.ok) {
          router.replace("/login");
        } else {
          setAuthChecked(true);
        }
      } catch {
        router.replace("/login");
      }
    }
    checkAuth();
  }, [router]);

  const items = useAppSelector(selectCartItems);
  const grandTotal = useAppSelector(selectCartTotal);
  const tenantId = useTenantId();

  // Build tenantId-aware hrefs so the restaurant context is retained
  const homeHref = tenantId ? `/?tenantId=${tenantId}` : "/";
  const cartHref = tenantId ? `/cart?tenantId=${tenantId}` : "/cart";

  const [form, setForm] = useState<CheckoutForm>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({});
  const [submitted, setSubmitted] = useState(false);

  const set = (field: keyof CheckoutForm) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  /* ── validation ───────────────────────────────────────────────── */
  function validate(): boolean {
    const newErrors: Partial<CheckoutForm> = {};
    if (!form.firstName.trim()) newErrors.firstName = "First name is required";
    if (!form.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }
    if (!form.address.trim()) newErrors.address = "Delivery address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) {
      // TODO: wire to backend
      setSubmitted(true);
    }
  }

  /* ── auth loading state ──────────────────────────────────────── */
  if (!authChecked) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-gray-400 font-medium">Verifying your session…</p>
      </div>
    );
  }

  /* ── empty cart guard ─────────────────────────────────────────── */
  if (items.length === 0 && !submitted) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="text-2xl font-bold text-gray-700">
          Nothing to checkout
        </h2>
        <p className="text-gray-400 max-w-xs">
          Your cart is empty. Add some items first!
        </p>
        <Link href={homeHref}>
          <Button className="mt-2 rounded-full px-6">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  /* ── success state ────────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center gap-5 text-center px-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center animate-[ping_1s_ease-out_1]" />
          <CheckCircle2
            size={80}
            className="absolute inset-0 m-auto text-green-500"
          />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">
          Order Placed! 🎉
        </h2>
        <p className="text-gray-500 max-w-sm">
          Thanks,{" "}
          <span className="font-semibold text-gray-700">
            {form.firstName}
          </span>
          ! Your order is confirmed and will be on its way soon.
        </p>
        <Link href={homeHref}>
          <Button className="mt-3 rounded-full px-8 py-5 text-sm font-semibold">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const deliveryFee = grandTotal > 0 ? 49 : 0;
  const taxes = Math.round(grandTotal * 0.05);
  const orderTotal = grandTotal + deliveryFee + taxes;

  /* ── main render ──────────────────────────────────────────────── */
  return (
    <section className="container py-10 max-w-6xl">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={cartHref}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Complete your order details below
          </p>
        </div>
      </div>

      {/* ── Stepper hint ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-xs text-gray-400 mb-8 select-none">
        <span className="flex items-center gap-1.5 text-primary font-semibold">
          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
            1
          </span>
          Cart
        </span>
        <ChevronRight size={14} />
        <span className="flex items-center gap-1.5 font-semibold text-gray-700">
          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center font-bold text-[10px]">
            2
          </span>
          Details
        </span>
        <ChevronRight size={14} />
        <span className="flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-bold text-[10px]">
            3
          </span>
          Confirmation
        </span>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── LEFT: Form ─────────────────────────────────────────────────── */}
          <div className="flex-1 space-y-6">
            {/* Personal Info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={14} className="text-primary" />
                </span>
                Personal Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  id="firstName"
                  label="First Name"
                  icon={User}
                  placeholder="John"
                  value={form.firstName}
                  onChange={set("firstName")}
                  required
                  error={errors.firstName}
                />
                <InputField
                  id="lastName"
                  label="Last Name"
                  icon={User}
                  placeholder="Doe"
                  value={form.lastName}
                  onChange={set("lastName")}
                  required
                  error={errors.lastName}
                />
              </div>

              <div className="mt-4">
                <InputField
                  id="email"
                  label="Email Address"
                  icon={Mail}
                  type="email"
                  placeholder="john@example.com"
                  value={form.email}
                  onChange={set("email")}
                  required
                  error={errors.email}
                />
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin size={14} className="text-primary" />
                </span>
                Delivery Address
              </h2>

              <div className="space-y-1.5">
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Full Address <span className="text-primary">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    size={16}
                    className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
                  />
                  <textarea
                    id="address"
                    rows={3}
                    placeholder="House / flat no., street, area, city, pincode…"
                    value={form.address}
                    onChange={(e) => set("address")(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-gray-800 placeholder:text-gray-400
                      bg-white transition-all duration-200 outline-none resize-none
                      focus:ring-2 focus:ring-primary/25 focus:border-primary
                      ${errors.address ? "border-red-400 ring-2 ring-red-100" : "border-gray-200 hover:border-gray-300"}`}
                  />
                </div>
                {errors.address && (
                  <p className="text-xs text-red-500 mt-1">{errors.address}</p>
                )}
              </div>
            </div>

            {/* Payment Mode */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard size={14} className="text-primary" />
                </span>
                Payment Mode
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Card option */}
                <label
                  htmlFor="payment-card"
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${form.paymentMode === "card"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <input
                    id="payment-card"
                    type="radio"
                    name="paymentMode"
                    value="card"
                    checked={form.paymentMode === "card"}
                    onChange={() => set("paymentMode")("card")}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${form.paymentMode === "card" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      Credit / Debit Card
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Visa, Mastercard, UPI
                    </p>
                  </div>
                  {form.paymentMode === "card" && (
                    <CheckCircle2
                      size={18}
                      className="absolute top-3 right-3 text-primary"
                    />
                  )}
                </label>

                {/* Cash option */}
                <label
                  htmlFor="payment-cash"
                  className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                    ${form.paymentMode === "cash"
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  <input
                    id="payment-cash"
                    type="radio"
                    name="paymentMode"
                    value="cash"
                    checked={form.paymentMode === "cash"}
                    onChange={() => set("paymentMode")("cash")}
                    className="sr-only"
                  />
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors
                    ${form.paymentMode === "cash" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}
                  >
                    <Banknote size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-800">
                      Cash on Delivery
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pay when you receive
                    </p>
                  </div>
                  {form.paymentMode === "cash" && (
                    <CheckCircle2
                      size={18}
                      className="absolute top-3 right-3 text-primary"
                    />
                  )}
                </label>
              </div>
            </div>

            {/* Order Comment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare size={14} className="text-primary" />
                </span>
                Order Comment
                <span className="ml-1 text-xs font-normal text-gray-400">
                  (optional)
                </span>
              </h2>

              <div className="relative">
                <MessageSquare
                  size={16}
                  className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none"
                />
                <textarea
                  id="comment"
                  rows={3}
                  placeholder="Any special instructions? E.g. extra spicy, no onions, ring the doorbell…"
                  value={form.comment}
                  onChange={(e) => set("comment")(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800
                    placeholder:text-gray-400 bg-white transition-all duration-200 outline-none resize-none
                    hover:border-gray-300 focus:ring-2 focus:ring-primary/25 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Order Summary ────────────────────────────────────────── */}
          <div className="lg:w-[340px] shrink-0 w-full">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" />
                Order Summary
              </h2>

              {/* Items list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                      <Image
                        src={
                          item.image.startsWith("http") ||
                            item.image.startsWith("/")
                            ? item.image
                            : `/${item.image}`
                        }
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.size} · qty {item.qty}
                      </p>
                      {item.toppings.length > 0 && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          +{" "}
                          {item.toppings.map((t) => t.name).join(", ")}
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-bold text-gray-900 shrink-0">
                      ₹{item.totalPrice * item.qty}
                    </p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200 my-4" />

              {/* Price breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">₹{grandTotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span className="font-medium">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes (5%)</span>
                  <span className="font-medium">₹{taxes}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-primary text-lg">₹{orderTotal}</span>
              </div>

              {/* CTA */}
              <Button
                type="submit"
                className="w-full mt-5 rounded-full py-5 font-semibold text-sm bg-primary hover:bg-primary/90 transition-all duration-200 shadow-md shadow-primary/20"
              >
                <Lock size={14} className="mr-2" />
                Place Order · ₹{orderTotal}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
                <Lock size={10} /> Secure & encrypted checkout
              </p>

              <Link href={cartHref}>
                <button
                  type="button"
                  className="w-full mt-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Edit cart
                </button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}

// useTenantId uses useSearchParams which requires a Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutPageInner />
    </Suspense>
  );
}
