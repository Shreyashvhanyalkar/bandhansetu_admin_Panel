// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { store } from "./app/store";
import App from "./App";
import "./index.css";

// Centralized Fetch Deduplicator to prevent duplicate concurrent GET requests (e.g. from StrictMode)
// without needing to abort them, keeping Chrome DevTools clean of red "(canceled)" requests.
const inflightRequests = new Map();
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const method = init?.method || "GET";
  if (method.toUpperCase() !== "GET") {
    return originalFetch.apply(this, arguments);
  }
  const url = typeof input === "string" ? input : input.url;
  const key = `${method}:${url}`;
  if (inflightRequests.has(key)) {
    return inflightRequests.get(key).then((res) => res.clone());
  }
  const promise = originalFetch.apply(this, arguments)
    .then((res) => {
      inflightRequests.delete(key);
      return res;
    })
    .catch((err) => {
      inflightRequests.delete(key);
      throw err;
    });
  inflightRequests.set(key, promise);
  return promise.then((res) => res.clone());
};

// Create a query client with configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Make queryClient available globally for logout
if (typeof window !== "undefined") {
  window.queryClient = queryClient;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* React Query DevTools - only shows in development */}
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);