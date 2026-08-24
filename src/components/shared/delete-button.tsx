"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ActionResult = { error?: string } | void | undefined;

export function DeleteButton({
  action,
  confirmMessage,
}: {
  action: () => Promise<ActionResult>;
  confirmMessage: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmMessage)) return;
    startTransition(async () => {
      const result = await action();
      if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button variant="ghost" size="icon" type="button" onClick={handleClick} disabled={pending}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}
