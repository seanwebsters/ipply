import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast edge gate: private areas require a session cookie. Role checks and
 * session validity are enforced server-side in each area's layout and in
 * every server action.
 */
export function middleware(req: NextRequest) {
  if (!req.cookies.get("ipply_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/signin";
    url.search = `?next=${encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*", "/partner/:path*", "/admin/:path*"] };
