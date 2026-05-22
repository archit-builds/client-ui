import React from "react";
import { Category, Product } from "@/lib/types";
import ProductList from "./product-list";

const ProductListWrapper = async () => {
  const categoryResponse = await fetch(
    `${process.env.BACKEND_URL}/api/catalog/categories`,
    {
      next: {
        revalidate: 0, // Disabled cache for development
      },
    }
  );

  if (!categoryResponse.ok) {
    throw new Error("Failed to fetch categories");
  }

  const categories: Category[] = await categoryResponse.json();

  const productsResponse = await fetch(
    `${process.env.BACKEND_URL}/api/catalog/products/public?perPage=100&tenantId=10`,
    {
      next: {
        revalidate: 0, // Disabled cache for development
      },
    }
  );

  if (!productsResponse.ok) {
    throw new Error("Failed to fetch products");
  }

  const productsData: { data: Product[] } = await productsResponse.json();

  return <ProductList categories={categories} products={productsData.data} />;
};

export default ProductListWrapper;
