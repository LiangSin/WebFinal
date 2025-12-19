import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - assets (public assets)
     * - public (public folder if served directly, though usually mapped to root)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|assets).*)",
  ],
};

