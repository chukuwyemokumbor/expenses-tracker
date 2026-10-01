import type { Budgets, Transaction } from "@/types/transaction";
import { monthKey } from "./format";

export type BudgetStatus = "ok" | "warning" | "over";

export interface BudgetLine {
  category: string;
  limit: number;
  spent: number;
  status: BudgetStatus;
}

/** Warn once spending reaches this share of the limit. */
export const WARNING_RATIO = 0.8;

export function budgetLines(transactions: Transaction[], budgets: Budgets, month: string): BudgetLine[] {
  const spent = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "expense" && monthKey(t.date) === month) {
      spent.set(t.category, (spent.get(t.category) ?? 0) + t.amount);
    }
  }
  return Object.entries(budgets)
    .filter(([, limit]) => limit > 0)
    .map(([category, limit]) => {
      const s = spent.get(category) ?? 0;
      const status: BudgetStatus = s > limit ? "over" : s >= limit * WARNING_RATIO ? "warning" : "ok";
      return { category, limit, spent: s, status };
    })
    .sort((a, b) => b.spent / b.limit - a.spent / a.limit);
}
