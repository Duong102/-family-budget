"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";

export function ExportReportPdfButton({
  targetId,
  month,
  year,
}: {
  targetId: string;
  month: number;
  year: number;
}) {
  const [pending, setPending] = useState(false);

  async function handleExport() {
    const element = document.getElementById(targetId);
    if (!element) return;

    setPending(true);
    try {
      const canvas = await html2canvas(element, { scale: 1.5, backgroundColor: "#f9f9f7" });
      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const pdf = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`bao-cao-${year}-${String(month).padStart(2, "0")}.pdf`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="outline" type="button" onClick={handleExport} disabled={pending}>
      <FileDown className="size-4" />
      {pending ? "Đang xuất..." : "Xuất PDF"}
    </Button>
  );
}
