"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBasket, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  selectCartItems,
  selectCartTotal,
  incrementQty,
  decrementQty,
  removeFromCart,
  clearCart,
} from "@/lib/store/features/cart/cartSlice";

export default function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const grandTotal = useAppSelector(selectCartTotal);

  // ── Empty state ────────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <ShoppingBasket size={64} className="text-gray-200" />
        <h2 className="text-2xl font-bold text-gray-700">Your cart is empty</h2>
        <p className="text-gray-400 max-w-xs">
          Looks like you haven&apos;t added anything yet. Browse the menu and
          pick your favourites!
        </p>
        <Link href="/">
          <Button className="mt-2 rounded-full px-6">Browse Menu</Button>
        </Link>
      </div>
    );
  }

  return (
    <section className="container py-10 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-500" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Your Cart&nbsp;
            <span className="text-base font-normal text-gray-400">
              ({items.reduce((n, i) => n + i.qty, 0)} items)
            </span>
          </h1>
        </div>
        <button
          onClick={() => dispatch(clearCart())}
          className="text-sm text-red-400 hover:text-red-600 font-medium transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ── Item list ─────────────────────────────────────────────────── */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4"
            >
              {/* Product image */}
              <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-50">
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

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Size: {item.size}
                    </p>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item.id))}
                    className="p-1.5 rounded-full hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Toppings */}
                {item.toppings.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {item.toppings.map((t) => (
                      <span
                        key={t._id}
                        className="text-xs bg-orange-50 text-primary rounded-full px-2 py-0.5 border border-orange-100"
                      >
                        + {t.name} (₹{t.price})
                      </span>
                    ))}
                  </div>
                )}

                {/* Price + qty controls */}
                <div className="flex items-center justify-between mt-3">
                  <p className="font-bold text-gray-900">
                    ₹{item.totalPrice * item.qty}
                    {item.qty > 1 && (
                      <span className="text-xs text-gray-400 font-normal ml-1">
                        (₹{item.totalPrice} × {item.qty})
                      </span>
                    )}
                  </p>

                  {/* Qty stepper */}
                  <div className="flex items-center gap-2 border border-gray-200 rounded-full px-2 py-1">
                    <button
                      onClick={() => dispatch(decrementQty(item.id))}
                      className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} className="text-gray-600" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-gray-800">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => dispatch(incrementQty(item.id))}
                      className="p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Order summary ─────────────────────────────────────────────── */}
        <div className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="truncate max-w-[160px]">
                    {item.name} × {item.qty}
                    <span className="text-gray-400"> ({item.size})</span>
                  </span>
                  <span className="font-medium shrink-0 ml-2">
                    ₹{item.totalPrice * item.qty}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Grand Total</span>
              <span className="text-primary text-lg">₹{grandTotal}</span>
            </div>

            <Button className="w-full mt-5 rounded-full py-5 font-semibold text-sm bg-primary hover:bg-primary/90">
              Proceed to Checkout
            </Button>

            <Link href="/">
              <button className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
                ← Continue shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
