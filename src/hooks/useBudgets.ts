"use client";

import { useEffect, useState } from "react";
import type { Budgets } from "@/types/transaction";

const STORAGE_KEY = "expense-tracker:budgets";

export const DEFAULT_BUDGETS: Budgets = {
  Groceries: 400,
  "Dining out": 150,
  Transport: 120,
  Utilities: 200,
  Entertainment: 100,
  Shopping: 150,
};

function load(): Budgets {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as Budgets;
    }
  } catch {
    // Storage unavailable or corrupt: use the defaults.
  }
  return DEFAULT_BUDGETS;
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<Budgets>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
    } catch {
      // Ignore quota / privacy-mode errors.
    }
  }, [budgets]);

  return { budgets, saveBudgets: setBudgets, resetBudgets: () => setBudgets(DEFAULT_BUDGETS) };
}
