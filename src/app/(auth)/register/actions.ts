"use server";

import bcrypt from "bcryptjs";
import { customAlphabet } from "nanoid";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { createHouseholdSchema, joinHouseholdSchema } from "@/lib/validations";

const generateInviteCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8);

const DEFAULT_EXPENSE_CATEGORIES = [
  "Ăn uống",
  "Đi lại",
  "Hóa đơn",
  "Mua sắm",
  "Giải trí",
  "Sức khỏe",
  "Giáo dục",
  "Khác",
];
const DEFAULT_INCOME_CATEGORIES = ["Góp quỹ chung"];

export type ActionState = { error?: string } | undefined;

export async function createHouseholdAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = createHouseholdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, email, password, householdName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email này đã được đăng ký" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const inviteCode = generateInviteCode();

  await prisma.household.create({
    data: {
      name: householdName,
      inviteCode,
      users: {
        create: { name, email, passwordHash, role: "OWNER" },
      },
      categories: {
        create: [
          ...DEFAULT_EXPENSE_CATEGORIES.map((categoryName) => ({
            name: categoryName,
            type: "EXPENSE" as const,
          })),
          ...DEFAULT_INCOME_CATEGORIES.map((categoryName) => ({
            name: categoryName,
            type: "INCOME" as const,
          })),
        ],
      },
    },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}

export async function joinHouseholdAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = joinHouseholdSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  const { name, email, password, inviteCode } = parsed.data;

  const household = await prisma.household.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
  });
  if (!household) {
    return { error: "Mã mời không hợp lệ" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Email này đã được đăng ký" };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash, role: "MEMBER", householdId: household.id },
  });

  await signIn("credentials", { email, password, redirectTo: "/dashboard" });
}
