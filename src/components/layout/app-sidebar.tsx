"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
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
  Menu,
} from "lucide-react";
import { logoutAction } from "@/app/(app)/logout-action";
import { Button } from "@/components/ui/button";
import { ThemeToggleButton } from "@/components/layout/theme-toggle-button";
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

function SidebarNav({
  userName,
  householdName,
  onNavigate,
}: {
  userName: string;
  householdName: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
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
              onClick={onNavigate}
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
        <div className="flex items-center justify-between px-3">
          <p className="truncate text-sm text-muted-foreground">{userName}</p>
          <ThemeToggleButton />
        </div>
        <form action={logoutAction}>
          <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground" type="submit">
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </>
  );
}

export function AppSidebar({
  userName,
  householdName,
}: {
  userName: string;
  householdName: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
        <p className="truncate font-semibold">{householdName}</p>
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
          <DialogPrimitive.Trigger asChild>
            <Button variant="ghost" size="icon" aria-label="Mở menu">
              <Menu className="size-5" />
            </Button>
          </DialogPrimitive.Trigger>
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/30 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
            <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col border-r bg-background shadow-lg duration-150 data-open:animate-in data-open:slide-in-from-left data-closed:animate-out data-closed:slide-out-to-left">
              <DialogPrimitive.Title className="sr-only">Menu điều hướng</DialogPrimitive.Title>
              <SidebarNav userName={userName} householdName={householdName} onNavigate={() => setOpen(false)} />
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
      </div>

      <aside className="hidden w-64 shrink-0 flex-col border-r bg-background md:flex">
        <SidebarNav userName={userName} householdName={householdName} />
      </aside>
    </>
  );
}
