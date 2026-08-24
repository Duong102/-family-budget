"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteTransactionAction } from "@/app/(app)/transactions/actions";

export function TransactionDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteTransactionAction(id)}
      confirmMessage="Xóa giao dịch này? Hành động không thể hoàn tác."
    />
  );
}
