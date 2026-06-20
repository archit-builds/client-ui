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

---

## Part 2 — Dynamic Session & Logout in the Header

### Overview

After login, the header needs to know whether a user is logged in to decide what to render:
- **No session** → show a **Login** button
- **Active session** → show the **user's name + Logout** button

Since `accessToken` is `httpOnly`, JavaScript in the browser can't read it. The session check must happen **on the server**.

### File Structure (additions)

```
client-ui/
├── app/
│   └── api/
│       └── auth/
│           └── self/
│               └── route.ts         ← Route Handler proxy for /self endpoint
├── components/
│   └── custom/
│       ├── header.tsx               ← Now async, fetches session server-side
│       └── logout-button.tsx        ← Now dynamic (accepts user prop)
└── lib/
    ├── actions/
    │   └── logout.ts                ← Server action to clear cookies + redirect
    └── types.ts                     ← Added User interface
```

---

### 1. `lib/types.ts` — User Interface

```ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
```

Added to represent the shape returned by the `/api/auth/auth/self` endpoint.

---

### 2. `lib/actions/logout.ts` — Logout Server Action

```ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logoutAction() {
  const cookieStore = await cookies();

  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  redirect("/login");
}
```

**Why this must be a server action and not a client-side click handler:**

`accessToken` is stored as an `httpOnly` cookie — JavaScript **cannot** access or delete it via `document.cookie`. The only way to delete it is from the server. Wrapping `logoutAction` in `"use server"` means it runs on the server where `next/headers` `cookies()` has full read/write access.

**Why `<form action={logoutAction}>` instead of `onClick`:**

```tsx
// ✅ Correct — triggers the server action
<form action={logoutAction}>
  <button type="submit">Logout</button>
</form>

// ❌ Wrong — this would run in the browser and can't touch httpOnly cookies
<button onClick={() => logoutAction()}>Logout</button>
```

Attaching a server action directly to `onClick` doesn't work for navigation (`redirect()`). The `<form>` approach is the idiomatic Next.js pattern.

---

### 3. `components/custom/header.tsx` — Server-Side Session Check

`Header` is already an `async` Server Component, so we can read cookies and call the backend directly:

```ts
import { cookies } from "next/headers";

const Header = async () => {
  let user: User | null = null;

  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
      const selfResponse = await fetch(
        `${process.env.BACKEND_URL}/api/auth/auth/self`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store", // always fresh — never cache session
        },
      );

      if (selfResponse.ok) {
        user = await selfResponse.json();
      }
    }
  } catch (error) {
    console.error("Failed to fetch session:", error);
  }

  return (
    // ...
    <LogoutButton user={user} />
  );
};
```

**Key points:**
- `cache: "no-store"` — session must never be cached. Without this, Next.js might serve a stale cached response and show the wrong user.
- If `accessToken` cookie doesn't exist, `user` stays `null` — no fetch is made at all.
- If the token is expired or invalid, the backend returns a non-`ok` response and `user` stays `null`.

---

### 4. `components/custom/logout-button.tsx` — Dynamic Rendering

```tsx
"use client";

interface LogoutButtonProps {
  user: User | null;
}

const LogoutButton = ({ user }: LogoutButtonProps) => {
  // Not logged in → show Login link
  if (!user) {
    return (
      <Link href="/login">
        <Button variant="outline">Login</Button>
      </Link>
    );
  }

  // Logged in → show name + Logout form
  return (
    <div className="flex items-center gap-x-3">
      <span>{user.firstName} {user.lastName}</span>
      <form action={logoutAction}>
        <Button type="submit" variant="outline">Logout</Button>
      </form>
    </div>
  );
};
```

The component itself is `"use client"` (it uses interactive elements), but it receives `user` as a **prop passed down from the server component** — this is the standard Next.js pattern for mixing server data with client interactivity.

---

### 5. `app/api/auth/self/route.ts` — Route Handler Proxy

```ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    return NextResponse.json(null, { status: 401 });
  }

  const response = await fetch(
    `${process.env.BACKEND_URL}/api/auth/auth/self`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(null, { status: response.status });
  }

  return NextResponse.json(await response.json());
}
```

This Route Handler at `/api/auth/self` acts as a **BFF (Backend For Frontend)** proxy. It's useful if a client component ever needs to re-check the session (e.g., after a token refresh) without exposing `BACKEND_URL` or the raw token to the browser.

---

### Session Flow Diagram

