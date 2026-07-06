import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/api/progress(.*)",
  "/api/tutor(.*)",
  "/api/hints(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  // In demo mode auth is bypassed — the API routes serve a demo user instead.
  if (process.env.DEMO_MODE === "true") return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
