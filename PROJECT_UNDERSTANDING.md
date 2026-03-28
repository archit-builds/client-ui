# MERN Pizza App — Project Understanding Document

> A detailed record of every feature built, every issue encountered, and every fix applied during this development session.

---

## Table of Contents

1. [Project Architecture Overview](#1-project-architecture-overview)
2. [Phase 1 — Header Component](#2-phase-1--header-component)
3. [Phase 2 — Hero Section & Layout](#3-phase-2--hero-section--layout)
4. [Phase 3 — Product Listing & Tabs](#4-phase-3--product-listing--tabs)
5. [Phase 4 — Product Card](#5-phase-4--product-card)
6. [Phase 5 — Product Modal](#6-phase-5--product-modal)
7. [Phase 6 — Backend Data Fetching](#7-phase-6--backend-data-fetching)
8. [Phase 7 — Auth Issues & Public Product API](#8-phase-7--auth-issues--public-product-api)
9. [Phase 8 — TypeScript Fixes](#9-phase-8--typescript-fixes)
10. [Phase 9 — Image Loading Errors](#10-phase-9--image-loading-errors)
11. [Shared Types — lib/types.tsx](#11-shared-types--libtypestsx)
12. [Pending / Future Work](#12-pending--future-work)
13. [Full File Inventory](#13-full-file-inventory)

---

## 1. Project Architecture Overview

This is a MERN-stack food-ordering platform divided into microservices:

| Service            | Tech                                                  | Responsibility                                                                |
| ------------------ | ----------------------------------------------------- | ----------------------------------------------------------------------------- |
| `auth-services`    | Node.js + Express + TypeORM + PostgreSQL              | Auth (login, refresh tokens), tenant (restaurant) management, user management |
| `catalog-services` | Node.js + Express + Mongoose + MongoDB                | Products, categories, toppings                                                |
| `client-ui`        | Next.js 15 (App Router) + Tailwind CSS v4 + shadcn/ui | Customer-facing storefront                                                    |
| `admin-dashboard`  | React + Vite + Tailwind                               | Admin panel for managing products/users/tenants                               |
| `gateway`          | Kong API Gateway                                      | Routes all client traffic to correct microservice                             |

### How services are accessed

All API calls from `client-ui` go through the Gateway at `http://localhost:8000`.

- `http://localhost:8000/api/auth/...` → auth-services
- `http://localhost:8000/api/catalog/...` → catalog-services

The environment variable `BACKEND_URL=http://localhost:8000` is set in `client-ui/.env.local`.

---

## 2. Phase 1 — Header Component

### What was built

Created `components/custom/Header.tsx` — a full navigation bar containing:

- **Logo** (custom SVG — the Pizza brand wordmark)
- **Restaurant Selector** — a `<Select>` dropdown populated with tenant data fetched from the auth-service
- **Nav links** — Menu, Orders
- **Cart icon** with item count badge
- **Phone number** display
- **Logout button**

Integrated it into `app/layout.tsx` so it renders on every page:

```tsx
// app/layout.tsx
import Header from "@/components/custom/header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body ...>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

---

### Issue 1 — Header UI too large / elements too spaced

**Problem:** After the initial implementation, the header had oversized padding, a too-large logo, too much spacing between nav items, a wide Select dropdown, and a large cart badge.

**Fix:** Refined Tailwind classes across each element:

- `container py-5` for the nav (was `py-8`)
- Logo SVG scaled down to `width="90" height="27"` (was `width="120" height="36"`)
- Select width reduced: `w-[180px]` (was `w-[220px]`)
- Nav links: `space-x-4` (was `space-x-6`)
- Cart badge: `h-6 w-6` (was `h-8 w-8`)
- Phone section: `ml-12` alignment
- Logout button: `size="sm"`

---

### Issue 2 — Header crashed the page (ECONNREFUSED 500)

**Problem:** When the auth-service was not running, the `fetch()` call inside the Header server component threw an unhandled `ECONNREFUSED` error, causing Next.js to render a 500 error page instead of gracefully degrading.

**Root Cause:** The `Header` component was an async server component. If the backend was offline, the un-caught `fetch` rejection propagated up and broke the entire render tree.

**Fix:** Wrapped the tenant fetch in a `try/catch` block. On any network error, `restaurants` defaults to `{ data: [] }` and the header renders with an empty restaurant dropdown — no crash, no 500.

```ts
// components/custom/Header.tsx
let restaurants: { data: Tenant[] } = { data: [] };

try {
  const tenantsResponse = await fetch(
    `${process.env.BACKEND_URL}/api/auth/tenants?perPage=100`,
    { next: { revalidate: 3600 } },
  );
  if (tenantsResponse.ok) {
    restaurants = await tenantsResponse.json();
  }
} catch {
  // Backend unavailable — render header with empty restaurant list
}
```

---

## 3. Phase 2 — Hero Section & Layout

### What was built

- **Hero section** in `app/(home)/page.tsx`:
  - Left side: Large headline, subtext, a CTA button
  - Right side: A pizza illustration image (`/public/pizza-main.png`)
- **Section layout** using flexbox with `container` centering

---

### Issue 3 — Text overlapping in the hero section

**Problem:** The hero headline `text-7xl font-black leading-2` was visually overlapping. The class `leading-2` in Tailwind v4 maps to `line-height: 0.5rem`, which is far too tight for a multi-line `text-7xl` heading — lines were stacked directly on top of each other.

**Fix:** Changed `leading-2` → `leading-tight` which maps to `line-height: 1.25` — correct proportional leading for large display text.

```tsx
// Before
<h1 className="text-7xl font-black font-sans leading-2">

// After
<h1 className="text-6xl font-black font-sans leading-tight">
```

Also adjusted the font size from `text-7xl` to `text-6xl` for better proportion and added `max-w-lg` to the paragraph for readable line length.

---

## 4. Phase 3 — Product Listing & Tabs

### What was built

The home page fetches categories from the catalog service and uses shadcn/ui `Tabs` to display one tab per category. Each tab contains the product grid for that category.

```tsx
// app/(home)/page.tsx — simplified
<Tabs defaultValue={categories[0]?._id ?? "all"}>
  <TabsList>
    {categories.map((cat) => (
      <TabsTrigger key={cat._id} value={cat._id}>
        {cat.name}
      </TabsTrigger>
    ))}
  </TabsList>
  {categories.map((cat) => (
    <TabsContent key={cat._id} value={cat._id}>
      <ProductList products={products} />
    </TabsContent>
  ))}
</Tabs>
```

A fallback tab labelled "All" is rendered when no categories are available (offline/empty state).

---

## 5. Phase 4 — Product Card

### What was built

`app/(home)/components/product-card.tsx` — a shadcn/ui `Card` component that displays:

- Product image (via `next/image`)
- Product name
- Description (clamped to 2 lines)
- Starting price (derived from `priceConfiguration`)
- "Choose" button (triggers the modal)

### `getBasePrice()` utility

The catalog service stores prices as a map of `priceConfiguration`, keyed by size/type (e.g., `"Size"`, `"Crust"`). Each entry has a `priceType` (`"base"` or `"aditional"`) and `availableOptions: { [optionName]: price }`.

The `getBasePrice()` function finds the entry with `priceType === "base"` and returns the minimum price value — this becomes the "from ₹X" displayed on the card.

```ts
function getBasePrice(config: Product["priceConfiguration"]): number {
  for (const c of Object.values(config)) {
    if (c.priceType === "base") {
      const prices = Object.values(c.availableOptions);
      if (prices.length > 0) return Math.min(...prices);
    }
  }
  return 0;
}
```

---

## 6. Phase 5 — Product Modal

### What was built

`app/(home)/components/product-modal.tsx` — a full product configuration modal using shadcn/ui `Dialog`:

- **Two-column layout**: 38% left (image on white bg) / 62% right (config + footer)
- **Size selection**: Small (₹299) / Medium (₹499) / Large (₹699) toggle buttons
- **Toppings selection**: Chicken / Jalapeño / Cheese — each ₹50, thumbnail image, toggle on/off
- **Dynamic total price**: Base size price + sum of selected topping prices, updates in real-time
- **Add to Cart button** with cart icon
- **Close button** (X icon, top-right corner)

### State management

The modal state lives in `product-list.tsx` (a `"use client"` component), which wraps the server-rendered data:

```tsx
// product-list.tsx
const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
// Passes selectedProduct to <ProductModal open={!!selectedProduct} ... />
// Each ProductCard gets onChoose={() => setSelectedProduct(product)}
```

This pattern keeps `page.tsx` as a pure server component (for data fetching with `revalidate`) while the interactive parts live in the client component boundary.

---

### Issue 4 — Modal layout misaligned (height/bg inconsistency)

**Problem:** The initial modal had mismatched backgrounds between left and right panels, and the image was not vertically centered.

**Fix:**

- Set `min-h-96` on the flex container
- Left panel gets explicit `bg-white p-6 border-r border-gray-100` for clean isolation
- Image uses `w-44 h-44` with `object-contain drop-shadow-lg`
- Right panel uses `flex flex-col` with `flex-1 overflow-y-auto` for the config scroll area

---

## 7. Phase 6 — Backend Data Fetching

### Categories fetch

```ts
// app/(home)/page.tsx
const categoryResponse = await fetch(
  `${process.env.BACKEND_URL}/api/catalog/categories`,
  { next: { revalidate: 3600 } },
);
if (categoryResponse.ok) {
  categories = await categoryResponse.json();
}
```

The `revalidate: 3600` cache directive means categories are re-fetched at most once per hour (ISR — Incremental Static Regeneration).

---

### Products fetch

```ts
const productsResponse = await fetch(
  `${process.env.BACKEND_URL}/api/catalog/products/public?limit=100`,
  { next: { revalidate: 3600 } },
);
if (productsResponse.ok) {
  const data = await productsResponse.json();
  products = data.data ?? data; // handles both paginated and flat responses
}
```

Note: `data.data ?? data` handles the catalog service's paginated response shape `{ data: [...], total, ... }` as well as a direct array fallback.

---

### Issue 5 — Wrong query param name (`perPage` vs `limit`)

**Problem:** The initial products fetch used `?perPage=100` (copied from the tenants query pattern). The catalog-service product endpoint uses `?limit=N` as the page-size parameter.

**Fix:** Changed query param to `?limit=100`.

---

## 8. Phase 7 — Auth Issues & Public Product API

### Issue 6 — Products endpoint returned 401 Unauthorized

**Problem:** Fetching `/api/catalog/products` from the server-side Next.js component returned HTTP 401. This is because the existing route was protected:

```ts
// Original product-router.ts
router.get(
  "/",
  authenticate, // ← requires JWT
  canAccess([Roles.ADMIN, Roles.MANAGER]), // ← requires admin role
  asyncWrapper(productController.getAll),
);
```

The client-side storefront should be able to list published products without authentication.

**Fix:** Added a dedicated `/public` route (no auth middleware) to the product router, which maps to a new `getPublic()` controller method.

---

### New public route in `product-router.ts`

```ts
// catalog-services/src/product/product-router.ts
// IMPORTANT: This route MUST appear AFTER `productController` is instantiated
const productController = new ProductController(productService, logger);

router.get("/public", asyncWrapper(productController.getPublic));
```

---

### New `getPublic()` method in `ProductController`

```ts
// catalog-services/src/product/product-controller.ts
async getPublic(req: Request, res: Response, next: NextFunction) {
  const { page = 1, limit = 12, tenantId, categoryId } = req.query;

  const filter: Record<string, unknown> = { isPublish: true };
  if (tenantId) filter.tenantId = tenantId;
  if (categoryId) filter.categoryId = new mongoose.Types.ObjectId(categoryId as string);

  const result = await this.productService.getAll(filter, {
    page: Number(page),
    limit: Number(limit),
  });
  res.json(result);
}
```

Key differences from the admin `getAll()`:

- **No `authenticate` or `canAccess` middleware**
- Always filters by `isPublish: true` — unpublished products are never exposed
- Accepts `tenantId` and `categoryId` as optional filters for future restaurant-specific queries

Also added `this.getPublic = this.getPublic.bind(this)` to the constructor so the method works correctly when passed as a callback reference.

---

### Issue 7 — TypeScript TS2448/TS2454: Controller used before declaration

**Problem:** After adding the `/public` route, TypeScript threw errors because the route was placed before `const productController = new ProductController(...)`. In TypeScript, `const` variables are in the Temporal Dead Zone until their declaration — using them before that point causes a compile error.

**Root Cause:** The new `/public` route was mistakenly inserted near the top of the router file, above the `productController` instantiation line.

**Fix:** Moved the public route to after the controller and service instantiations:

```ts
// CORRECT ORDER:
const productService = new ProductService();
const productController = new ProductController(productService, logger); // ← declare first

router.get("/public", asyncWrapper(productController.getPublic));        // ← then use
router.get("/", authenticate, canAccess([...]), asyncWrapper(productController.getAll));
```

---

## 9. Phase 8 — TypeScript Fixes

### Issue 8 — `PriceConfiguration.availableOptions` typed as `string[]`

**Problem:** The `PriceConfiguration` type in `lib/types.tsx` had `availableOptions: string[]`. However, the actual data returned from the catalog service is an object map of option-name → price: `{ "Small": 299, "Medium": 499, "Large": 699 }`.

This caused TypeScript errors when trying to call `Object.values(c.availableOptions)` to get numeric prices — TypeScript thought the values were strings.

**Fix:**

```ts
// lib/types.tsx — BEFORE
export interface PriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: string[]; // ← wrong
  };
}

// lib/types.tsx — AFTER
export interface PriceConfiguration {
  [key: string]: {
    priceType: "base" | "aditional";
    availableOptions: { [key: string]: number }; // ← correct: option name → price
  };
}
```

---

### Issue 9 — Local `Product` type defined per-file, drifted from actual data shape

**Problem:** Initially, `product-card.tsx` and `product-modal.tsx` each defined their own local `Product` type (or used a simplified version), causing type mismatches when the full backend shape was introduced.

**Fix:** Defined a canonical `Product` type in `lib/types.tsx` and imported it everywhere:

```ts
// lib/types.tsx
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
```

Used in: `product-card.tsx`, `product-list.tsx`, `product-modal.tsx`, `app/(home)/page.tsx`.

---

## 10. Phase 9 — Image Loading Errors

### Issue 10 — `hostname "res.cloudinary.com" is not configured`

**Problem:** Products uploaded via the admin dashboard save their images to Cloudinary. The `image` field in the MongoDB document stores the full Cloudinary URL (`https://res.cloudinary.com/...`). When `next/image` tried to display these images, Next.js threw:

```
Error: Invalid src prop (https://res.cloudinary.com/...) on `next/image`,
hostname "res.cloudinary.com" is not configured under images in your `next.config.js`
```

**Why this exists:** Next.js's Image Optimization API acts as a proxy — it intentionally blocks external hostnames not explicitly whitelisted, to prevent SSRF (Server-Side Request Forgery) attacks.

**Fix:** Added Cloudinary to the `remotePatterns` whitelist in `next.config.ts`:

```ts
// next.config.ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};
```

---

### Issue 11 — Bare filename `"margarita.png"` is not a valid `next/image` src

**Problem:** Some products in the database were seeded with just a bare filename as the image field (e.g. `"margarita.png"`) instead of a proper absolute URL or root-relative path. `next/image` requires the `src` to be either:

- An absolute URL (`https://...`)
- A root-relative path (`/margarita.png`)

Passing `"margarita.png"` (no leading slash, no protocol) caused a runtime error.

**Fix — `product-card.tsx`:** Created a `normalizeImage()` helper:

```ts
function normalizeImage(src: string): string {
  if (!src) return "/pizza-main.png";
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/")
  )
    return src;
  return `/${src}`; // prepend slash for bare filenames
}
```

Applied via: `src={normalizeImage(product.image)}`

**Fix — `product-modal.tsx`:** Inline normalization for the modal image:

```tsx
<Image
  src={
    product.image.startsWith("http") || product.image.startsWith("/")
      ? product.image
      : `/${product.image}`
  }
  alt={product.name}
  fill
  className="object-contain drop-shadow-lg"
/>
```

---

## 11. Shared Types — lib/types.tsx

Complete record of all types defined and used across the frontend:

```ts
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
```

---

## 12. Pending / Future Work

### 1. Remove debug `console.log` statements

`app/(home)/page.tsx` still has temporary debug logs added during the products fetch investigation:

```ts
console.log("[server] categories status:", categoryResponse.status);
console.log("[server] categories fetched:", categories.length);
console.log("[server] products status:", productsResponse.status);
console.log("[server] products fetched:", products.length);
```

These should be removed before production.

---

### 2. Dynamic `tenantId` for product filtering

Currently products are fetched without filtering by restaurant:

```ts
// todo: add dynamic tenantId
`${process.env.BACKEND_URL}/api/catalog/products/public?limit=100`;
```

The Header has a restaurant `<Select>` dropdown. When a user picks a restaurant, the product list should update to show only that tenant's products. This requires:

- Persisting the selected `tenantId` in URL search params or a global client state (e.g., Zustand or React Context)
- Passing that `tenantId` as a query param to the products fetch

---

### 3. Dynamic size/topping prices from `priceConfiguration`

The modal currently uses hardcoded sizes and toppings:

```ts
const SIZES = [
  { label: "Small", price: 299 },
  { label: "Medium", price: 499 },
  { label: "Large", price: 699 },
];

const TOPPINGS = [
  { id: "chicken", name: "Chicken", price: 50, ... },
  ...
];
```

The product's `priceConfiguration` from the database already contains the correct prices per size. The ideal fix is to derive sizes and their prices directly from `product.priceConfiguration` so the modal always reflects what was set in the admin dashboard.

---

### 4. Cart functionality

The cart icon in the Header shows a static badge of `3`. The "Add to Cart" button in the modal has no handler. This entire feature is not yet implemented.

---

### 5. Stale uppercase component files

`app/(home)/components/ProductCard.tsx` (uppercase) and `app/(home)/components/ProductModal.tsx` are older versions that may have been left over. The active, updated files are the lowercase-named equivalents (`product-card.tsx`, `product-modal.tsx`). The uppercase files could cause confusion or import conflicts on case-sensitive file systems (Linux/CI servers).

---

## 13. Full File Inventory

### Files created

| File                                                | Purpose                                                                    |
| --------------------------------------------------- | -------------------------------------------------------------------------- |
| `client-ui/components/custom/Header.tsx`            | Async server component — logo, restaurant select, nav, cart, phone, logout |
| `client-ui/app/(home)/components/product-card.tsx`  | Product listing card with base price and choose button                     |
| `client-ui/app/(home)/components/product-list.tsx`  | Client wrapper managing modal open/close state                             |
| `client-ui/app/(home)/components/product-modal.tsx` | Full product customization modal — size, toppings, dynamic price           |

### Files modified

| File                                                 | What changed                                                                                   |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `client-ui/app/layout.tsx`                           | Added `<Header />` and `<main>` wrapper                                                        |
| `client-ui/app/(home)/page.tsx`                      | Added categories + products server-side fetch; added Tabs layout; uses `ProductList`           |
| `client-ui/lib/types.tsx`                            | Fixed `PriceConfiguration.availableOptions` type; added `ProductAttribute` and `Product` types |
| `client-ui/next.config.ts`                           | Added `images.remotePatterns` for `res.cloudinary.com`                                         |
| `catalog-services/src/product/product-controller.ts` | Added `getPublic()` method + bound it in constructor                                           |
| `catalog-services/src/product/product-router.ts`     | Added `GET /public` route (no auth); moved after controller instantiation                      |

---

## Summary of All Issues and Fixes

| #   | Issue                                                              | Root Cause                                        | Fix                                                                         |
| --- | ------------------------------------------------------------------ | ------------------------------------------------- | --------------------------------------------------------------------------- |
| 1   | Header UI too large                                                | Default Tailwind sizing not resized               | Reduced padding, logo, spacing, select width                                |
| 2   | Header crashed with 500 (ECONNREFUSED)                             | Unhandled fetch rejection when backend offline    | Wrapped fetch in `try/catch`, defaults to empty                             |
| 3   | Hero text overlapping                                              | `leading-2` in Tailwind = 0.5rem line-height      | Changed to `leading-tight`                                                  |
| 4   | Modal layout misaligned                                            | Missing min-height and bg classes                 | Used `min-h-96`, `bg-white`, `border-r`, `flex-col`                         |
| 5   | Wrong API param `perPage` vs `limit`                               | Copy-paste from tenant fetch                      | Changed to `?limit=100`                                                     |
| 6   | Products endpoint returned 401                                     | Route required admin JWT                          | Added separate `/products/public` route with no auth                        |
| 7   | TS2448/TS2454 controller used before declaration                   | Public route added above controller instantiation | Moved route to after `const productController = new ProductController(...)` |
| 8   | `availableOptions` type mismatch (`string[]` vs `{[key]: number}`) | Incorrect initial type definition                 | Fixed to `{ [key: string]: number }`                                        |
| 9   | Local `Product` types drifted                                      | Per-file definitions                              | Moved canonical `Product` type to `lib/types.tsx`                           |
| 10  | `hostname "res.cloudinary.com" not configured`                     | Next.js image proxy blocks unknown external hosts | Added Cloudinary to `next.config.ts` remotePatterns                         |
| 11  | `"margarita.png"` is not a valid `next/image` src                  | Bare filenames (no leading `/`) not valid         | Added `normalizeImage()` helper + inline normalization                      |
