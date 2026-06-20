"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/login";
import { initialState } from "@/lib/actions/login-types";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  const router = useRouter();

  useEffect(() => {
    if (state.type === "success") {
      setTimeout(() => router.push("/"), 1000);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[oklch(94.409%_0.00973_16.723)]">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, oklch(0.637 0.207 29.234), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, oklch(0.646 0.222 41.116), transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: "oklch(1 0 0 / 88%)",
            backdropFilter: "blur(20px)",
            border: "1px solid oklch(0.922 0 0 / 60%)",
          }}
        >
          {/* Header strip */}
          <div
            className="h-1.5 w-full"
            style={{
              background:
                "linear-gradient(90deg, oklch(0.637 0.207 29.234), oklch(0.646 0.222 41.116))",
            }}
          />

          <div className="px-8 py-10">
            {/* Logo / Brand */}
            <div className="flex flex-col items-center mb-8">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.637 0.207 29.234), oklch(0.646 0.222 41.116))",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[oklch(0.145_0_0)]">
                Welcome back
              </h1>
              <p className="mt-1 text-sm text-[oklch(0.556_0_0)]">
                Sign in to your account to continue
              </p>
            </div>

            {/* Status message */}
            {state.message && (
              <div
                role="alert"
                className={`mb-6 flex items-start gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 ${
                  state.type === "error"
                    ? "bg-[oklch(0.577_0.245_27.325_/_12%)] text-[oklch(0.577_0.245_27.325)] border border-[oklch(0.577_0.245_27.325_/_25%)]"
                    : "bg-[oklch(0.6_0.118_184.704_/_12%)] text-[oklch(0.4_0.1_184.704)] border border-[oklch(0.6_0.118_184.704_/_25%)]"
                }`}
              >
                {state.type === "error" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-5 h-5 shrink-0 mt-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <span>{state.message}</span>
              </div>
            )}

            {/* Form */}
            <form action={formAction} noValidate className="space-y-5">
              {/* Email field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-[oklch(0.205_0_0)]"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[oklch(0.556_0_0)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.161V6a2 2 0 0 0-2-2H3Z" />
                      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white pl-10 pr-4 py-2.5 text-sm text-[oklch(0.145_0_0)] placeholder:text-[oklch(0.708_0_0)] outline-none transition-all duration-200 focus:border-[oklch(0.637_0.207_29.234)] focus:ring-2 focus:ring-[oklch(0.637_0.207_29.234_/_20%)]"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-[oklch(0.205_0_0)]"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-[oklch(0.637_0.207_29.234)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[oklch(0.556_0_0)]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[oklch(0.922_0_0)] bg-white pl-10 pr-4 py-2.5 text-sm text-[oklch(0.145_0_0)] placeholder:text-[oklch(0.708_0_0)] outline-none transition-all duration-200 focus:border-[oklch(0.637_0.207_29.234)] focus:ring-2 focus:ring-[oklch(0.637_0.207_29.234_/_20%)]"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                id="login-submit-btn"
                type="submit"
                disabled={isPending}
                className="mt-2 w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:opacity-90 hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.637 0.207 29.234), oklch(0.646 0.222 41.116))",
                }}
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-[oklch(0.922_0_0)]" />
              <span className="text-xs text-[oklch(0.556_0_0)] font-medium">
                OR
              </span>
              <div className="flex-1 h-px bg-[oklch(0.922_0_0)]" />
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-[oklch(0.556_0_0)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-semibold text-[oklch(0.637_0.207_29.234)] hover:underline"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-[oklch(0.556_0_0)]">
          By signing in, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-[oklch(0.637_0.207_29.234)]">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-[oklch(0.637_0.207_29.234)]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
