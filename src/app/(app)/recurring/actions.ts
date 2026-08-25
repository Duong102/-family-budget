"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { recurringTransactionSchema } from "@/lib/validations";
import { generateDueRecurringTransactions } from "@/lib/recurring";

export type ActionState = { error?: string } | undefined;

async function assertOwnership(householdId: string, walletId: string, toWalletId?: string, categoryId?: string) {
  const walletIds = [walletId, ...(toWalletId ? [toWalletId] : [])];
  const walletCount = await prisma.wallet.count({
    where: { id: { in: walletIds }, householdId },
  });
  if (walletCount !== walletIds.length) return "Ví không hợp lệ";

  if (categoryId) {
    const category = await prisma.category.findFirst({ where: { id: categoryId, householdId } });
    if (!category) return "Danh mục không hợp lệ";
  }
  return null;
}

export async function createRecurringTransactionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recurringTransactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const data = parsed.data;

  const ownershipError = await assertOwnership(
    user.householdId,
    data.walletId,
    data.type === "TRANSFER" ? data.toWalletId : undefined,
    data.type !== "TRANSFER" ? data.categoryId : undefined,
  );
  if (ownershipError) return { error: ownershipError };

  await prisma.recurringTransaction.create({
    data: {
      householdId: user.householdId,
      createdByUserId: user.id,
      type: data.type,
      amount: data.amount,
      note: data.note || null,
      dayOfMonth: data.dayOfMonth,
      walletId: data.walletId,
      toWalletId: data.type === "TRANSFER" ? data.toWalletId : null,
      categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
    },
  });

  revalidatePath("/recurring");
}

export async function updateRecurringTransactionAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = recurringTransactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const data = parsed.data;

  const existing = await prisma.recurringTransaction.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!existing) return { error: "Không tìm thấy giao dịch định kỳ" };

  const ownershipError = await assertOwnership(
    user.householdId,
    data.walletId,
    data.type === "TRANSFER" ? data.toWalletId : undefined,
    data.type !== "TRANSFER" ? data.categoryId : undefined,
  );
  if (ownershipError) return { error: ownershipError };

  await prisma.recurringTransaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      note: data.note || null,
      dayOfMonth: data.dayOfMonth,
      walletId: data.walletId,
      toWalletId: data.type === "TRANSFER" ? data.toWalletId : null,
      categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
    },
  });

  revalidatePath("/recurring");
}

export async function deleteRecurringTransactionAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const rule = await prisma.recurringTransaction.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!rule) return { error: "Không tìm thấy giao dịch định kỳ" };

  await prisma.recurringTransaction.delete({ where: { id } });
  revalidatePath("/recurring");
}

export async function toggleRecurringTransactionActiveAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const rule = await prisma.recurringTransaction.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!rule) return { error: "Không tìm thấy giao dịch định kỳ" };

  await prisma.recurringTransaction.update({
    where: { id },
    data: { active: !rule.active },
  });
  revalidatePath("/recurring");
}

export async function runRecurringTransactionsNowAction(): Promise<ActionState> {
  const user = await requireUser();
  const created = await generateDueRecurringTransactions(user.householdId);

  revalidatePath("/recurring");
  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/wallets");
  revalidatePath("/budgets");

  if (created === 0) {
    return { error: "Không có giao dịch định kỳ nào đến hạn hôm nay." };
  }
}
