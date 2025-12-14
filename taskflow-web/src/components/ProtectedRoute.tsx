"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session && status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router, session]);

  if (status === "loading") {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return <>{children}</>;
}
