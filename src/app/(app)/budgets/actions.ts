"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { budgetSchema } from "@/lib/validations";

export type ActionState = { error?: string } | undefined;

export async function upsertBudgetAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = budgetSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { categoryId, month, year, limitAmount } = parsed.data;

  const category = await prisma.category.findFirst({
    where: { id: categoryId, householdId: user.householdId, type: "EXPENSE" },
  });
  if (!category) return { error: "Danh mục không hợp lệ" };

  await prisma.budget.upsert({
    where: { categoryId_month_year: { categoryId, month, year } },
    create: { categoryId, month, year, limitAmount, householdId: user.householdId },
    update: { limitAmount },
  });

  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}

export async function deleteBudgetAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const budget = await prisma.budget.findFirst({ where: { id, householdId: user.householdId } });
  if (!budget) return { error: "Không tìm thấy ngân sách" };

  await prisma.budget.delete({ where: { id } });
  revalidatePath("/budgets");
  revalidatePath("/dashboard");
}
