"use client";

import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, totals } from "@/lib/format";
import { TransactionTable } from "./TransactionTable";

export function ExpenseTracker() {
  const store = useTransactions();
  const { income, expenses, net } = totals(store.transactions);

  return (
    <main className="page">
      <header className="page__header">
        <div>
          <h1>Expenses</h1>
          <p className="page__sub">
            {store.transactions.length} transactions · {formatCurrency(income)} in · {formatCurrency(expenses)} out ·{" "}
            {formatCurrency(net)} net
          </p>
        </div>
        <button type="button" className="btn btn--ghost" onClick={store.resetData}>
          Reset sample data
        </button>
      </header>

      <section className="card">
        <h2 className="card__title">Transactions</h2>
        <TransactionTable transactions={store.transactions} />
      </section>
    </main>
  );
}
