import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;
    const token = req.nextauth.token;

    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (
      pathname.startsWith("/landlord") &&
      token?.role !== "LANDLORD" &&
      token?.role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/tenant") && !token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/messages") && !token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/landlord/:path*",
    "/tenant/:path*",
    "/messages/:path*",
  ],
};
