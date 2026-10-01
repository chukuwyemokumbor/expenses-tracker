"use client";

import type { BudgetLine, BudgetStatus } from "@/lib/budget";
import { formatCurrency } from "@/lib/format";

const STATUS: Record<BudgetStatus, { icon: string; label: (l: BudgetLine) => string }> = {
  ok: { icon: "✓", label: (l) => `${formatCurrency(l.limit - l.spent)} left` },
  warning: { icon: "!", label: (l) => `${Math.round((l.spent / l.limit) * 100)}% used` },
  over: { icon: "✕", label: (l) => `Over by ${formatCurrency(l.spent - l.limit)}` },
};

export function BudgetList({ lines }: { lines: BudgetLine[] }) {
  if (lines.length === 0) return <div className="empty">No budgets set. Use “Edit budgets” to add some.</div>;

  return (
    <ul className="budgets">
      {lines.map((l) => (
        <li key={l.category} className="budget">
          <div className="budget__head">
            <span className="cell-name">{l.category}</span>
            {/* Status is always icon + words, never colour alone. */}
            <span className={`status status--${l.status}`}>
              <span className="status__icon" aria-hidden="true">
                {STATUS[l.status].icon}
              </span>
              {STATUS[l.status].label(l)}
            </span>
          </div>
          <div className={`meter meter--${l.status}`} aria-hidden="true">
            <div className="meter__fill" style={{ width: `${Math.min(100, (l.spent / l.limit) * 100)}%` }} />
          </div>
          <div className="budget__meta">
            {formatCurrency(l.spent)} of {formatCurrency(l.limit)}
          </div>
        </li>
      ))}
    </ul>
  );
}
