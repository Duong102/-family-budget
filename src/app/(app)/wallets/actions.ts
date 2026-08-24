"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { walletSchema } from "@/lib/validations";

export type ActionState = { error?: string } | undefined;

export async function createWalletAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = walletSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await prisma.wallet.create({
    data: { ...parsed.data, householdId: user.householdId },
  });

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}

export async function updateWalletAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = walletSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const wallet = await prisma.wallet.findFirst({ where: { id, householdId: user.householdId } });
  if (!wallet) return { error: "Không tìm thấy ví" };

  await prisma.wallet.update({ where: { id }, data: parsed.data });

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}

export async function deleteWalletAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const wallet = await prisma.wallet.findFirst({ where: { id, householdId: user.householdId } });
  if (!wallet) return { error: "Không tìm thấy ví" };

  const txCount = await prisma.transaction.count({
    where: { OR: [{ walletId: id }, { toWalletId: id }] },
  });
  if (txCount > 0) {
    return { error: "Không thể xóa ví đã có giao dịch" };
  }

  await prisma.wallet.delete({ where: { id } });
  revalidatePath("/wallets");
  revalidatePath("/dashboard");
}
