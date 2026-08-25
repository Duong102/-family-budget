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
  createRecurringTransactionAction,
  updateRecurringTransactionAction,
  type ActionState,
} from "@/app/(app)/recurring/actions";

type Wallet = { id: string; name: string };
type Category = { id: string; name: string; type: string };
type RecurringRule = {
  id: string;
  type: string;
  amount: number;
  walletId: string;
  toWalletId: string | null;
  categoryId: string | null;
  note: string | null;
  dayOfMonth: number;
};

export function RecurringFormDialog({
  rule,
  wallets,
  categories,
}: {
  rule?: RecurringRule;
  wallets: Wallet[];
  categories: Category[];
}) {
  const isEdit = !!rule;
  const action = isEdit
    ? updateRecurringTransactionAction.bind(null, rule.id)
    : createRecurringTransactionAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(rule?.type ?? "EXPENSE");
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
            <Plus className="size-4" /> Thêm giao dịch định kỳ
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa giao dịch định kỳ" : "Thêm giao dịch định kỳ"}</DialogTitle>
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
            <CurrencyInput id="amount" name="amount" defaultValue={rule?.amount} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="walletId">{type === "TRANSFER" ? "Ví nguồn" : "Ví"}</Label>
            <select
              id="walletId"
              name="walletId"
              defaultValue={rule?.walletId}
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
                defaultValue={rule?.toWalletId ?? ""}
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
                defaultValue={rule?.categoryId ?? ""}
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
            <Label htmlFor="dayOfMonth">Ngày lặp lại hàng tháng</Label>
            <Input
              id="dayOfMonth"
              name="dayOfMonth"
              type="number"
              min="1"
              max="31"
              defaultValue={rule?.dayOfMonth ?? 1}
              required
            />
            <p className="text-xs text-muted-foreground">
              Nếu tháng không có ngày này (ví dụ 31), sẽ tự chạy vào ngày cuối tháng.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="note">Ghi chú</Label>
            <Input id="note" name="note" defaultValue={rule?.note ?? ""} />
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
