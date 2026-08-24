"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteWalletAction } from "@/app/(app)/wallets/actions";

export function WalletDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteWalletAction(id)}
      confirmMessage="Xóa ví này? Hành động không thể hoàn tác."
    />
  );
}
