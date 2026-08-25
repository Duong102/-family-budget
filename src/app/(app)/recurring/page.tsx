import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency } from "@/lib/format";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RecurringFormDialog } from "@/components/recurring/recurring-form-dialog";
import { RecurringDeleteButton } from "@/app/(app)/recurring/recurring-delete-button";
import { ToggleActiveButton } from "@/app/(app)/recurring/toggle-active-button";
import { RunNowButton } from "@/app/(app)/recurring/run-now-button";

export default async function RecurringPage() {
  const user = await requireUser();

  const [rules, wallets, categories] = await Promise.all([
    prisma.recurringTransaction.findMany({
      where: { householdId: user.householdId },
      include: { wallet: true, toWallet: true, category: true },
      orderBy: { dayOfMonth: "asc" },
    }),
    prisma.wallet.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Giao dịch định kỳ</h1>
          <p className="text-sm text-muted-foreground">
            Tự động tạo giao dịch hàng tháng (tiền điện, lương, góp quỹ...)
          </p>
        </div>
        <div className="flex gap-2">
          <RunNowButton />
          <RecurringFormDialog wallets={wallets} categories={categories} />
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày hàng tháng</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Danh mục / Ví nhận</TableHead>
              <TableHead>Ví</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Chưa có giao dịch định kỳ nào.
                </TableCell>
              </TableRow>
            )}
            {rules.map((rule) => (
              <TableRow key={rule.id}>
                <TableCell>Ngày {rule.dayOfMonth}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      rule.type === "INCOME"
                        ? "default"
                        : rule.type === "EXPENSE"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {TRANSACTION_TYPE_LABELS[rule.type]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {rule.type === "TRANSFER" ? rule.toWallet?.name : rule.category?.name}
                </TableCell>
                <TableCell>{rule.wallet.name}</TableCell>
                <TableCell className="max-w-40 truncate">{rule.note}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    rule.type === "INCOME"
                      ? "text-emerald-600"
                      : rule.type === "EXPENSE"
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {formatCurrency(rule.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Đang chạy" : "Tạm dừng"}
                    </Badge>
                    <ToggleActiveButton id={rule.id} active={rule.active} />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <RecurringFormDialog rule={rule} wallets={wallets} categories={categories} />
                    <RecurringDeleteButton id={rule.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
