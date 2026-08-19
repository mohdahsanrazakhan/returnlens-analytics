"use client";

import * as React from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/** Generic fetch hook for our `{ success, data | error }` API envelope. Re-fetches when `key` changes. */
export function useApi<T>(path: string | null): ApiState<T> & { refetch: () => void } {
  const [state, setState] = React.useState<ApiState<T>>({ data: null, loading: true, error: null });
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (!path) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch(path, { credentials: "same-origin" })
      .then(async (res) => {
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok || !json.success) {
          setState({ data: null, loading: false, error: json.error ?? "Failed to load data" });
          return;
        }
        setState({ data: json.data, loading: false, error: null });
      })
      .catch(() => {
        if (!cancelled) setState({ data: null, loading: false, error: "Network error. Please try again." });
      });

    return () => {
      cancelled = true;
    };
  }, [path, tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
}

export function buildQuery(params: object): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params as Record<string, string | undefined>)) {
    if (v) sp.set(k, v);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}
