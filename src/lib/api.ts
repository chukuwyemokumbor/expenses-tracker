import type { Budgets, Transaction, TransactionInput } from "@/types/transaction";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status} ${res.statusText}).`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const api = {
  listTransactions: () => request<Transaction[]>("/api/transactions"),
  createTransaction: (input: TransactionInput) =>
    request<Transaction>("/api/transactions", { method: "POST", body: JSON.stringify(input) }),
  updateTransaction: (id: string, input: TransactionInput) =>
    request<Transaction>(`/api/transactions/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteTransaction: (id: string) =>
    request<void>(`/api/transactions/${encodeURIComponent(id)}`, { method: "DELETE" }),

  getBudgets: () => request<Budgets>("/api/budgets"),
  saveBudgets: (budgets: Budgets) => request<Budgets>("/api/budgets", { method: "PUT", body: JSON.stringify(budgets) }),

  reset: () => request<{ transactions: Transaction[]; budgets: Budgets }>("/api/reset", { method: "POST" }),
};
