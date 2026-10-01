import type { NextRequest } from "next/server";
import { updateData } from "@/lib/server/db";
import { validateTransaction } from "@/lib/validate";

const notFound = () => Response.json({ error: "Transaction not found." }, { status: 404 });

export async function PUT(request: NextRequest, ctx: RouteContext<"/api/transactions/[id]">) {
  const { id } = await ctx.params;
  const body: unknown = await request.json().catch(() => null);
  const result = validateTransaction(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  const updated = await updateData((data) => {
    const index = data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return null;
    data.transactions[index] = { ...result.value, id };
    return data.transactions[index];
  });
  return updated ? Response.json(updated) : notFound();
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<"/api/transactions/[id]">) {
  const { id } = await ctx.params;
  const deleted = await updateData((data) => {
    const before = data.transactions.length;
    data.transactions = data.transactions.filter((t) => t.id !== id);
    return data.transactions.length < before;
  });
  return deleted ? new Response(null, { status: 204 }) : notFound();
}
