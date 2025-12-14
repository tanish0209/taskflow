import { getServerSession } from "next-auth";
import { Session } from "next-auth";
import { authOptions } from "./authOptions";

export async function requireRole(allowedRoles: string[]) {
  const session = await getServerSession(authOptions);

  const typedSession = session as
    | (Session & { user: { id: string; role: string } })
    | null;

  if (!typedSession?.user) {
    throw new Error("Unauthorized!");
  }

  if (!allowedRoles.includes(typedSession.user.role)) {
    throw new Error("Forbidden");
  }

  return typedSession;
}
