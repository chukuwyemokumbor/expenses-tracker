"use client";

import { useEffect, useState } from "react";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { api, errorMessage, type LoadState } from "@/lib/api";

/** Transactions from the API. Mutations reject on failure so the caller can show the error. */
export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [load, setLoad] = useState<LoadState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    api
      .listTransactions()
      .then((list) => {
        if (cancelled) return;
        setTransactions(list);
        setLoad({ status: "ready" });
      })
      .catch((err) => {
        if (!cancelled) setLoad({ status: "error", message: errorMessage(err) });
      });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  return {
    transactions,
    load,
    retry: () => {
      setLoad({ status: "loading" });
      setAttempt((n) => n + 1);
    },
    replaceAll: setTransactions,
    addTransaction: async (input: TransactionInput) => {
      const created = await api.createTransaction(input);
      setTransactions((prev) => [...prev, created]);
    },
    updateTransaction: async (id: string, input: TransactionInput) => {
      const saved = await api.updateTransaction(id, input);
      setTransactions((prev) => prev.map((t) => (t.id === id ? saved : t)));
    },
    deleteTransaction: async (id: string) => {
      await api.deleteTransaction(id);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    },
  };
}
