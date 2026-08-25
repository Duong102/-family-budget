"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteSavingsGoalAction } from "@/app/(app)/goals/actions";

export function GoalDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteSavingsGoalAction(id)}
      confirmMessage="Xóa mục tiêu tiết kiệm này? Hành động không thể hoàn tác."
    />
  );
}