```
Page Request arrives
      │
      ▼
Header (async Server Component)
      │
      ├── cookies() → reads accessToken from request headers
      │
      ├── accessToken exists?
      │       │
      │       ├─ NO  → user = null
      │       │
      │       └─ YES → fetch BACKEND_URL/api/auth/auth/self
      │                    │
      │                    ├─ 200 OK  → user = { id, firstName, ... }
      │                    └─ 401/err → user = null
      │
      ▼
<LogoutButton user={user} />
      │
      ├─ user === null → render <Link href="/login"><Button>Login</Button></Link>
      │
      └─ user !== null → render username + <form action={logoutAction}><Button>Logout</Button></form>


Logout clicked
      │
      ▼
logoutAction() runs on SERVER
      │
      ├── cookieStore.delete("accessToken")
      ├── cookieStore.delete("refreshToken")
      └── redirect("/login")
```

---

### Updated Key Concepts

| Concept | What it does |
|---------|-------------|
| `async` Server Component | Can `await` data fetches and cookie reads before rendering |
| `cookies()` from `next/headers` | Server-only API to read/write/delete cookies — works in Server Components, Server Actions, and Route Handlers |
| `cache: "no-store"` | Prevents Next.js from caching the fetch — critical for session data |
| Route Handler (`route.ts`) | Next.js API endpoint inside the `app/` directory — acts as a BFF proxy |
| `"use server"` action in `<form>` | The correct way to trigger server-side logic (like cookie deletion) from a button click |
| `async` Server Component | Can `await` data fetches and cookie reads before rendering |
| `cookies()` from `next/headers` | Server-only API to read/write/delete cookies — works in Server Components, Server Actions, and Route Handlers |
| `cache: "no-store"` | Prevents Next.js from caching the fetch — critical for session data |
| Route Handler (`route.ts`) | Next.js API endpoint inside the `app/` directory — acts as a BFF proxy |
| `"use server"` action in `<form>` | The correct way to trigger server-side logic (like cookie deletion) from a button click |
| Props from Server → Client | Server components pass data down to `"use client"` components as props — the standard mixing pattern |

---

## Part 3 — Debugging & The Set-Cookie Forwarding Fix

### The Bug

After a successful login (`POST /login 200`), the header **still showed the Login button** instead of Logout. Navigating to home showed the same:

```
POST /login 200 in 232ms
[Header] accessToken found: false   ← cookie never set!
GET / 200 in 235ms
[Header] accessToken found: false   ← still missing
```

The login server action was returning `{ type: "success" }` so the UI showed the success message. But `accessToken found: false` proved the cookie was **never actually written** to the browser.

---

### Root Cause: Auth Service Returns Tokens as Set-Cookie Headers, Not JSON

Looking at the auth service `AuthController.login()`:

```ts
// Auth service sets tokens as HTTP cookies, NOT in the JSON body
res.cookie("accessToken", accessToken, {
  httpOnly: true,
  sameSite: "strict",
  maxAge: 1000 * 60 * 60, // 1 hour
});
res.cookie("refreshToken", refreshToken, {
  httpOnly: true,
  sameSite: "strict",
  maxAge: 365 * 24 * 60 * 60 * 1000,
});

// JSON body has NO tokens — only a message
res.json({ message: "User login successfully", userId: user.id });
```

Our original `loginAction` was assuming tokens would be in the JSON body:

```ts
// ❌ WRONG — accessToken and refreshToken are both undefined here
const { accessToken, refreshToken } = data;

cookieStore.set("accessToken", accessToken, { ... }); // sets nothing!
cookieStore.set("refreshToken", refreshToken, { ... }); // sets nothing!
```

The `cookieStore.set()` calls silently did nothing because the values were `undefined`. The browser never received any `Set-Cookie` headers from Next.js.

---

### How to Debug This

We added temporary `console.log` statements to the Header server component:

```ts
const cookieStore = await cookies();
const accessToken = cookieStore.get("accessToken")?.value;

console.log("[Header] accessToken found:", !!accessToken);  // ← was always false

if (accessToken) {
  const selfResponse = await fetch(`${BACKEND_URL}/api/auth/auth/self`, { ... });
  console.log("[Header] /self status:", selfResponse.status);

  if (!selfResponse.ok) {
    const text = await selfResponse.text();
    console.log("[Header] /self error body:", text);  // ← would tell us auth error
  }
}
```

The key insight from the logs: `accessToken found: false` **on the same request as `POST /login 200`** told us the problem was in the loginAction's cookie-writing step, not in the `/self` call.

---

### The Fix: Forward Set-Cookie Headers from the Upstream Response

When the Next.js server calls `fetch(BACKEND_URL + /login)`, the auth service responds with `Set-Cookie` headers. Those headers are **on the server-to-server fetch response** — they are NOT automatically forwarded to the browser.

We must manually read them and re-set them via `next/headers`:

