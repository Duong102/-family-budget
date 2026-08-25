import { NextRequest, NextResponse } from "next/server";
import { generateDueRecurringTransactions } from "@/lib/recurring";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const created = await generateDueRecurringTransactions();

  return NextResponse.json({ created });
}
