import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/sso-callback(.*)", // Add this line
  "/api(.*)",
  "/products(.*)",
  "/categories(.*)",
  "/api",
  
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
