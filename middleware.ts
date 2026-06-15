import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/landlord") && token?.role !== "LANDLORD" && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, req.url));
    }

    if (pathname.startsWith("/tenant") && !token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, req.url));
    }

    if (pathname.startsWith("/messages") && !token) {
      return NextResponse.redirect(new URL("/login?callbackUrl=" + pathname, req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;
        if (
          pathname.startsWith("/_next") ||
          pathname.startsWith("/api/auth") ||
          pathname === "/login" ||
          pathname === "/register" ||
          pathname === "/" ||
          pathname.startsWith("/properties") ||
          pathname.startsWith("/images") ||
          pathname === "/favicon.ico"
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
