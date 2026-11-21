"use client";

import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { CLERK_ENABLED } from "@/lib/auth-config";

type AuthState = { isLoaded: boolean; isSignedIn: boolean };

function useClerkAuthState(): AuthState {
  const { isLoaded, isSignedIn } = useUser();
  return { isLoaded, isSignedIn: !!isSignedIn };
}

function useAnonymousAuthState(): AuthState {
  // Anonymous visitors are always "signed in" via their browser ID cookie.
  return { isLoaded: true, isSignedIn: true };
}

// Chosen once at module load (build-time constant), so hook order is stable.
export const useAuthState = CLERK_ENABLED ? useClerkAuthState : useAnonymousAuthState;

export function AuthUserButton() {
  if (!CLERK_ENABLED) return null;
  return <UserButton appearance={{ elements: { avatarBox: "h-7 w-7" } }} />;
}

export function AuthSignInButton({ children }: { children: React.ReactNode }) {
  if (!CLERK_ENABLED) return <>{children}</>;
  return <SignInButton mode="modal">{children}</SignInButton>;
}
