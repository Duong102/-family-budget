"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleRecurringTransactionActiveAction } from "@/app/(app)/recurring/actions";

export function ToggleActiveButton({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await toggleRecurringTransactionActiveAction(id);
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" type="button" onClick={handleClick} disabled={pending}>
      {active ? "Tạm dừng" : "Kích hoạt"}
    </Button>
  );
}
