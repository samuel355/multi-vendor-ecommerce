import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/api(.*)",
  "/dashboard(.*)",
  "/sign-up(.*)",
  "/sign-in(.*)",
  "/vendors(.*)",
  "/products(.*)",
  "/categories(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

// "/",
// "/products(.*)",
// "/categories(.*)",
// "/vendors(.*)",
// "/api(.*)",
// "/sign-in(.*)",
// "/sign-up(.*)"
