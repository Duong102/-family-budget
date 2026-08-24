import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteCodeCopy } from "@/components/settings/invite-code-copy";

export default async function HouseholdSettingsPage() {
  const user = await requireUser();
  const household = await prisma.household.findUniqueOrThrow({
    where: { id: user.householdId },
    include: { users: { orderBy: { createdAt: "asc" } } },
  });

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Hộ gia đình</h1>
        <p className="text-sm text-muted-foreground">{household.name}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mã mời</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2 text-sm text-muted-foreground">
            Chia sẻ mã này để mời thành viên khác tham gia hộ gia đình.
          </p>
          <InviteCodeCopy code={household.inviteCode} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Thành viên ({household.users.length})</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {household.users.map((member) => (
            <div key={member.id} className="flex items-center justify-between py-2 text-sm">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-xs text-muted-foreground">{member.email}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{member.role === "OWNER" ? "Chủ hộ" : "Thành viên"}</p>
                <p>Tham gia {formatDate(member.createdAt)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
