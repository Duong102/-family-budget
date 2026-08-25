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
  createSavingsGoalAction,
  updateSavingsGoalAction,
  type ActionState,
} from "@/app/(app)/goals/actions";
import { toDateInputValue } from "@/lib/format";

type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: Date | string | null;
};

export function GoalFormDialog({ goal }: { goal?: SavingsGoal }) {
  const isEdit = !!goal;
  const action = isEdit ? updateSavingsGoalAction.bind(null, goal.id) : createSavingsGoalAction;
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);
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
            <Plus className="size-4" /> Đặt mục tiêu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa mục tiêu" : "Đặt mục tiêu tiết kiệm"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Tên mục tiêu</Label>
            <Input
              id="name"
              name="name"
              placeholder="Ví dụ: Du lịch Đà Lạt"
              defaultValue={goal?.name}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetAmount">Số tiền mục tiêu</Label>
            <CurrencyInput
              id="targetAmount"
              name="targetAmount"
              defaultValue={goal?.targetAmount}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentAmount">Đã có sẵn</Label>
            <CurrencyInput
              id="currentAmount"
              name="currentAmount"
              defaultValue={goal?.currentAmount ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="targetDate">Hạn hoàn thành (không bắt buộc)</Label>
            <Input
              id="targetDate"
              name="targetDate"
              type="date"
              defaultValue={goal?.targetDate ? toDateInputValue(goal.targetDate) : ""}
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
