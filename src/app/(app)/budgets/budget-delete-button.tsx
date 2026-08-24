"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteBudgetAction } from "@/app/(app)/budgets/actions";

export function BudgetDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteBudgetAction(id)}
      confirmMessage="Xóa ngân sách này? Hành động không thể hoàn tác."
    />
  );
}
