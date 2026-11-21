import "server-only";
import { cookies } from "next/headers";
import { CLERK_ENABLED, ANON_COOKIE } from "@/lib/auth-config";
import { DEMO_MODE, DEMO_USER_ID } from "@/lib/demo";

const ANON_ID = /^[0-9a-f-]{36}$/i;

/**
 * Resolve the current user's ID:
 * - demo mode → shared demo user
 * - Clerk configured → Clerk user (null if signed out)
 * - otherwise → anonymous per-browser ID set by proxy.ts
 */
export async function getUserId(): Promise<string | null> {
  if (DEMO_MODE) return DEMO_USER_ID;
  if (CLERK_ENABLED) {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return userId;
  }
  const id = (await cookies()).get(ANON_COOKIE)?.value;
  return id && ANON_ID.test(id) ? `anon_${id}` : null;
}
