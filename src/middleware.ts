import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If user is not signed in and the current path is not /signin or /signup,
    // redirect the user to /signin
    if (!session && !["/signin", "/signup"].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // If user is signed in and the current path is /signin or /signup,
    // redirect the user to /
    if (session && ["/signin", "/signup"].includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    return res;
  } catch (error) {
    // If there's an error, allow the request to continue
    // This prevents the middleware from blocking the application
    console.error("Middleware error:", error);
    return res;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
