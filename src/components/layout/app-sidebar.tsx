"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Repeat,
  Wallet,
  Tags,
  PiggyBank,
  Target,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { logoutAction } from "@/app/(app)/logout-action";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/transactions", label: "Giao dịch", icon: ArrowLeftRight },
  { href: "/recurring", label: "Giao dịch định kỳ", icon: Repeat },
  { href: "/wallets", label: "Ví", icon: Wallet },
  { href: "/categories", label: "Danh mục", icon: Tags },
  { href: "/budgets", label: "Ngân sách", icon: PiggyBank },
  { href: "/goals", label: "Mục tiêu tiết kiệm", icon: Target },
  { href: "/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/settings/household", label: "Hộ gia đình", icon: Settings },
];

export function AppSidebar({
  userName,
  householdName,
}: {
  userName: string;
  householdName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-background">
      <div className="border-b px-4 py-4">
        <p className="text-sm text-muted-foreground">Hộ gia đình</p>
        <p className="truncate font-semibold">{householdName}</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <p className="truncate px-3 text-sm text-muted-foreground">{userName}</p>
        <form action={logoutAction}>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" type="submit">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </aside>
  );
}
