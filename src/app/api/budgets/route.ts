import type { NextRequest } from "next/server";
import { readData, updateData } from "@/lib/server/db";
import { validateBudgets } from "@/lib/validate";

export async function GET() {
  const { budgets } = await readData();
  return Response.json(budgets);
}

export async function PUT(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const result = validateBudgets(body);
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  const budgets = await updateData((data) => {
    data.budgets = result.value;
    return data.budgets;
  });
  return Response.json(budgets);
}
