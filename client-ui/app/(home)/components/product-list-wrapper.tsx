import React from "react";
import { Category, Product, Topping } from "@/lib/types";
import ProductList from "./product-list";

interface ProductListWrapperProps {
  tenantId?: string;
}

const ProductListWrapper = async ({ tenantId }: ProductListWrapperProps) => {
  const categoryResponse = await fetch(
    `${process.env.BACKEND_URL}/api/catalog/categories`,
    {
      next: {
        revalidate: 0, // Disabled cache for development
      },
    },
  );

  if (!categoryResponse.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories: Category[] = await categoryResponse.json();

  // Build tenant query param — if none selected, omit it (fetches all)
  const tenantQuery = tenantId ? `&tenantId=${tenantId}` : "";

  const productsResponse = await fetch(
    `${process.env.BACKEND_URL}/api/catalog/products/public?perPage=100${tenantQuery}`,
    {
      next: {
        revalidate: 0, // Disabled cache for development
      },
    },
  );

  if (!productsResponse.ok) {
    throw new Error("Failed to fetch products");
  }

  const productsData: { data: Product[] } = await productsResponse.json();

  const toppingsResponse = await fetch(
    `${process.env.BACKEND_URL}/api/catalog/toppings/public?perPage=100${tenantQuery}`,
    {
      next: {
        revalidate: 0, // Disabled cache for development
      },
    },
  );

  if (!toppingsResponse.ok) {
    throw new Error("Failed to fetch toppings");
  }

  const toppingsData: { data: Topping[] } = await toppingsResponse.json();

  return (
    <ProductList
      categories={categories}
      products={productsData.data}
      toppings={toppingsData.data}
    />
  );
};

export default ProductListWrapper;