```ts
// After a successful fetch to the auth backend:
const cookieStore = await cookies();

// getSetCookie() returns each Set-Cookie string as a separate array element
// e.g. ["accessToken=eyJ...; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600",
//        "refreshToken=eyJ...; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000"]
const setCookies: string[] = response.headers.getSetCookie?.() ?? [];

for (const cookieStr of setCookies) {
  // Parse: "accessToken=eyJ...; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600"
  const parts = cookieStr.split(";").map((p) => p.trim());
  const [nameValue, ...attrs] = parts;

  const eqIndex = nameValue.indexOf("=");
  const name = nameValue.substring(0, eqIndex);   // "accessToken"
  const value = nameValue.substring(eqIndex + 1); // "eyJ..."

  // Build the cookie options from the attributes
  const options: CookieOptions = { path: "/" };
  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === "httponly")          options.httpOnly = true;
    else if (lower === "secure")       options.secure = true;
    else if (lower.startsWith("samesite=")) options.sameSite = attr.split("=")[1].toLowerCase();
    else if (lower.startsWith("max-age=")) options.maxAge = parseInt(attr.split("=")[1]);
    else if (lower.startsWith("path="))   options.path = attr.split("=")[1];
  }

  cookieStore.set(name, value, options); // ✅ now browser gets the cookie
}
```

**Why `getSetCookie()` instead of `get("set-cookie")`?**

`headers.get("set-cookie")` joins multiple `Set-Cookie` headers with `, ` — but cookie values can contain commas, so splitting on `, ` will corrupt them. `headers.getSetCookie()` (Node.js 18+, which Next.js 14/15 requires) returns each cookie as a safe, separate string.

---

### Why `window.location.href` Instead of `router.push`

Even with the cookies now correctly set, we had to ensure the browser actually **sends** them on the next request. The redirect method matters:

| Method | Sends cookies? | Header re-renders? |
|--------|---------------|-------------------|
| `router.push("/")` | ❌ Client-side navigation — reuses cached React tree | ❌ No |
| `router.refresh()` + `router.push("/")` | Race condition | Sometimes |
| **`window.location.href = "/"`** | ✅ Full HTTP GET — browser attaches all cookies | ✅ Yes |

`window.location.href = "/"` forces a genuine browser request, which sends all cookies to the Next.js server. The server then runs `Header` fresh, reads `accessToken` from `cookies()`, calls `/self`, gets the user, and renders the **Logout** button.

---

### Final Data Flow (Complete Picture)

```
User submits login form
        │
        ▼
loginAction() — runs on SERVER
        │
        ├── fetch POST BACKEND_URL/api/auth/auth/login
        │         │
        │         └── Auth service responds:
        │               • JSON body: { message, userId }     ← no tokens here
        │               • Set-Cookie: accessToken=eyJ...     ← tokens are here
        │               • Set-Cookie: refreshToken=eyJ...
        │
        ├── response.headers.getSetCookie()
        │         → ["accessToken=eyJ...; HttpOnly; ...", "refreshToken=eyJ...; ..."]
        │
        ├── Parse each cookie string → name, value, options
        │
        ├── cookieStore.set("accessToken", value, options)   ✅ browser gets cookie
        ├── cookieStore.set("refreshToken", value, options)  ✅ browser gets cookie
        │
        ├── revalidatePath("/")   ← bust server-component cache
        │
        └── return { type: "success", message: "Login successful!" }
                    │
                    ▼
        useEffect detects success
                    │
                    ▼
        window.location.href = "/"   ← full browser navigation
                    │
                    ▼
        Browser sends GET / with cookies in request headers
                    │
                    ▼
        Header (async Server Component) runs fresh
                    │
                    ├── cookies().get("accessToken") → eyJ...  ✅ found!
                    │
                    ├── fetch BACKEND_URL/api/auth/auth/self
                    │     Authorization: Bearer eyJ...
                    │         │
                    │         └── 200 OK → { id, firstName, lastName, ... }
                    │
                    └── user = { firstName: "Archit", ... }
                                │
                                ▼
                    <LogoutButton user={user} />
                                │
                                └── renders: "Archit  [Logout]"  ✅
```

---

### Key Lesson

> **When a Next.js server action calls an upstream API that sets cookies via `Set-Cookie` response headers, those cookies are NOT automatically forwarded to the browser.** You must manually read them with `response.headers.getSetCookie()` and re-set them via `next/headers` `cookies()`.

This is different from a traditional browser→server setup where `Set-Cookie` headers go directly to the browser. In a server action, the fetch happens **server-to-server**, so Next.js is the one receiving those headers — and it must explicitly pass them along.
