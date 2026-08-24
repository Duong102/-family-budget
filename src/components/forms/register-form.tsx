"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createHouseholdAction, joinHouseholdAction } from "@/app/(auth)/register/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RegisterForm() {
  const [createState, createAction, createPending] = useActionState(createHouseholdAction, undefined);
  const [joinState, joinAction, joinPending] = useActionState(joinHouseholdAction, undefined);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">Đăng ký</CardTitle>
        <CardDescription>Tạo hộ gia đình mới hoặc tham gia hộ đã có</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="create">
          <TabsList className="w-full">
            <TabsTrigger value="create" className="flex-1">Tạo hộ gia đình mới</TabsTrigger>
            <TabsTrigger value="join" className="flex-1">Tham gia hộ gia đình</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <form action={createAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="householdName">Tên hộ gia đình</Label>
                <Input id="householdName" name="householdName" required placeholder="Gia đình A" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-name">Họ tên của bạn</Label>
                <Input id="create-name" name="name" required autoComplete="name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-email">Email</Label>
                <Input id="create-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="create-password">Mật khẩu</Label>
                <Input
                  id="create-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {createState?.error && (
                <p className="text-sm text-destructive">{createState.error}</p>
              )}
              <Button type="submit" disabled={createPending} className="mt-2">
                {createPending ? "Đang tạo..." : "Tạo hộ gia đình"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="join">
            <form action={joinAction} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="inviteCode">Mã mời</Label>
                <Input
                  id="inviteCode"
                  name="inviteCode"
                  required
                  placeholder="VD: AB12CD34"
                  className="uppercase"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="join-name">Họ tên của bạn</Label>
                <Input id="join-name" name="name" required autoComplete="name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="join-email">Email</Label>
                <Input id="join-email" name="email" type="email" required autoComplete="email" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="join-password">Mật khẩu</Label>
                <Input
                  id="join-password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              {joinState?.error && <p className="text-sm text-destructive">{joinState.error}</p>}
              <Button type="submit" disabled={joinPending} className="mt-2">
                {joinPending ? "Đang tham gia..." : "Tham gia hộ gia đình"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
