"use client";

import { useState, type FormEvent } from "react";
import type { Transaction, TransactionInput, TransactionType } from "@/types/transaction";
import { categoriesFor } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import { Modal } from "./Modal";

interface Props {
  /** When set, the form edits this transaction instead of adding a new one. */
  transaction?: Transaction;
  onSave: (input: TransactionInput) => unknown;
  onClose: () => void;
}

export function TransactionForm({ transaction, onSave, onClose }: Props) {
  const [form, setForm] = useState<TransactionInput>(() =>
    transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: transaction.date,
        }
      : { type: "expense", amount: 0, category: categoriesFor("expense")[0], description: "", date: todayISO() },
  );
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof TransactionInput>(key: K, value: TransactionInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function setType(type: TransactionType) {
    // Keep the category valid for the new type.
    setForm((f) => ({
      ...f,
      type,
      category: categoriesFor(type).includes(f.category) ? f.category : categoriesFor(type)[0],
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!Number.isFinite(form.amount) || form.amount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (!form.description.trim()) {
      setError("Add a short description.");
      return;
    }
    if (!form.date) {
      setError("Pick a date.");
      return;
    }
    onSave({ ...form, amount: Math.round(form.amount * 100) / 100, description: form.description.trim() });
    onClose();
  }

  return (
    <Modal title={transaction ? "Edit transaction" : "Add transaction"} onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="segmented" role="radiogroup" aria-label="Transaction type">
          {(["expense", "income"] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={form.type === type}
              className={form.type === type ? "is-active" : ""}
              onClick={() => setType(type)}
            >
              {type === "expense" ? "Expense" : "Income"}
            </button>
          ))}
        </div>
        <div className="form__grid">
          <label className="field">
            <span>Amount ($)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={form.amount || ""}
              onChange={(e) => set("amount", e.target.valueAsNumber || 0)}
              autoFocus
            />
          </label>
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
          </label>
          <label className="field field--wide">
            <span>Description</span>
            <input
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="e.g. Groceries at Trader Joe's"
            />
          </label>
          <label className="field field--wide">
            <span>Category</span>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {categoriesFor(form.type).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        <div className="form__actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            {transaction ? "Save changes" : "Add transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
