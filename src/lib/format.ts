import type { Transaction } from "@/types/transaction";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export const formatCurrency = (n: number) => currency.format(n);

/** Income counts up, expenses count down. */
export const signedAmount = (t: Transaction) => (t.type === "income" ? t.amount : -t.amount);

export function totals(transactions: Transaction[]) {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, net: income - expenses };
}

function parseISODate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const formatDate = (iso: string) =>
  parseISODate(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

/** "2025-01" -> "January 2025" */
export function formatMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** "2025-01" -> "Jan ’25" */
export function formatMonthShort(key: string) {
  const [y, m] = key.split("-").map(Number);
  return `${new Date(y, m - 1, 1).toLocaleDateString("en-US", { month: "short" })} ’${String(y).slice(2)}`;
}

/** "2025-01-14" -> "2025-01" */
export const monthKey = (iso: string) => iso.slice(0, 7);
