"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteRecurringTransactionAction } from "@/app/(app)/recurring/actions";

export function RecurringDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteRecurringTransactionAction(id)}
      confirmMessage="Xóa giao dịch định kỳ này? Hành động không thể hoàn tác."
    />
  );
}
