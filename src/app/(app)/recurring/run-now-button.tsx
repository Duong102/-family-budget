"use client";

import { useTransition } from "react";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { runRecurringTransactionsNowAction } from "@/app/(app)/recurring/actions";

export function RunNowButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await runRecurringTransactionsNowAction();
      if (result?.error) {
        toast.info(result.error);
      } else {
        toast.success("Đã tạo giao dịch cho các mục đến hạn.");
      }
    });
  }

  return (
    <Button variant="outline" type="button" onClick={handleClick} disabled={pending}>
      <Play className="size-4" />
      {pending ? "Đang chạy..." : "Chạy ngay"}
    </Button>
  );
}
