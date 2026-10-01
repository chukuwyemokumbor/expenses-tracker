import type { TransactionType } from "@/types/transaction";

export const EXPENSE_CATEGORIES = [
  "Housing",
  "Groceries",
  "Transport",
  "Dining out",
  "Utilities",
  "Entertainment",
  "Health",
  "Shopping",
  "Other",
] as const;

export const INCOME_CATEGORIES = ["Salary", "Freelance", "Investments", "Gifts", "Other income"] as const;

export function categoriesFor(type: TransactionType): readonly string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
