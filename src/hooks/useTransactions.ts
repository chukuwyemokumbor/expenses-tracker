"use client";

import { useEffect, useState } from "react";
import type { Transaction, TransactionInput } from "@/types/transaction";
import { api } from "@/lib/api";

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    api.listTransactions().then(setTransactions).catch(console.error);
  }, []);

  return {
    transactions,
    replaceAll: setTransactions,
    addTransaction: (input: TransactionInput) =>
      api
        .createTransaction(input)
        .then((created) => setTransactions((prev) => [...prev, created]))
        .catch(console.error),
    updateTransaction: (id: string, input: TransactionInput) =>
      api
        .updateTransaction(id, input)
        .then((saved) => setTransactions((prev) => prev.map((t) => (t.id === id ? saved : t))))
        .catch(console.error),
    deleteTransaction: (id: string) =>
      api
        .deleteTransaction(id)
        .then(() => setTransactions((prev) => prev.filter((t) => t.id !== id)))
        .catch(console.error),
  };
}
