"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createTransactionAction,
  updateTransactionAction,
  type ActionState,
} from "@/app/(app)/transactions/actions";
import { toDateInputValue } from "@/lib/format";

type Wallet = { id: string; name: string };
type Category = { id: string; name: string; type: string };
type Transaction = {
  id: string;
  type: string;
  amount: number;
  walletId: string;
  toWalletId: string | null;
  categoryId: string | null;
  note: string | null;
  date: Date | string;
};

export function TransactionFormDialog({
  transaction,
  wallets,
  categories,
}: {
  transaction?: Transaction;
  wallets: Wallet[];
  categories: Category[];
}) {
  const isEdit = !!transaction;
  const action = isEdit
    ? updateTransactionAction.bind(null, transaction.id)
    : createTransactionAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(transaction?.type ?? "EXPENSE");
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Thêm giao dịch
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa giao dịch" : "Thêm giao dịch"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Loại giao dịch</Label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="EXPENSE">Chi</option>
              <option value="INCOME">Thu</option>
              <option value="TRANSFER">Chuyển khoản</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="amount">Số tiền</Label>
            <CurrencyInput
              id="amount"
              name="amount"
              defaultValue={transaction?.amount}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="walletId">{type === "TRANSFER" ? "Ví nguồn" : "Ví"}</Label>
            <select
              id="walletId"
              name="walletId"
              defaultValue={transaction?.walletId}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="">-- Chọn ví --</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {type === "TRANSFER" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="toWalletId">Ví nhận</Label>
              <select
                id="toWalletId"
                name="toWalletId"
                defaultValue={transaction?.toWalletId ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">-- Chọn ví --</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">Danh mục</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={transaction?.categoryId ?? ""}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="date">Ngày</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={
                transaction ? toDateInputValue(transaction.date) : toDateInputValue(new Date())
              }
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input id="note" name="note" defaultValue={transaction?.note ?? ""} />
          </div>

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
