"use client";

import { useMemo, useState } from "react";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { budgetLines } from "@/lib/budget";
import { api } from "@/lib/api";
import type { Transaction, TransactionType } from "@/types/transaction";
import { formatCurrency, formatDate, formatMonth, monthKey } from "@/lib/format";
import { TransactionTable } from "./TransactionTable";
import { TransactionForm } from "./TransactionForm";
import { SummaryTiles } from "./SummaryTiles";
import { CategoryChart } from "./CategoryChart";
import { MonthlyChart } from "./MonthlyChart";
import { BudgetList } from "./BudgetList";
import { BudgetDialog } from "./BudgetDialog";

type DialogState = { kind: "add" } | { kind: "edit"; transaction: Transaction } | { kind: "budgets" } | null;

export function ExpenseTracker() {
  const store = useTransactions();
  const budgetStore = useBudgets();
  const [dialog, setDialog] = useState<DialogState>(null);

  // null means "the most recent month that has transactions".
  const [monthChoice, setMonthChoice] = useState<string | null>(null);
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  const months = useMemo(
    () => [...new Set(store.transactions.map((t) => monthKey(t.date)))].sort().reverse(),
    [store.transactions],
  );
  const month = monthChoice ?? months[0] ?? "all";
  const categories = useMemo(
    () => [...new Set(store.transactions.map((t) => t.category))].sort(),
    [store.transactions],
  );

  // Category + search apply everywhere; month scopes the period; type narrows the list only.
  const matching = useMemo(() => {
    const q = query.trim().toLowerCase();
    return store.transactions.filter(
      (t) =>
        (category === "all" || t.category === category) &&
        (!q || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)),
    );
  }, [store.transactions, category, query]);

  const scoped = month === "all" ? matching : matching.filter((t) => monthKey(t.date) === month);
  const visible = type === "all" ? scoped : scoped.filter((t) => t.type === type);

  const prevMonth = month === "all" ? undefined : months[months.indexOf(month) + 1];
  const previous = prevMonth
    ? { month: prevMonth, transactions: matching.filter((t) => monthKey(t.date) === prevMonth) }
    : null;

  const isFiltered = monthChoice !== null || type !== "all" || category !== "all" || query !== "";

  function clearFilters() {
    setMonthChoice(null);
    setType("all");
    setCategory("all");
    setQuery("");
  }

  // Budgets are monthly; with "All months" selected, show the latest month.
  const budgetMonth = month === "all" ? months[0] : month;
  const lines = budgetMonth ? budgetLines(store.transactions, budgetStore.budgets, budgetMonth) : [];
  const overCount = lines.filter((l) => l.status === "over").length;
  const warnCount = lines.filter((l) => l.status === "warning").length;

  async function handleReset() {
    if (!confirm("Replace everything with the sample data? Your changes will be lost.")) return;
    try {
      const data = await api.reset();
      store.replaceAll(data.transactions);
      budgetStore.replaceAll(data.budgets);
      setMonthChoice(null);
    } catch (err) {
      console.error(err);
    }
  }

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
            {month === "all" ? "All time" : formatMonth(month)} · track income and expenses, and see where your money goes
          </p>
        </div>
        <div className="page__actions">
          <button type="button" className="btn btn--ghost" onClick={handleReset}>
            Reset sample data
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setDialog({ kind: "add" })}>
            + Add transaction
          </button>
        </div>
      </header>

      <div className="filters" role="search">
        <select value={month} onChange={(e) => setMonthChoice(e.target.value)} aria-label="Month">
          <option value="all">All months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {formatMonth(m)}
            </option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value as "all" | TransactionType)} aria-label="Type">
          <option value="all">Income & expenses</option>
          <option value="income">Income only</option>
          <option value="expense">Expenses only</option>
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search transactions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search transactions"
        />
        {isFiltered && (
          <button type="button" className="btn btn--ghost" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <SummaryTiles transactions={scoped} previous={previous} />

      <div className="grid grid--charts">
        <section className="card">
          <h2 className="card__title">Spending by category</h2>
          <p className="card__sub">{month === "all" ? "All time" : formatMonth(month)}</p>
          <CategoryChart transactions={scoped} />
        </section>
        <section className="card">
          <h2 className="card__title">Income vs expenses</h2>
          <p className="card__sub">By month</p>
          <MonthlyChart transactions={matching} selectedMonth={month} />
        </section>
      </div>

      <section className="card">
        <div className="card__head">
          <div>
            <h2 className="card__title">Budgets</h2>
            <p className="card__sub">{budgetMonth ? formatMonth(budgetMonth) : "No transactions yet"}</p>
          </div>
          <button type="button" className="btn btn--small" onClick={() => setDialog({ kind: "budgets" })}>
            Edit budgets
          </button>
        </div>
        {(overCount > 0 || warnCount > 0) && (
          <div className={`banner banner--${overCount > 0 ? "over" : "warning"}`} role="status">
            <span className="status__icon banner__icon" aria-hidden="true">
              {overCount > 0 ? "✕" : "!"}
            </span>
            <span>
              {overCount > 0 && `${overCount} ${overCount === 1 ? "category is" : "categories are"} over budget. `}
              {warnCount > 0 && `${warnCount} ${warnCount === 1 ? "is" : "are"} close to the limit.`}
            </span>
          </div>
        )}
        <BudgetList lines={lines} />
      </section>

      <section className="card">
        <h2 className="card__title">Transactions</h2>
        <p className="card__sub">
          {visible.length} of {store.transactions.length} transactions
        </p>
        <TransactionTable
          transactions={visible}
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
      {dialog?.kind === "budgets" && (
        <BudgetDialog
          budgets={budgetStore.budgets}
          onSave={budgetStore.saveBudgets}
          onReset={budgetStore.resetBudgets}
          onClose={() => setDialog(null)}
        />
      )}
    </main>
  );
}
