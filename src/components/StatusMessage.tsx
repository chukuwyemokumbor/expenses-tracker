import type { ReactNode } from "react";

interface Props {
  kind: "loading" | "error";
  title: string;
  children?: ReactNode;
}

/** Full-card loading / error placeholder shown before the data arrives. */
export function StatusMessage({ kind, title, children }: Props) {
  return (
    <section className={`card state state--${kind}`} role={kind === "error" ? "alert" : "status"} aria-live="polite">
      {kind === "loading" ? (
        <span className="spinner" aria-hidden="true" />
      ) : (
        <span className="status__icon state__icon" aria-hidden="true">
          ✕
        </span>
      )}
      <div>
        <div className="state__title">{title}</div>
        {children && <div className="state__body">{children}</div>}
      </div>
    </section>
  );
}
