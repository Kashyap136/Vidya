import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth/config";

const protectedRoutes = ["/dashboard", "/syllabi", "/study-plan", "/quiz", "/profile"];

const authRoutes = ["/auth/login", "/auth/register", "/auth/error"];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isProtectedRoute = protectedRoutes.some((route) =>
    path.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => path.startsWith(route));

  const session = await auth();

  if (isProtectedRoute && !session?.user?.id) {
    const loginUrl = new URL("/auth/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && session?.user?.id) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
