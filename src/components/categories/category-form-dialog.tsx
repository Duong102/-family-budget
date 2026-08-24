"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  createCategoryAction,
  updateCategoryAction,
  type ActionState,
} from "@/app/(app)/categories/actions";

type Category = { id: string; name: string; type: string; color: string | null };

export function CategoryFormDialog({
  category,
  defaultType,
}: {
  category?: Category;
  defaultType: "INCOME" | "EXPENSE";
}) {
  const isEdit = !!category;
  const action = isEdit ? updateCategoryAction.bind(null, category.id) : createCategoryAction;
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
            <Plus className="size-4" /> Thêm danh mục
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sửa danh mục" : "Thêm danh mục"}</DialogTitle>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="type" value={category?.type ?? defaultType} />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Tên danh mục</Label>
            <Input id="name" name="name" defaultValue={category?.name} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Màu sắc</Label>
            <Input
              id="color"
              name="color"
              type="color"
              className="h-9 w-16 p-1"
              defaultValue={category?.color ?? "#6366f1"}
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
