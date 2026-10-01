import type { Budgets, TransactionInput } from "@/types/transaction";
import { categoriesFor } from "./categories";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Checks a transaction coming from the client. Used by the API routes. */
export function validateTransaction(body: unknown): Result<TransactionInput> {
  if (!isRecord(body)) return { ok: false, error: "Expected a JSON object." };
  const { type, amount, category, description, date } = body;
  if (type !== "income" && type !== "expense") return { ok: false, error: "type must be 'income' or 'expense'." };
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, error: "amount must be a number greater than zero." };
  }
  if (typeof category !== "string" || !categoriesFor(type).includes(category)) {
    return { ok: false, error: `category must be one of: ${categoriesFor(type).join(", ")}.` };
  }
  if (typeof description !== "string" || !description.trim()) return { ok: false, error: "description is required." };
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { ok: false, error: "date must be in YYYY-MM-DD format." };
  }
  return {
    ok: true,
    value: { type, amount: Math.round(amount * 100) / 100, category, description: description.trim(), date },
  };
}

export function validateBudgets(body: unknown): Result<Budgets> {
  if (!isRecord(body)) return { ok: false, error: "Expected a JSON object of category: amount." };
  const budgets: Budgets = {};
  for (const [category, limit] of Object.entries(body)) {
    if (!categoriesFor("expense").includes(category)) return { ok: false, error: `Unknown category: ${category}.` };
    if (typeof limit !== "number" || !Number.isFinite(limit) || limit < 0) {
      return { ok: false, error: `Budget for ${category} must be zero or more.` };
    }
    if (limit > 0) budgets[category] = Math.round(limit * 100) / 100;
  }
  return { ok: true, value: budgets };
}
