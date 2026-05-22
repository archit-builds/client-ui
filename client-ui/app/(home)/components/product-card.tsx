"use client";

import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import React from "react";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

function getBasePrice(config: Product["priceConfiguration"]): number {
  for (const c of Object.values(config)) {
    if (c.priceType === "base") {
      const prices = Object.values(c.availableOptions);
      if (prices.length > 0) return Math.min(...prices);
    }
  }
  return 0;
}

function normalizeImage(src: string): string {
  if (!src) return "/pizza-main.png";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  )
    return src;
  return `/${src}`;
}

type PropTypes = { product: Product; onChoose?: () => void };

const ProductCard = ({ product, onChoose }: PropTypes) => {
  const basePrice = getBasePrice(product.priceConfiguration);
  return (
    <Card className="border-none rounded-xl">
      <CardHeader className="flex items-center justify-center">
        <Image
          alt={product.name}
          width={150}
          height={150}
          src={normalizeImage(product.image)}
        />
      </CardHeader>
      <CardContent>
        <h2 className="text-xl font-bold">{product.name}</h2>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between mt-4">
        <p>
          <span className="text-sm text-gray-500">From </span>
          <span className="font-bold">₹{basePrice}</span>
        </p>
        <Button
          variant="outline"
          onClick={onChoose}
          className="text-primary border-primary hover:bg-primary hover:text-primary-foreground px-6 py-2 rounded-full shadow hover:shadow-lg transition-all duration-150"
        >
          Choose
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
export type { Product };
