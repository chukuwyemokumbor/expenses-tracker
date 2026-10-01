"use client";

import { useState } from "react";
import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatMonth, formatMonthShort, monthKey, totals } from "@/lib/format";
import { useElementWidth } from "@/hooks/useElementWidth";

const HEIGHT = 220;
const M = { top: 12, right: 8, bottom: 28, left: 52 };
const BAR = 24;
const GAP = 2;
const SERIES = [
  { key: "income", label: "Income", className: "series-1" },
  { key: "expenses", label: "Expenses", className: "series-2" },
] as const;

const compact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" });

interface Props {
  transactions: Transaction[];
  /** The month picked in the filters; its label is emphasised. */
  selectedMonth: string;
}

/** Income vs expenses per month as grouped columns. */
export function MonthlyChart({ transactions, selectedMonth }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);

  const keys = [...new Set(transactions.map((t) => monthKey(t.date)))].sort();
  const data = keys.map((key) => ({ key, ...totals(transactions.filter((t) => monthKey(t.date) === key)) }));

  const plotW = Math.max(60, width - M.left - M.right);
  const plotH = HEIGHT - M.top - M.bottom;
  const ticks = niceTicks(Math.max(1, ...data.flatMap((d) => [d.income, d.expenses])));
  const yMax = ticks[ticks.length - 1];
  const y = (v: number) => M.top + plotH - (v / yMax) * plotH;
  const band = data.length ? plotW / data.length : plotW;
  const bar = Math.min(BAR, (band * 0.7 - GAP) / 2);

  return (
    <div ref={ref} className="chart">
      <ul className="legend">
        {SERIES.map((s) => (
          <li key={s.key}>
            <span className={`legend__swatch ${s.className}`} aria-hidden="true" />
            {s.label}
          </li>
        ))}
      </ul>
      {data.length === 0 ? (
        <div className="empty">No transactions match these filters.</div>
      ) : (
        <svg width={width} height={HEIGHT} role="img" aria-label="Income and expenses by month">
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} className={t === 0 ? "axis-line" : "grid-line"} />
              <text x={M.left - 8} y={y(t)} className="tick" textAnchor="end" dominantBaseline="middle">
                {compact.format(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) => {
            const cx = M.left + band * i + band / 2;
            return (
              <g
                key={d.key}
                tabIndex={0}
                className="bar-row"
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
              >
                <rect x={M.left + band * i} y={M.top} width={band} height={plotH} fill="transparent" />
                {SERIES.map((s, j) => {
                  const v = d[s.key];
                  const x = cx - bar - GAP / 2 + j * (bar + GAP);
                  return (
                    <path
                      key={s.key}
                      d={roundedTop(x, y(v), bar, y(0) - y(v), 4)}
                      className={`column ${s.className}${hover === i ? " column--active" : ""}`}
                    />
                  );
                })}
                <text
                  x={cx}
                  y={HEIGHT - 8}
                  textAnchor="middle"
                  className={d.key === selectedMonth ? "tick tick--selected" : "tick"}
                >
                  {formatMonthShort(d.key)}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {hover !== null && data[hover] && (
        <div
          className="tooltip"
          style={{ left: Math.min(M.left + band * hover + band / 2 + bar + 8, width - 170), top: 40 }}
        >
          <div className="tooltip__label">{formatMonth(data[hover].key)}</div>
          {SERIES.map((s) => (
            <div key={s.key} className="tooltip__row">
              <span className={`legend__line ${s.className}`} aria-hidden="true" />
              <span className="tooltip__value">{formatCurrency(data[hover][s.key])}</span>
              <span className="tooltip__label">{s.label}</span>
            </div>
          ))}
          <div className="tooltip__meta">Net {formatCurrency(data[hover].net)}</div>
        </div>
      )}
    </div>
  );
}

/** Column square at the baseline with a rounded top. */
function roundedTop(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const rr = Math.min(r, w / 2, h);
  return `M${x},${y + h} V${y + rr} Q${x},${y} ${x + rr},${y} H${x + w - rr} Q${x + w},${y} ${x + w},${y + rr} V${y + h} Z`;
}

function niceTicks(max: number, count = 4): number[] {
  const raw = max / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(Math.round(v));
  return ticks;
}
