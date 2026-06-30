"use client";

import React, { Suspense } from "react";
import { ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useAppSelector } from "@/lib/store/hooks";
import { selectCartCount } from "@/lib/store/features/cart/cartSlice";
import { useTenantId } from "@/lib/hooks/useTenantId";

function CartCounterInner() {
  const count = useAppSelector(selectCartCount);
  const tenantId = useTenantId();
  const cartHref = tenantId ? `/cart?tenantId=${tenantId}` : "/cart";

  return (
    <div className="relative">
      <Link href={cartHref}>
        <ShoppingBasket className="hover:text-primary" />
      </Link>
      {count > 0 && (
        <span className="absolute -top-3 -right-4 h-5 w-5 flex items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </div>
  );
}

// useTenantId uses useSearchParams which requires a Suspense boundary
const CartCounter = () => (
  <Suspense fallback={
    <div className="relative">
      <ShoppingBasket className="hover:text-primary" />
    </div>
  }>
    <CartCounterInner />
  </Suspense>
);

export default CartCounter;