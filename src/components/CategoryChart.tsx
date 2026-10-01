"use client";

import { useState } from "react";
import type { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/format";
import { useElementWidth } from "@/hooks/useElementWidth";

const BAR = 18;
const ROW = 32;
const LABEL_W = 104;
const VALUE_W = 76;

const whole = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** Expenses by category - a single-series horizontal bar chart, largest first. */
export function CategoryChart({ transactions }: { transactions: Transaction[] }) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<string | null>(null);

  const totals = new Map<string, { amount: number; count: number }>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const row = totals.get(t.category) ?? { amount: 0, count: 0 };
    row.amount += t.amount;
    row.count += 1;
    totals.set(t.category, row);
  }
  const rows = [...totals.entries()].map(([category, r]) => ({ category, ...r })).sort((a, b) => b.amount - a.amount);
  const sum = rows.reduce((s, r) => s + r.amount, 0);
  const max = Math.max(1, ...rows.map((r) => r.amount));
  const plotW = Math.max(40, width - LABEL_W - VALUE_W);
  const height = rows.length * ROW;

  return (
    <div ref={ref} className="chart">
      {rows.length === 0 ? (
        <div className="empty">No expenses in this period.</div>
      ) : (
        <svg width={width} height={height} role="img" aria-label="Spending by category">
          <line x1={LABEL_W} x2={LABEL_W} y1={0} y2={height} className="axis-line" />
          {rows.map((r, i) => {
            const y = i * ROW + (ROW - BAR) / 2;
            const w = Math.max(2, (r.amount / max) * plotW);
            return (
              <g
                key={r.category}
                tabIndex={0}
                className="bar-row"
                onPointerEnter={() => setHover(r.category)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(r.category)}
                onBlur={() => setHover(null)}
              >
                {/* The whole row is the hit target, not just the painted bar. */}
                <rect x={0} y={i * ROW} width={width} height={ROW} fill="transparent" />
                <text x={LABEL_W - 10} y={i * ROW + ROW / 2} className="axis-label" textAnchor="end" dominantBaseline="middle">
                  {r.category}
                </text>
                <path
                  d={roundedRight(LABEL_W + 1, y, w, BAR, 4)}
                  className={hover === r.category ? "bar bar--active" : "bar"}
                />
                <text x={LABEL_W + w + 8} y={i * ROW + ROW / 2} className="value-label" dominantBaseline="middle">
                  {whole.format(r.amount)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hover &&
        (() => {
          const idx = rows.findIndex((r) => r.category === hover);
          const r = rows[idx];
          if (!r) return null;
          return (
            <div className="tooltip" style={{ left: LABEL_W + 12, top: idx * ROW + ROW }}>
              <div className="tooltip__value">{formatCurrency(r.amount)}</div>
              <div className="tooltip__label">{r.category}</div>
              <div className="tooltip__meta">
                {Math.round((r.amount / sum) * 100)}% of spending · {r.count} {r.count === 1 ? "transaction" : "transactions"}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

/** Bar square at the baseline with a rounded data end. */
function roundedRight(x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  return `M${x},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h - rr} Q${x + w},${y + h} ${x + w - rr},${y + h} H${x} Z`;
}
