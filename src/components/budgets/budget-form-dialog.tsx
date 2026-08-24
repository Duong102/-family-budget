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
import { upsertBudgetAction, type ActionState } from "@/app/(app)/budgets/actions";

type Category = { id: string; name: string };
type Budget = { id: string; categoryId: string; limitAmount: number };

export function BudgetFormDialog({
  categories,
  month,
  year,
  budget,
  categoryName,
}: {
  categories: Category[];
  month: number;
  year: number;
  budget?: Budget;
  categoryName?: string;
}) {
  const isEdit = !!budget;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    upsertBudgetAction,
    undefined,
  );
  const [open, setOpen] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending && !state?.error) {
      setOpen(false);
    }
    wasPending.current = pending;
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" /> Đặt ngân sách
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa ngân sách" : "Đặt ngân sách"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="month" value={month} />
          <input type="hidden" name="year" value={year} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="categoryId">Danh mục</Label>
            {isEdit ? (
              <>
                <Input value={categoryName} disabled />
                <input type="hidden" name="categoryId" value={budget.categoryId} />
              </>
            ) : (
              <select
                id="categoryId"
                name="categoryId"
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="limitAmount">Hạn mức (VNĐ)</Label>
            <CurrencyInput
              id="limitAmount"
              name="limitAmount"
              defaultValue={budget?.limitAmount}
              required
            />
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
