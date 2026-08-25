import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { GoalDeleteButton } from "@/app/(app)/goals/goal-delete-button";

export default async function GoalsPage() {
  const user = await requireUser();

  const goals = await prisma.savingsGoal.findMany({
    where: { householdId: user.householdId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Mục tiêu tiết kiệm</h1>
          <p className="text-sm text-muted-foreground">Đặt mục tiêu và theo dõi tiến độ tiết kiệm</p>
        </div>
        <GoalFormDialog />
      </div>

      {goals.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">Chưa có mục tiêu nào.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const percent =
              goal.targetAmount > 0
                ? Math.round((goal.currentAmount / goal.targetAmount) * 100)
                : 0;
            const reached = percent >= 100;
            return (
              <Card key={goal.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <CardTitle className="text-base">{goal.name}</CardTitle>
                  <div className="flex gap-1">
                    <GoalFormDialog goal={goal} />
                    <GoalDeleteButton id={goal.id} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${reached ? "bg-emerald-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} (
                    {percent}%)
                  </p>
                  {reached && (
                    <p className="text-sm font-medium text-emerald-600">Đã đạt mục tiêu!</p>
                  )}
                  {goal.targetDate && (
                    <p className="text-xs text-muted-foreground">
                      Hạn: {formatDate(goal.targetDate)}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
