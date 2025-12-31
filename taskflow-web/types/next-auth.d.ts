import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultUser {
    user: {
      id: string;
      role: "employee" | "manager" | "team_lead" | "admin";
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    role: "employee" | "manager" | "team_lead" | "admin";
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string;
    role: "employee" | "manager" | "team_lead" | "admin";
  }
}
