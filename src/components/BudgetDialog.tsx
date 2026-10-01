"use client";

import { useState, type FormEvent } from "react";
import type { Budgets } from "@/types/transaction";
import { EXPENSE_CATEGORIES } from "@/lib/categories";
import { Modal } from "./Modal";

interface Props {
  budgets: Budgets;
  onSave: (budgets: Budgets) => void;
  onReset: () => void;
  onClose: () => void;
}

/** Edit the monthly limit for each expense category. Leave a field empty for no budget. */
export function BudgetDialog({ budgets, onSave, onReset, onClose }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(EXPENSE_CATEGORIES.map((c) => [c, budgets[c] ? String(budgets[c]) : ""])),
  );
  const [error, setError] = useState<string | null>(null);

  function submit(e: FormEvent) {
    e.preventDefault();
    const next: Budgets = {};
    for (const [category, raw] of Object.entries(values)) {
      if (raw.trim() === "") continue;
      const n = Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        setError(`The budget for ${category} must be a positive number.`);
        return;
      }
      if (n > 0) next[category] = Math.round(n * 100) / 100;
    }
    onSave(next);
    onClose();
  }

  return (
    <Modal title="Monthly budgets" onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="form__grid">
          {EXPENSE_CATEGORIES.map((c) => (
            <label key={c} className="field">
              <span>{c} ($)</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="decimal"
                placeholder="No budget"
                value={values[c]}
                onChange={(e) => setValues((v) => ({ ...v, [c]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        {error && (
          <p className="form__error" role="alert">
            {error}
          </p>
        )}
        <div className="form__actions">
          <button
            type="button"
            className="btn btn--ghost form__actions-start"
            onClick={() => {
              onReset();
              onClose();
            }}
          >
            Restore defaults
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Save budgets
          </button>
        </div>
      </form>
    </Modal>
  );
}
