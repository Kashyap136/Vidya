import { auth } from "@/auth/config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth?.user;

  const protectedPaths = ["/dashboard"];
  const authPaths = ["/auth/login", "/auth/register", "/auth/error"];

  const needsAuth = protectedPaths.some((p) => pathname.startsWith(p));

  if (needsAuth && !isAuthenticated) {
    const url = new URL("/auth/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (authPaths.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
