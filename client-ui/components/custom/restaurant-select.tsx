"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Tenant } from "@/lib/types";

const RestaurantSelect = ({ restaurants }: { restaurants: Tenant[] }) => {
  return (
    <Select>
      <SelectTrigger className="w-[180px] focus:ring-0">
        <SelectValue placeholder="Select Restaurant" />
      </SelectTrigger>
      <SelectContent position="popper">
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <SelectItem key={restaurant.id} value={restaurant.id}>
              {restaurant.name}
            </SelectItem>
          ))
        ) : (
          <p className="px-2 py-1.5 text-sm text-muted-foreground">
            No restaurants available
          </p>
        )}
      </SelectContent>
    </Select>
  );
};

export default RestaurantSelect;
