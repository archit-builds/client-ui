"use client";

import React from "react";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/features/cart/cartSlice";

const CartCounter = () => {
  const count = useAppSelector(selectCartCount);

  return (
    <div className="relative">
      <Link href="/cart">
        <ShoppingBasket className="hover:text-primary" />
      </Link>
      {count > 0 && (
        <span className="absolute -top-3 -right-4 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
};

export default CartCounter;