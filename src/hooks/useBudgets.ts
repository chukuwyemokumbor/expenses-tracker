"use client";

import { useEffect, useState } from "react";
import type { Budgets } from "@/types/transaction";
import { api } from "@/lib/api";

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

  useEffect(() => {
    api.getBudgets().then(setBudgets).catch(console.error);
  }, []);

  const saveBudgets = (next: Budgets) => api.saveBudgets(next).then(setBudgets).catch(console.error);

  return {
    budgets,
    replaceAll: setBudgets,
    saveBudgets,
    resetBudgets: () => saveBudgets(DEFAULT_BUDGETS),
  };
}
