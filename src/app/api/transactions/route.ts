import type { NextRequest } from "next/server";
import { readData, updateData } from "@/lib/server/db";
import { validateTransaction } from "@/lib/validate";

export async function GET() {
  const { transactions } = await readData();
  return Response.json(transactions);
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const result = validateTransaction(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  const created = await updateData((data) => {
    const transaction = { ...result.value, id: crypto.randomUUID() };
    data.transactions.push(transaction);
    return transaction;
  });
  return Response.json(created, { status: 201 });
}
