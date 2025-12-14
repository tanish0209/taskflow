"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode, createContext, useContext } from "react";
import { Session } from "next-auth";

interface AuthContextType {
  session: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  return { session, status };
}
