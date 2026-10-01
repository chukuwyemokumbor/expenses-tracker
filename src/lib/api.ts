import type { Budgets, Transaction, TransactionInput } from "@/types/transaction";

export type LoadState = { status: "loading" } | { status: "ready" } | { status: "error"; message: string };

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Something went wrong.";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    // fetch only rejects when the server can't be reached at all.
    throw new Error("Can't reach the server. Check your connection and that the app is running.");
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    if (body?.error) throw new Error(body.error);
    throw new Error(
      res.status >= 500
        ? `The server ran into a problem (${res.status}). Please try again in a moment.`
        : `Request failed (${res.status} ${res.statusText}).`,
    );
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
