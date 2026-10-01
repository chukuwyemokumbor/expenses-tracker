"use client";

import { useEffect, useState } from "react";
import type { Transaction } from "@/types/transaction";
import { createSampleTransactions } from "@/data/sample";

const STORAGE_KEY = "expense-tracker:transactions";

function load(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as Transaction[];
    }
  } catch {
    // Storage unavailable or corrupt: fall back to the sample data.
  }
  return createSampleTransactions();
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Ignore quota / privacy-mode errors; the app still works in memory.
    }
  }, [transactions]);

  return {
    transactions,
    resetData: () => setTransactions(createSampleTransactions()),
  };
}
