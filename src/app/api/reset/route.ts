import { resetData } from "@/lib/server/db";

/** Restores the sample transactions and budgets. */
export async function POST() {
  return Response.json(await resetData());
}
