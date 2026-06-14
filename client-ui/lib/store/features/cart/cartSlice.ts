import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store";
import { Topping } from "@/lib/types";

// ── Cart item shape ──────────────────────────────────────────────────────────
export interface CartItem {
    /** Unique key per item: productId + size (so same product in diff sizes = diff rows) */
    id: string;
    productId: string;
    name: string;
    image: string;
    size: string;
    /** Base price for the chosen size */
    basePrice: number;
    /** Toppings attached to this item */
    toppings: Topping[];
    /** Computed: basePrice + sum of topping prices */
    totalPrice: number;
    qty: number;
}

// ── State ────────────────────────────────────────────────────────────────────
interface CartState {
    items: CartItem[];
}

const initialState: CartState = {
    items: [],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const computeTotal = (basePrice: number, toppings: Topping[]): number =>
    basePrice + toppings.reduce((sum, t) => sum + t.price, 0);

const makeId = (productId: string, size: string): string =>
    `${productId}::${size}`;

// ── Slice ────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        /**
         * Add a configured product to the cart.
         * If the same product + size already exists, increment qty (toppings are kept from first add).
         */
        addToCart(
            state,
            action: PayloadAction<{
                productId: string;
                name: string;
                image: string;
                size: string;
                basePrice: number;
                toppings: Topping[];
            }>,
        ) {
            const { productId, name, image, size, basePrice, toppings } =
                action.payload;
            const id = makeId(productId, size);
            const existing = state.items.find((i) => i.id === id);

            if (existing) {
                existing.qty += 1;
            } else {
                state.items.push({
                    id,
                    productId,
                    name,
                    image,
                    size,
                    basePrice,
                    toppings,
                    totalPrice: computeTotal(basePrice, toppings),
                    qty: 1,
                });
            }
        },

        /** Increase qty of a specific cart item */
        incrementQty(state, action: PayloadAction<string>) {
            const item = state.items.find((i) => i.id === action.payload);
            if (item) item.qty += 1;
        },

        /** Decrease qty; removes item when qty hits 0 */
        decrementQty(state, action: PayloadAction<string>) {
            const idx = state.items.findIndex((i) => i.id === action.payload);
            if (idx === -1) return;
            if (state.items[idx].qty <= 1) {
                state.items.splice(idx, 1);
            } else {
                state.items[idx].qty -= 1;
            }
        },

        /** Remove an item entirely */
        removeFromCart(state, action: PayloadAction<string>) {
            state.items = state.items.filter((i) => i.id !== action.payload);
        },

        /** Wipe the cart */
        clearCart(state) {
            state.items = [];
        },
    },
});

export const {
    addToCart,
    incrementQty,
    decrementQty,
    removeFromCart,
    clearCart,
} = cartSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
/** All cart items */
export const selectCartItems = (state: RootState) => state.cart.items;

/** Total number of items (summing qty) */
export const selectCartCount = (state: RootState) =>
    state.cart.items.reduce((n, i) => n + i.qty, 0);

/** Grand total price across all items × qty */
export const selectCartTotal = (state: RootState) =>
    state.cart.items.reduce((sum, i) => sum + i.totalPrice * i.qty, 0);

export default cartSlice.reducer;
