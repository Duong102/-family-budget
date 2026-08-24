import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/enums";

export async function getWalletsWithBalance(householdId: string) {
  const [wallets, transactions] = await Promise.all([
    prisma.wallet.findMany({
      where: { householdId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.transaction.findMany({
      where: { householdId },
      select: { walletId: true, toWalletId: true, type: true, amount: true },
    }),
  ]);

  const balances = new Map(wallets.map((w) => [w.id, w.initialBalance]));

  for (const tx of transactions) {
    if (tx.type === TransactionType.INCOME) {
      balances.set(tx.walletId, (balances.get(tx.walletId) ?? 0) + tx.amount);
    } else if (tx.type === TransactionType.EXPENSE) {
      balances.set(tx.walletId, (balances.get(tx.walletId) ?? 0) - tx.amount);
    } else if (tx.type === TransactionType.TRANSFER) {
      balances.set(tx.walletId, (balances.get(tx.walletId) ?? 0) - tx.amount);
      if (tx.toWalletId) {
        balances.set(tx.toWalletId, (balances.get(tx.toWalletId) ?? 0) + tx.amount);
      }
    }
  }

  return wallets.map((wallet) => ({
    ...wallet,
    balance: balances.get(wallet.id) ?? wallet.initialBalance,
  }));
}

export async function getWalletBalanceMap(householdId: string) {
  const wallets = await getWalletsWithBalance(householdId);
  return new Map(wallets.map((w) => [w.id, w.balance]));
}

export function getMonthRange(year: number, month: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

export async function getMonthlyTotals(householdId: string, year: number, month: number) {
  const { start, end } = getMonthRange(year, month);
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { householdId, type: "INCOME", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { householdId, type: "EXPENSE", date: { gte: start, lt: end } },
      _sum: { amount: true },
    }),
  ]);
  return {
    income: income._sum.amount ?? 0,
    expense: expense._sum.amount ?? 0,
  };
}

export async function getCategoryExpenseBreakdown(
  householdId: string,
  year: number,
  month: number,
) {
  const { start, end } = getMonthRange(year, month);
  const rows = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      householdId,
      type: "EXPENSE",
      date: { gte: start, lt: end },
      categoryId: { not: null },
    },
    _sum: { amount: true },
  });

  const categoryIds = rows.map((r) => r.categoryId).filter((id): id is string => !!id);
  const categories = await prisma.category.findMany({ where: { id: { in: categoryIds } } });
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return rows
    .map((r) => ({
      category: r.categoryId ? categoryMap.get(r.categoryId) : undefined,
      amount: r._sum.amount ?? 0,
    }))
    .filter((r): r is { category: NonNullable<typeof r.category>; amount: number } => !!r.category)
    .sort((a, b) => b.amount - a.amount);
}

export async function getExpenseByPaymentMethod(householdId: string, year: number, month: number) {
  const { start, end } = getMonthRange(year, month);
  const rows = await prisma.transaction.groupBy({
    by: ["walletId"],
    where: { householdId, type: "EXPENSE", date: { gte: start, lt: end } },
    _sum: { amount: true },
  });

  const wallets = await prisma.wallet.findMany({
    where: { id: { in: rows.map((r) => r.walletId) } },
    select: { id: true, type: true },
  });
  const walletTypeMap = new Map(wallets.map((w) => [w.id, w.type]));

  let cash = 0;
  let transfer = 0;
  for (const row of rows) {
    const amount = row._sum.amount ?? 0;
    if (walletTypeMap.get(row.walletId) === "CASH") {
      cash += amount;
    } else {
      transfer += amount;
    }
  }

  return [
    { name: "Tiền mặt", amount: cash },
    { name: "Chuyển khoản", amount: transfer },
  ];
}

export async function getMonthlyTrend(householdId: string, monthsCount = 6) {
  const now = new Date();
  const months: { year: number; month: number }[] = [];
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
  }

  return Promise.all(
    months.map(async ({ year, month }) => {
      const totals = await getMonthlyTotals(householdId, year, month);
      return { year, month, ...totals };
    }),
  );
}

export async function getBudgetProgress(householdId: string, year: number, month: number) {
  const budgets = await prisma.budget.findMany({
    where: { householdId, year, month },
    include: { category: true },
    orderBy: { category: { name: "asc" } },
  });

  const breakdown = await getCategoryExpenseBreakdown(householdId, year, month);
  const spentMap = new Map(breakdown.map((b) => [b.category.id, b.amount]));

  return budgets.map((budget) => {
    const spent = spentMap.get(budget.categoryId) ?? 0;
    const percent = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;
    return { ...budget, spent, percent };
  });
}
