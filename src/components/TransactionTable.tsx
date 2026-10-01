"use client";

import { useState } from "react";
import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate } from "@/lib/format";

type SortKey = "date" | "description" | "category" | "amount";

const COLUMNS: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "date", label: "Date" },
  { key: "description", label: "Description" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount", numeric: true },
];

interface Props {
  transactions: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}

export function TransactionTable({ transactions, onEdit, onDelete }: Props) {
  // Newest first by default.
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });

  const sorted = [...transactions].sort((a, b) => {
    const va = sort.key === "amount" ? (a.type === "income" ? a.amount : -a.amount) : a[sort.key];
    const vb = sort.key === "amount" ? (b.type === "income" ? b.amount : -b.amount) : b[sort.key];
    const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
    return cmp * sort.dir || b.date.localeCompare(a.date);
  });

  const toggle = (key: SortKey) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "date" ? -1 : 1 }));

  if (transactions.length === 0) return <div className="empty">No transactions match these filters.</div>;

  return (
    <div className="table-wrap">
      {/* Column headers are hidden on phones, so sorting gets its own control there. */}
      <div className="mobile-sort">
        <label>
          Sort by{" "}
          <select value={sort.key} onChange={(e) => setSort((s) => ({ ...s, key: e.target.value as SortKey }))}>
            {COLUMNS.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="btn btn--small"
          onClick={() => setSort((s) => ({ ...s, dir: s.dir === 1 ? -1 : 1 }))}
          aria-label={sort.dir === 1 ? "Sorted ascending, switch to descending" : "Sorted descending, switch to ascending"}
        >
          {sort.dir === 1 ? "▲ Asc" : "▼ Desc"}
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={c.numeric ? "num" : undefined}
                aria-sort={sort.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}
              >
                <button type="button" className="th-sort" onClick={() => toggle(c.key)}>
                  {c.label}
                  <span className="th-sort__arrow" aria-hidden="true">
                    {sort.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : ""}
                  </span>
                </button>
              </th>
            ))}
            <th>
              <span className="visually-hidden">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((t) => (
            <tr key={t.id}>
              <td className="cell-date">{formatDate(t.date)}</td>
              <td className="cell-name">{t.description}</td>
              <td className="cell-category">
                <span className="chip">{t.category}</span>
              </td>
              <td className={`num amount amount--${t.type}`}>
                {t.type === "income" ? "+" : "−"}
                {formatCurrency(t.amount)}
              </td>
              <td className="actions">
                <button type="button" className="btn btn--small btn--ghost" onClick={() => onEdit(t)}>
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn--small btn--ghost btn--danger"
                  onClick={() => onDelete(t)}
                  aria-label={`Delete ${t.description}`}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
