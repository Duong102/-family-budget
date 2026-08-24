"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { transactionSchema } from "@/lib/validations";

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

export async function createTransactionAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
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

  await prisma.transaction.create({
    data: {
      householdId: user.householdId,
      userId: user.id,
      type: data.type,
      amount: data.amount,
      note: data.note || null,
      date: new Date(data.date),
      walletId: data.walletId,
      toWalletId: data.type === "TRANSFER" ? data.toWalletId : null,
      categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
}

export async function updateTransactionAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = transactionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const data = parsed.data;

  const existing = await prisma.transaction.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!existing) return { error: "Không tìm thấy giao dịch" };

  const ownershipError = await assertOwnership(
    user.householdId,
    data.walletId,
    data.type === "TRANSFER" ? data.toWalletId : undefined,
    data.type !== "TRANSFER" ? data.categoryId : undefined,
  );
  if (ownershipError) return { error: ownershipError };

  await prisma.transaction.update({
    where: { id },
    data: {
      type: data.type,
      amount: data.amount,
      note: data.note || null,
      date: new Date(data.date),
      walletId: data.walletId,
      toWalletId: data.type === "TRANSFER" ? data.toWalletId : null,
      categoryId: data.type !== "TRANSFER" ? data.categoryId : null,
    },
  });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
}

export async function deleteTransactionAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const existing = await prisma.transaction.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!existing) return { error: "Không tìm thấy giao dịch" };

  await prisma.transaction.delete({ where: { id } });

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/wallets");
  revalidatePath("/budgets");
}
