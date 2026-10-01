"use client";

import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatMonth, totals } from "@/lib/format";

interface Props {
  transactions: Transaction[];
  /** Same filters applied to the month before, for the comparison line. Null when there's nothing to compare. */
  previous: { month: string; transactions: Transaction[] } | null;
}

export function SummaryTiles({ transactions, previous }: Props) {
  const { income, expenses, net } = totals(transactions);
  const savingsRate = income > 0 ? Math.round((net / income) * 100) : null;
  const incomeCount = transactions.filter((t) => t.type === "income").length;
  const expenseCount = transactions.length - incomeCount;

  let comparison: string | null = null;
  if (previous) {
    const before = totals(previous.transactions).expenses;
    if (before > 0) {
      const change = Math.round(((expenses - before) / before) * 100);
      const prevName = formatMonth(previous.month).split(" ")[0];
      comparison =
        change === 0 ? `Same as ${prevName}` : `${change > 0 ? "↑" : "↓"} ${Math.abs(change)}% vs ${prevName}`;
    }
  }

  return (
    <section className="tiles" aria-label="Summary">
      <div className="tile tile--hero">
        <div className="tile__label">Net balance</div>
        <div className="tile__hero">
          {net < 0 ? "−" : ""}
          {formatCurrency(Math.abs(net))}
        </div>
        <div className="tile__sub">
          {savingsRate === null ? "No income in this period" : `${savingsRate}% of income saved`}
        </div>
      </div>
      <div className="tile">
        <div className="tile__label">Income</div>
        <div className="tile__value">{formatCurrency(income)}</div>
        <div className="tile__sub">
          {incomeCount} {incomeCount === 1 ? "payment" : "payments"}
        </div>
      </div>
      <div className="tile">
        <div className="tile__label">Expenses</div>
        <div className="tile__value">{formatCurrency(expenses)}</div>
        <div className="tile__sub">
          {expenseCount} {expenseCount === 1 ? "transaction" : "transactions"}
          {comparison && ` · ${comparison}`}
        </div>
      </div>
    </section>
  );
}
