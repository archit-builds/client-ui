import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React from "react";
import ProductCard from "./product-card";
import { Category, Product } from "@/lib/types";

const ProductList = ({
  categories,
  products,
}: {
  categories: Category[];
  products: Product[];
}) => {
  return (
    <section>
      <div className="container py-12">
        <Tabs defaultValue={categories[0]._id}>
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
            {/* <TabsTrigger value="beverages" className="text-md">
                    Beverages
                </TabsTrigger> */}
          </TabsList>
          {categories.map((category) => {
            return (
              <TabsContent key={category._id} value={category._id}>
                <div className="grid grid-cols-4 gap-6 mt-6">
                  {products
                    .filter((product) => product.category?._id === category._id)
                    .map((product) => (
                      <ProductCard product={product} key={product._id} />
                    ))}
                </div>
              </TabsContent>
            );
          })}

          {/* <TabsContent value="beverages">
                <div className="grid grid-cols-4 gap-6 mt-6">
                    {products.map((product) => (
                        <ProductCard product={product} key={product.id} />
                    ))}
                </div>
            </TabsContent> */}
        </Tabs>
      </div>
    </section>
  );
};

export default ProductList;
