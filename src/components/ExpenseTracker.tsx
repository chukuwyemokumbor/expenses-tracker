"use client";

import { useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate, totals } from "@/lib/format";
import { TransactionTable } from "./TransactionTable";
import { TransactionForm } from "./TransactionForm";

type DialogState = { kind: "add" } | { kind: "edit"; transaction: Transaction } | null;

export function ExpenseTracker() {
  const store = useTransactions();
  const { income, expenses, net } = totals(store.transactions);
  const [dialog, setDialog] = useState<DialogState>(null);

  function handleDelete(t: Transaction) {
    const label = `${t.description} (${formatCurrency(t.amount)} on ${formatDate(t.date)})`;
    if (confirm(`Delete ${label}? This can't be undone.`)) store.deleteTransaction(t.id);
  }

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
          <button type="button" className="btn btn--primary" onClick={() => setDialog({ kind: "add" })}>
            + Add transaction
          </button>
        </div>
      </header>

      <section className="card">
        <h2 className="card__title">Transactions</h2>
        <TransactionTable
          transactions={store.transactions}
          onEdit={(transaction) => setDialog({ kind: "edit", transaction })}
          onDelete={handleDelete}
        />
      </section>

      {dialog?.kind === "add" && <TransactionForm onSave={store.addTransaction} onClose={() => setDialog(null)} />}
      {dialog?.kind === "edit" && (
        <TransactionForm
          transaction={dialog.transaction}
          onSave={(input) => store.updateTransaction(dialog.transaction.id, input)}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
