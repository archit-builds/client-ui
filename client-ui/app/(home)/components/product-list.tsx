"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState } from "react";
import ProductCard from "./product-card";
import ProductModal from "./product-modal";
import { Category, Product, Topping } from "@/lib/types";

const ProductList = ({
  categories,
  products,
  toppings,
}: {
  categories: Category[];
  products: Product[];
  toppings: Topping[];
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string>(
    categories[0]?._id ?? "",
  );

  // Only show toppings that belong to the currently active category.
  // Falls back to showing all toppings if a topping has no categoryId set.
  const filteredToppings = toppings.filter(
    (t) => !t.categoryId || t.categoryId === activeCategoryId,
  );

  return (
    <section>
      <div className="container py-12">
        <Tabs
          defaultValue={categories[0]?._id}
          onValueChange={(val) => setActiveCategoryId(val)}
        >
          <TabsList>
            {categories.map((category) => {
              return (
                <TabsTrigger
                  key={category._id}
                  value={category._id}
                  className="text-md"
                >
                  {category.name}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {categories.map((category) => {
            return (
              <TabsContent key={category._id} value={category._id}>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                  {products
                    .filter((product) => product.category?._id === category._id)
                    .map((product) => (
                      <ProductCard
                        product={product}
                        key={product._id}
                        onChoose={() => setSelectedProduct(product)}
                      />
                    ))}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <ProductModal
        open={selectedProduct !== null}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct}
        toppings={filteredToppings}
      />
    </section>
  );
};

export default ProductList;
