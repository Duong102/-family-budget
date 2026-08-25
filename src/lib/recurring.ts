import { prisma } from "@/lib/prisma";

export async function generateDueRecurringTransactions(householdId?: string) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  const rules = await prisma.recurringTransaction.findMany({
    where: {
      active: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
      ...(householdId ? { householdId } : {}),
    },
  });

  let created = 0;

  for (const rule of rules) {
    if (rule.lastRunMonth === month && rule.lastRunYear === year) continue;

    const daysInMonth = new Date(year, month, 0).getDate();
    const effectiveDay = Math.min(rule.dayOfMonth, daysInMonth);
    if (day < effectiveDay) continue;

    await prisma.$transaction([
      prisma.transaction.create({
        data: {
          householdId: rule.householdId,
          userId: rule.createdByUserId,
          type: rule.type,
          amount: rule.amount,
          note: rule.note,
          date: new Date(year, month - 1, effectiveDay),
          walletId: rule.walletId,
          toWalletId: rule.type === "TRANSFER" ? rule.toWalletId : null,
          categoryId: rule.type !== "TRANSFER" ? rule.categoryId : null,
        },
      }),
      prisma.recurringTransaction.update({
        where: { id: rule.id },
        data: { lastRunMonth: month, lastRunYear: year },
      }),
    ]);
    created++;
  }

  return created;
}
