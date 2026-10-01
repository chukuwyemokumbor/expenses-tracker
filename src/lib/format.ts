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
