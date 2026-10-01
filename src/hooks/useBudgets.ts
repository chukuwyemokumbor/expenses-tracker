"use client";

import { useEffect, useState } from "react";
import type { Budgets } from "@/types/transaction";
import { api, errorMessage, type LoadState } from "@/lib/api";

export const DEFAULT_BUDGETS: Budgets = {
  Groceries: 400,
  "Dining out": 150,
  Transport: 120,
  Utilities: 200,
  Entertainment: 100,
  Shopping: 150,
};

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budgets>({});
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .getBudgets()
      .then((b) => {
        if (cancelled) return;
        setBudgets(b);
        setLoad({ status: "ready" });
      })
      .catch((err) => {
        if (!cancelled) setLoad({ status: "error", message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const saveBudgets = async (next: Budgets) => setBudgets(await api.saveBudgets(next));

  return {
    budgets,
    load,
    retry: () => {
      setLoad({ status: "loading" });
      setAttempt((n) => n + 1);
    },
    replaceAll: setBudgets,
    saveBudgets,
    resetBudgets: () => saveBudgets(DEFAULT_BUDGETS),
  };
}
