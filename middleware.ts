import withAuth from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;
      // Allow auth-related routes, homepage, and reset-password with token
      if (
        pathname.startsWith("/api/auth") ||
        pathname === "/" ||
        pathname === "/auth/signin" ||
        pathname === "/auth/register" ||
        pathname.startsWith("/auth/forgot-password") ||
        // Allow both formats of reset password URLs
        pathname.startsWith("/auth/reset-password")
      ) {
        return true;
      }
      return !!token;
    },
  },
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
