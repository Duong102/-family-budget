"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { savingsGoalSchema } from "@/lib/validations";

export type ActionState = { error?: string } | undefined;

export async function createSavingsGoalAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = savingsGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, targetAmount, currentAmount, targetDate } = parsed.data;

  await prisma.savingsGoal.create({
    data: {
      householdId: user.householdId,
      name,
      targetAmount,
      currentAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function updateSavingsGoalAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = savingsGoalSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, targetAmount, currentAmount, targetDate } = parsed.data;

  const existing = await prisma.savingsGoal.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!existing) return { error: "Không tìm thấy mục tiêu" };

  await prisma.savingsGoal.update({
    where: { id },
    data: {
      name,
      targetAmount,
      currentAmount,
      targetDate: targetDate ? new Date(targetDate) : null,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function deleteSavingsGoalAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const goal = await prisma.savingsGoal.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!goal) return { error: "Không tìm thấy mục tiêu" };

  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/goals");
  revalidatePath("/dashboard");
}
