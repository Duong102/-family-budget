"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import ExcelJS from "exceljs";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

type ExportTransaction = {
  date: Date | string;
  type: string;
  categoryOrToWallet: string | null;
  walletName: string;
  note: string | null;
  userName: string;
  amount: number;
};

export function ExportTransactionsButton({ transactions }: { transactions: ExportTransaction[] }) {
  const [pending, setPending] = useState(false);

  async function handleExport() {
    setPending(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Giao dịch");

      sheet.columns = [
        { header: "Ngày", key: "date", width: 14 },
        { header: "Loại", key: "type", width: 14 },
        { header: "Danh mục / Ví nhận", key: "category", width: 24 },
        { header: "Ví", key: "wallet", width: 18 },
        { header: "Ghi chú", key: "note", width: 28 },
        { header: "Người ghi", key: "user", width: 16 },
        { header: "Số tiền (VNĐ)", key: "amount", width: 16 },
      ];
      sheet.getRow(1).font = { bold: true };

      for (const tx of transactions) {
        sheet.addRow({
          date: formatDate(tx.date),
          type: TRANSACTION_TYPE_LABELS[tx.type as keyof typeof TRANSACTION_TYPE_LABELS] ?? tx.type,
          category: tx.categoryOrToWallet ?? "",
          wallet: tx.walletName,
          note: tx.note ?? "",
          user: tx.userName,
          amount: tx.amount,
        });
      }
      sheet.getColumn("amount").numFmt = "#,##0";

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `giao-dich-${new Date().toISOString().slice(0, 10)}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" type="button" onClick={handleExport} disabled={pending}>
      <FileDown className="size-4" />
      {pending ? "Đang xuất..." : "Xuất Excel"}
    </Button>
  );
}
