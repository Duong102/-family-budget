import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const household = await prisma.household.findUnique({ where: { id: user.householdId } });

  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <AppSidebar userName={user.name ?? ""} householdName={household?.name ?? ""} />
      <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">{children}</main>
    </div>
  );
}
