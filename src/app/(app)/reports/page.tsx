import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/session";
import { getMonthlyTrend, getCategoryExpenseBreakdown, getExpenseByPaymentMethod } from "@/lib/queries";
import { MONTH_NAMES_VI } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendChart } from "@/components/reports/trend-chart";
import { CategoryPieChart } from "@/components/reports/category-pie-chart";
import { ExportReportPdfButton } from "@/components/reports/export-report-pdf-button";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const now = new Date();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const year = params.year ? Number(params.year) : now.getFullYear();

  const prevDate = new Date(year, month - 2, 1);
  const nextDate = new Date(year, month, 1);

  const [trend, breakdown, paymentMethodBreakdown] = await Promise.all([
    getMonthlyTrend(user.householdId, 6),
    getCategoryExpenseBreakdown(user.householdId, year, month),
    getExpenseByPaymentMethod(user.householdId, year, month),
  ]);

  const pieData = breakdown.map((b) => ({ name: b.category.name, amount: b.amount }));
  const paymentMethodData = paymentMethodBreakdown.filter((p) => p.amount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Báo cáo</h1>
          <p className="text-sm text-muted-foreground">Thống kê thu chi của hộ gia đình</p>
        </div>
        <ExportReportPdfButton targetId="report-printable" month={month} year={year} />
      </div>

      <div id="report-printable" className="flex flex-col gap-6 bg-background">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Xu hướng thu chi 6 tháng gần nhất</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendChart data={trend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Tỷ trọng chi theo danh mục</CardTitle>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/reports?month=${prevDate.getMonth() + 1}&year=${prevDate.getFullYear()}`}>
                  <ChevronLeft className="size-4" />
                </Link>
              </Button>
              <span className="text-sm font-medium">
                {MONTH_NAMES_VI[month - 1]} / {year}
              </span>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/reports?month=${nextDate.getMonth() + 1}&year=${nextDate.getFullYear()}`}>
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={pieData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi theo hình thức thanh toán</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={paymentMethodData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
