"use client";

import dynamic from "next/dynamic";

// The tracker reads browser-only state, so it renders on the client only.
export const ClientApp = dynamic(() => import("./ExpenseTracker").then((m) => m.ExpenseTracker), { ssr: false });
