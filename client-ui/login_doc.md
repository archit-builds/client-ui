# Login Implementation Walkthrough

## Overview

We implemented login using three Next.js concepts working together:

1. **Server Actions** — server-side functions that handle form submissions securely
2. **`useActionState`** — a React 19 hook that manages server action state in a client component
3. **`next/headers` cookies** — Next.js's built-in way to set `httpOnly` cookies from the server

---

## File Structure

```
client-ui/
├── app/
│   └── login/
│       └── page.tsx              ← Client component (UI + form)
└── lib/
    └── actions/
        ├── login-types.ts        ← Shared types & initial state (no directive)
        └── login.ts              ← Server action ("use server")
```

---

## Why Three Files?

> [!IMPORTANT]
> A `"use server"` file can **only export `async` functions**. If you export a plain object (like `initialState`) from that file, Next.js will throw:
> ```
> Error: A "use server" file can only export async functions, found object.
> ```

This is why we split things up:

| File | Exports | Directive |
|------|---------|-----------|
| `login-types.ts` | `LoginState` type, `initialState` object | none |
| `login.ts` | `loginAction` async function only | `"use server"` |
| `page.tsx` | `LoginPage` default component | `"use client"` |

---

## 1. `login-types.ts` — Shared Types

```ts
export type LoginState = {
  type: "" | "success" | "error";
  message: string;
};

export const initialState: LoginState = {
  type: "",
  message: "",
};
```

**Why this file exists:**
- `LoginState` is the shape of data passed between the server action and the client component.
- `initialState` is the starting value before the form is submitted — `type: ""` and `message: ""` means "nothing has happened yet, show nothing".
- Both need to be imported by the `"use client"` page, so they can't live in the `"use server"` file.

---

## 2. `login.ts` — The Server Action

```ts
"use server";

import { cookies } from "next/headers";
import type { LoginState } from "./login-types";

export async function loginAction(
  _prevState: LoginState,  // ← required by useActionState, ignored here
  formData: FormData       // ← automatically populated from the <form>
): Promise<LoginState> {
```

### How `formData` works

When a `<form action={serverAction}>` is submitted, Next.js automatically collects all named inputs and passes them as a `FormData` object to the action. No `event.preventDefault()` needed — the browser's native form submission is used.

```ts
const email = formData.get("email") as string;     // from <input name="email">
const password = formData.get("password") as string; // from <input name="password">
```

### Validation

```ts
if (!email || !password) {
  return { type: "error", message: "Email and password are required." };
}
```

If validation fails, we return an error state immediately. The returned object becomes the new `state` in the client component.

### Calling the Auth Backend

```ts
const response = await fetch(
  `${process.env.BACKEND_URL}/api/auth/auth/login`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }
);
```

> [!NOTE]
> `BACKEND_URL` (without `NEXT_PUBLIC_`) is a **server-only** env variable. It is never exposed to the browser. This is safe because this fetch runs entirely on the server.

### Setting Cookies

```ts
const { accessToken, refreshToken } = data;
const cookieStore = await cookies();

cookieStore.set("accessToken", accessToken, {
  httpOnly: true,        // ← JS in the browser cannot read this
  secure: process.env.NODE_ENV === "production", // ← HTTPS only in prod
  sameSite: "strict",   // ← only sent on same-origin requests
  maxAge: 60 * 60,      // ← expires in 1 hour
  path: "/",
});

cookieStore.set("refreshToken", refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 60 * 60 * 24 * 7, // ← expires in 7 days
  path: "/",
});
```

**Why `httpOnly` cookies?**
- `httpOnly: true` means the cookie is **invisible to JavaScript** (`document.cookie` can't read it).
- This is the most secure way to store auth tokens — it completely prevents XSS attacks from stealing your tokens.
- The cookies travel automatically with every subsequent request to the server.

**Why `next/headers` and not the `cookies` npm package?**
- The `cookies` npm package works with Node.js `req`/`res` objects (Express style).
- In Next.js server actions, there is no `req`/`res` — the framework manages the response. `next/headers` is the correct API for this context.

---

## 3. `page.tsx` — The Client Component

```tsx
"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/login";
import { initialState } from "@/lib/actions/login-types";
```

### `useActionState` Hook

```tsx
const [state, formAction, isPending] = useActionState(
  loginAction,   // ← the server action to call
  initialState   // ← the starting state { type: "", message: "" }
);
```

This hook gives us three things:

| Variable | Type | Description |
|----------|------|-------------|
| `state` | `LoginState` | The latest return value from `loginAction` |
| `formAction` | `function` | Pass this to `<form action={...}>` |
| `isPending` | `boolean` | `true` while the server action is running |

> [!NOTE]
> `useActionState` is the **React 19** version of the older `useFormState` from `react-dom`. Since the project uses React 19, we import from `react` directly (not `react-dom`).

### Wiring the Form

```tsx
<form action={formAction} noValidate>
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button type="submit" disabled={isPending}>
    {isPending ? "Signing in…" : "Sign in"}
  </button>
</form>
```

- `action={formAction}` replaces the traditional `onSubmit` handler.
- `isPending` disables the button and shows a spinner while the server action is running — preventing double submissions.
- `noValidate` disables browser-native validation so we can control error messages ourselves.

### Displaying Feedback

```tsx
{state.message && (
  <div role="alert" className={state.type === "error" ? "...red styles" : "...green styles"}>
    {state.message}
  </div>
)}
```

`state` updates automatically every time the server action returns. No `useState` needed.

### Redirect on Success

```tsx
useEffect(() => {
  if (state.type === "success") {
    setTimeout(() => router.push("/"), 1000);
  }
}, [state, router]);
```

After a successful login (tokens set as cookies), we wait 1 second for the user to see the success message, then redirect to `/`.

---

## Data Flow Diagram

```
User submits form
      │
      ▼
<form action={formAction}>   ← browser collects FormData from inputs
      │
      ▼
loginAction(_prevState, formData)   ← runs on the SERVER
      │
      ├─ validation failed? → return { type: "error", message: "..." }
      │                              │
      │                              ▼
      │                        state updates in UI → red error banner shown
      │
      ├─ fetch POST /api/auth/auth/login
      │         │
      │         ├─ response not ok? → return { type: "error", message: data.message }
      │         │
      │         └─ response ok?
      │               │
      │               ▼
      │         set "accessToken" cookie (httpOnly, 1 hour)
      │         set "refreshToken" cookie (httpOnly, 7 days)
      │               │
      │               ▼
      │         return { type: "success", message: "Login successful!" }
      │                        │
      ▼                        ▼
state updates in UI    green success banner shown
                              │
                              ▼ (after 1 second)
                       router.push("/")  ← redirect to home
```

---

## Key Concepts Summary

| Concept | What it does |
|---------|-------------|
| `"use server"` | Marks a file/function to run exclusively on the server |
| `"use client"` | Marks a component to run in the browser (enables hooks) |
| `useActionState` | React 19 hook that connects a server action to component state |
| `formData` | Native browser API — collects `name`d inputs from a `<form>` |
| `httpOnly` cookie | Cookie invisible to JavaScript — safest way to store auth tokens |
| `BACKEND_URL` (no `NEXT_PUBLIC_`) | Server-only env var — never exposed to the client bundle |
