"use client";

import React, { useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  // useRef ensures the same QueryClient instance is used across re-renders.
  // Creating it inside the component body (without ref/state) would reset
  // the entire cache on every render.
  const queryClientRef = useRef<QueryClient>(null);
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient();
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;