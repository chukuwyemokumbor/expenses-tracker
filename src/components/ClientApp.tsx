"use client";

import dynamic from "next/dynamic";
import { StatusMessage } from "./StatusMessage";

// The tracker reads browser-only state, so it renders on the client only.
export const ClientApp = dynamic(() => import("./ExpenseTracker").then((m) => m.ExpenseTracker), {
  ssr: false,
  loading: () => (
    <main className="page">
      <StatusMessage kind="loading" title="Loading your expenses…" />
    </main>
  ),
});
