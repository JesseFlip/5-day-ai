/**
 * Clerk is optional. It's enabled only when a publishable key is configured
 * (inlined at build time, so this is safe to read on client and server).
 * Without it, each browser gets an anonymous ID cookie instead of an account.
 */
export const CLERK_ENABLED = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export const ANON_COOKIE = "ap_uid";
