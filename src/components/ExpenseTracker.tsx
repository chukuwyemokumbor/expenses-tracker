"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { formatCurrency, totals } from "@/lib/format";
import { TransactionTable } from "./TransactionTable";
import { TransactionForm } from "./TransactionForm";

export function ExpenseTracker() {
  const store = useTransactions();
  const { income, expenses, net } = totals(store.transactions);
  const [adding, setAdding] = useState(false);

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
        <div className="page__actions">
          <button type="button" className="btn btn--ghost" onClick={store.resetData}>
            Reset sample data
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setAdding(true)}>
            + Add transaction
          </button>
        </div>
      </header>

      <section className="card">
        <h2 className="card__title">Transactions</h2>
        <TransactionTable transactions={store.transactions} />
      </section>

      {adding && <TransactionForm onSave={store.addTransaction} onClose={() => setAdding(false)} />}
    </main>
  );
}
