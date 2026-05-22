"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShoppingCart, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

const SIZES = [
  { label: "Small", price: 299 },
  { label: "Medium", price: 499 },
  { label: "Large", price: 699 },
] as const;

type SizeLabel = (typeof SIZES)[number]["label"];

const TOPPINGS = [
  {
    id: "chicken",
    name: "Chicken",
    price: 50,
    image: "https://placehold.co/80x80/fef3c7/d97706?text=🍗",
  },
  {
    id: "jalapeno",
    name: "Jalapeño",
    price: 50,
    image: "https://placehold.co/80x80/dcfce7/16a34a?text=🌶",
  },
  {
    id: "cheese",
    name: "Cheese",
    price: 50,
    image: "https://placehold.co/80x80/fef9c3/ca8a04?text=🧀",
  },
];

type Props = {
  open: boolean;
  onClose: () => void;
  product: Product | null;
};

const ProductModal = ({ open, onClose, product }: Props) => {
  const [selectedSize, setSelectedSize] = useState<SizeLabel>("Medium");
  const [selectedToppings, setSelectedToppings] = useState<Set<string>>(
    new Set(),
  );

  if (!product) return null;

  const sizePrice = SIZES.find((s) => s.label === selectedSize)?.price ?? 499;
  const toppingsPrice = [...selectedToppings].reduce((sum, id) => {
    const topping = TOPPINGS.find((t) => t.id === id);
    return sum + (topping?.price ?? 0);
  }, 0);
  const totalPrice = sizePrice + toppingsPrice;

  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0 overflow-hidden rounded-2xl gap-0 bg-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={16} className="text-gray-400" />
        </button>

        {/* Two-column body */}
        <div className="flex flex-col sm:flex-row min-h-96">
          {/* LEFT ~38% — image only, white bg */}
          <div className="w-full sm:w-[38%] shrink-0 flex items-center justify-center bg-white p-6 sm:border-r border-b sm:border-b-0 border-gray-100">
            <div className="relative w-44 h-44">
              <Image
                src={
                  product.image.startsWith("http") ||
                  product.image.startsWith("/")
                    ? product.image
                    : `/${product.image}`
                }
                alt={product.name}
                fill
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* RIGHT ~62% — name, config, footer */}
          <div className="w-full sm:w-[62%] flex flex-col">
            {/* Name + description */}
            <div className="px-6 pt-5 pb-4">
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {product.name}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {product.description}
              </p>
            </div>

            {/* Scrollable config */}
            <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">
              {/* Size selection */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">
                  Choose the size
                </p>
                <div className="flex gap-2">
                  {SIZES.map((size) => {
                    const isSelected = selectedSize === size.label;
                    return (
                      <button
                        key={size.label}
                        onClick={() => setSelectedSize(size.label)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all duration-150 ${
                          isSelected
                            ? "border-primary text-primary bg-white"
                            : "border-gray-200 text-gray-600 bg-white hover:border-gray-300"
                        }`}
                      >
                        {size.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Extra toppings */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2.5">
                  Extra toppings
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {TOPPINGS.map((topping) => {
                    const isSelected = selectedToppings.has(topping.id);
                    return (
                      <button
                        key={topping.id}
                        onClick={() => toggleTopping(topping.id)}
                        className={`relative flex flex-col items-center gap-1.5 pt-4 pb-3 px-2 rounded-xl border transition-all duration-150 ${
                          isSelected
                            ? "border-primary bg-white shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <span className="absolute top-2 right-2 h-4 w-4 flex items-center justify-center rounded-full bg-primary">
                            <svg viewBox="0 0 12 12" className="h-2.5 w-2.5">
                              <path
                                d="M2 6l3 3 5-5"
                                stroke="white"
                                strokeWidth="1.5"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={topping.image}
                          alt={topping.name}
                          className="w-14 h-14 rounded-lg object-cover"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          {topping.name}
                        </span>
                        <span className="text-sm font-semibold text-gray-800">
                          ₹{topping.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 mt-auto">
              <p className="text-2xl font-bold text-gray-900">₹{totalPrice}</p>
              <Button
                onClick={onClose}
                className="flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold bg-primary hover:bg-primary/90 transition-all duration-150"
              >
                <ShoppingCart size={15} />
                Add to cart
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
