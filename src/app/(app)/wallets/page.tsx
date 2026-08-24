import { requireUser } from "@/lib/session";
import { getWalletsWithBalance } from "@/lib/queries";
import { formatCurrency } from "@/lib/format";
import { WALLET_TYPE_LABELS } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WalletFormDialog } from "@/components/wallets/wallet-form-dialog";
import { WalletDeleteButton } from "@/app/(app)/wallets/wallet-delete-button";

export default async function WalletsPage() {
  const user = await requireUser();
  const wallets = await getWalletsWithBalance(user.householdId);
  const total = wallets.reduce((sum, w) => sum + w.balance, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ví / Tài khoản</h1>
          <p className="text-sm text-muted-foreground">
            Tổng số dư: <span className="font-medium text-foreground">{formatCurrency(total)}</span>
          </p>
        </div>
        <WalletFormDialog />
      </div>

      {wallets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Chưa có ví nào. Hãy thêm ví đầu tiên.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wallets.map((wallet) => (
            <Card key={wallet.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{wallet.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{WALLET_TYPE_LABELS[wallet.type]}</p>
                </div>
                <div className="flex gap-1">
                  <WalletFormDialog wallet={wallet} />
                  <WalletDeleteButton id={wallet.id} />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{formatCurrency(wallet.balance)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
