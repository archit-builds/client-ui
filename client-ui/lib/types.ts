export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Tenant {
  id: string;
  name: string;
  address: string;
}

export interface PriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: { [key: string]: number };
  };
}

export interface Attribute {
  name: string;
  widgetType: "switch" | "radio";
  defaultValue: string;
  availableOptions: string[];
}

export interface Category {
  _id: string;
  name: string;
  priceConfiguration: PriceConfiguration;
  attributes: Attribute[];
}
export type ProductAttribute = {
  name: string;
  value: string | boolean;
};

export type Product = {
  _id: string;
  name: string;
  image: string;
  description: string;
  category: Category;
  priceConfiguration: PriceConfiguration;
  attributes: ProductAttribute[];
  isPublish: boolean;
  createdAt: string;
};

export type Topping = {
  _id: string;
  name: string;
  image: string;
  price: number;
  categoryId?: string;
  isPublish: boolean;
};
