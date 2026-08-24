import type { DefaultSession } from "next-auth";

type AppRole = "OWNER" | "MEMBER";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      householdId: string;
      role: AppRole;
    } & DefaultSession["user"];
  }

  interface User {
    householdId: string;
    role: AppRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    householdId: string;
    role: AppRole;
  }
}
