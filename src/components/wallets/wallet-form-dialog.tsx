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
  createWalletAction,
  updateWalletAction,
  type ActionState,
} from "@/app/(app)/wallets/actions";
import { WALLET_TYPE_LABELS } from "@/lib/constants";

type Wallet = { id: string; name: string; type: string; initialBalance: number };

export function WalletFormDialog({ wallet }: { wallet?: Wallet }) {
  const isEdit = !!wallet;
  const action = isEdit ? updateWalletAction.bind(null, wallet.id) : createWalletAction;
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
            <Plus className="size-4" /> Thêm ví
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa ví" : "Thêm ví mới"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Tên ví</Label>
            <Input id="name" name="name" defaultValue={wallet?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="type">Loại ví</Label>
            <select
              id="type"
              name="type"
              defaultValue={wallet?.type ?? "CASH"}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {Object.entries(WALLET_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="initialBalance">Số dư ban đầu</Label>
            <CurrencyInput
              id="initialBalance"
              name="initialBalance"
              defaultValue={wallet?.initialBalance ?? 0}
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
