"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { categorySchema } from "@/lib/validations";

export type ActionState = { error?: string } | undefined;

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  await prisma.category.create({
    data: { ...parsed.data, householdId: user.householdId },
  });

  revalidatePath("/categories");
}

export async function updateCategoryAction(
  id: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }

  const category = await prisma.category.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!category) return { error: "Không tìm thấy danh mục" };

  await prisma.category.update({ where: { id }, data: parsed.data });
  revalidatePath("/categories");
}

export async function deleteCategoryAction(id: string): Promise<ActionState> {
  const user = await requireUser();
  const category = await prisma.category.findFirst({
    where: { id, householdId: user.householdId },
  });
  if (!category) return { error: "Không tìm thấy danh mục" };

  const [txCount, budgetCount] = await Promise.all([
    prisma.transaction.count({ where: { categoryId: id } }),
    prisma.budget.count({ where: { categoryId: id } }),
  ]);
  if (txCount > 0 || budgetCount > 0) {
    return { error: "Không thể xóa danh mục đang được sử dụng" };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}
