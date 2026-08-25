import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatCurrency, formatDate } from "@/lib/format";
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
import { TransactionFormDialog } from "@/components/transactions/transaction-form-dialog";
import { ExportTransactionsButton } from "@/components/transactions/export-transactions-button";
import { TransactionDeleteButton } from "@/app/(app)/transactions/transaction-delete-button";
import { FilterBar } from "@/app/(app)/transactions/filter-bar";
import type { Prisma } from "@/generated/prisma/client";

type SearchParams = {
  walletId?: string;
  categoryId?: string;
  type?: string;
  from?: string;
  to?: string;
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const where: Prisma.TransactionWhereInput = { householdId: user.householdId };
  if (params.walletId) where.walletId = params.walletId;
  if (params.categoryId) where.categoryId = params.categoryId;
  if (params.type) where.type = params.type as Prisma.TransactionWhereInput["type"];
  if (params.from || params.to) {
    where.date = {
      ...(params.from ? { gte: new Date(params.from) } : {}),
      ...(params.to ? { lt: new Date(new Date(params.to).getTime() + 86400000) } : {}),
    };
  }

  const [transactions, wallets, categories] = await Promise.all([
    prisma.transaction.findMany({
      where,
      include: { wallet: true, toWallet: true, category: true, user: true },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.wallet.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { householdId: user.householdId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Giao dịch</h1>
        <div className="flex gap-2">
          <ExportTransactionsButton
            transactions={transactions.map((tx) => ({
              date: tx.date,
              type: tx.type,
              categoryOrToWallet: tx.type === "TRANSFER" ? tx.toWallet?.name ?? null : tx.category?.name ?? null,
              walletName: tx.wallet.name,
              note: tx.note,
              userName: tx.user.name,
              amount: tx.amount,
            }))}
          />
          <TransactionFormDialog wallets={wallets} categories={categories} />
        </div>
      </div>

      <FilterBar wallets={wallets} categories={categories} defaultValues={params} />

      <div className="overflow-x-auto rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ngày</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Danh mục / Ví nhận</TableHead>
              <TableHead>Ví</TableHead>
              <TableHead>Ghi chú</TableHead>
              <TableHead>Người ghi</TableHead>
              <TableHead className="text-right">Số tiền</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Chưa có giao dịch nào phù hợp.
                </TableCell>
              </TableRow>
            )}
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{formatDate(tx.date)}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      tx.type === "INCOME"
                        ? "default"
                        : tx.type === "EXPENSE"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {TRANSACTION_TYPE_LABELS[tx.type]}
                  </Badge>
                </TableCell>
                <TableCell>{tx.type === "TRANSFER" ? tx.toWallet?.name : tx.category?.name}</TableCell>
                <TableCell>{tx.wallet.name}</TableCell>
                <TableCell className="max-w-40 truncate">{tx.note}</TableCell>
                <TableCell>{tx.user.name}</TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    tx.type === "INCOME"
                      ? "text-emerald-600"
                      : tx.type === "EXPENSE"
                        ? "text-red-600"
                        : ""
                  }`}
                >
                  {formatCurrency(tx.amount)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <TransactionFormDialog
                      transaction={tx}
                      wallets={wallets}
                      categories={categories}
                    />
                    <TransactionDeleteButton id={tx.id} />
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
