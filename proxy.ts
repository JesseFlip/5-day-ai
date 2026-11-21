import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { CLERK_ENABLED, ANON_COOKIE } from "@/lib/auth-config";

const isProtectedRoute = createRouteMatcher([
  "/api/progress(.*)",
  "/api/tutor(.*)",
  "/api/hints(.*)",
]);

const clerkHandler = CLERK_ENABLED
  ? clerkMiddleware(async (auth, req) => {
      // In demo mode auth is bypassed — the API routes serve a demo user instead.
      if (process.env.DEMO_MODE === "true") return;
      if (isProtectedRoute(req)) {
        await auth.protect();
      }
    })
  : null;

/** Without Clerk: give each browser a stable anonymous ID cookie. */
function anonymousIdentity(req: NextRequest) {
  if (req.cookies.get(ANON_COOKIE)) return NextResponse.next();

  const id = crypto.randomUUID();
  // Make the new cookie visible to this same request's route handler.
  req.cookies.set(ANON_COOKIE, id);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set(ANON_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export default function proxy(req: NextRequest, event: NextFetchEvent) {
  return clerkHandler ? clerkHandler(req, event) : anonymousIdentity(req);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
