import { prisma } from "./db";
import { getSession } from "./auth/session";

export type CurrentUser = {
  id: string;
  username: string;
  displayName: string | null;
};

/**
 * Fetch the currently authenticated user with display fields.
 * Returns `null` if no session — caller decides whether to redirect.
 *
 * Kept separate from `getSession` so the auth surface stays minimal: the JWT
 * claims hold only `sub + username`; richer fields (`displayName`) are fetched
 * fresh from the DB on each render. Cheap query, indexed by primary key.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, username: true, displayName: true },
  });
  return user;
}

/**
 * Public-facing label for a user. Falls back to a Title-cased username when no
 * `displayName` has been set, so personalised greetings always read naturally.
 */
export function userLabel(user: Pick<CurrentUser, "username" | "displayName">): string {
  if (user.displayName && user.displayName.trim().length > 0) return user.displayName;
  const u = user.username;
  return u.charAt(0).toUpperCase() + u.slice(1);
}
