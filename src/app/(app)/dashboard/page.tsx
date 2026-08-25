import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getWalletsWithBalance, getMonthlyTotals, getBudgetProgress } from "@/lib/queries";
import { formatCurrency, formatDate, MONTH_NAMES_VI } from "@/lib/format";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";

export default async function DashboardPage() {
  const user = await requireUser();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [wallets, totals, budgets, recentTransactions, categories, goals] = await Promise.all([
    getWalletsWithBalance(user.householdId),
    getMonthlyTotals(user.householdId, year, month),
    getBudgetProgress(user.householdId, year, month),
    prisma.transaction.findMany({
      where: { householdId: user.householdId },
      include: { wallet: true, category: true, toWallet: true, user: true },
      orderBy: { date: "desc" },
      take: 8,
    }),
    prisma.category.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
    prisma.savingsGoal.findMany({
      where: { householdId: user.householdId },
      orderBy: { createdAt: "asc" },
      take: 4,
    }),
  ]);

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const overBudget = budgets.filter((b) => b.percent >= 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Tổng quan</h1>
          <p className="text-sm text-muted-foreground">
            {MONTH_NAMES_VI[month - 1]} / {year}
          </p>
        </div>
        <TransactionFormDialog wallets={wallets} categories={categories} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng số dư
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{formatCurrency(totalBalance)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Thu trong tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(totals.income)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chi trong tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-red-600">{formatCurrency(totals.expense)}</p>
          </CardContent>
        </Card>
      </div>

      {overBudget.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">
              Danh mục vượt ngân sách tháng này
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {overBudget.map((b) => (
              <Badge key={b.id} variant="destructive">
                {b.category.name}: {b.percent}%
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Giao dịch gần đây</CardTitle>
            <Link href="/transactions" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {recentTransactions.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có giao dịch nào.</p>
            )}
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">
                    {tx.type === "TRANSFER" ? tx.toWallet?.name : tx.category?.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(tx.date)} · {tx.wallet.name} · {tx.user.name}
                  </p>
                </div>
                <span
                  className={
                    tx.type === "INCOME"
                      ? "font-medium text-emerald-600"
                      : tx.type === "EXPENSE"
                        ? "font-medium text-red-600"
                        : "font-medium"
                  }
                >
                  {TRANSACTION_TYPE_LABELS[tx.type]}: {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tiến độ ngân sách</CardTitle>
            <Link href="/budgets" className="text-sm text-primary hover:underline">
              Xem tất cả
            </Link>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {budgets.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa đặt ngân sách nào.</p>
            )}
            {budgets.slice(0, 6).map((b) => (
              <div key={b.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span>{b.category.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      b.percent >= 100
                        ? "bg-red-500"
                        : b.percent >= 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(b.percent, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Mục tiêu tiết kiệm</CardTitle>
          <Link href="/goals" className="text-sm text-primary hover:underline">
            Xem tất cả
          </Link>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {goals.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa đặt mục tiêu nào.</p>
          )}
          {goals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            return (
              <div key={goal.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="truncate">{goal.name}</span>
                  <span className="text-muted-foreground">{percent}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${percent >= 100 ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
