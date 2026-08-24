import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { getBudgetProgress } from "@/lib/queries";
import { formatCurrency, MONTH_NAMES_VI } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { BudgetDeleteButton } from "@/app/(app)/budgets/budget-delete-button";

export default async function BudgetsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const year = params.year ? Number(params.year) : now.getFullYear();

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);

  const [budgets, expenseCategories] = await Promise.all([
    getBudgetProgress(user.householdId, year, month),
    prisma.category.findMany({
      where: { householdId: user.householdId, type: "EXPENSE" },
      orderBy: { name: "asc" },
    }),
  ]);

  const budgetedCategoryIds = new Set(budgets.map((b) => b.categoryId));
  const availableCategories = expenseCategories.filter((c) => !budgetedCategoryIds.has(c.id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ngân sách</h1>
          <p className="text-sm text-muted-foreground">Hạn mức chi tiêu theo danh mục mỗi tháng</p>
        </div>
        <BudgetFormDialog categories={availableCategories} month={month} year={year} />
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/budgets?month=${prevDate.getMonth() + 1}&year=${prevDate.getFullYear()}`}>
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <span className="font-medium">
          {MONTH_NAMES_VI[month - 1]} / {year}
        </span>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/budgets?month=${nextDate.getMonth() + 1}&year=${nextDate.getFullYear()}`}>
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </div>

      {budgets.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          Chưa có ngân sách nào cho tháng này.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <CardTitle className="text-base">{budget.category.name}</CardTitle>
                <div className="flex gap-1">
                  <BudgetFormDialog
                    categories={availableCategories}
                    month={month}
                    year={year}
                    budget={budget}
                    categoryName={budget.category.name}
                  />
                  <BudgetDeleteButton id={budget.id} />
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      budget.percent >= 100
                        ? "bg-red-500"
                        : budget.percent >= 70
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${Math.min(budget.percent, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(budget.spent)} / {formatCurrency(budget.limitAmount)} (
                  {budget.percent}%)
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
