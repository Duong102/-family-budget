"use client";

import { DeleteButton } from "@/components/shared/delete-button";
import { deleteCategoryAction } from "@/app/(app)/categories/actions";

export function CategoryDeleteButton({ id }: { id: string }) {
  return (
    <DeleteButton
      action={() => deleteCategoryAction(id)}
      confirmMessage="Xóa danh mục này? Hành động không thể hoàn tác."
    />
  );
}
