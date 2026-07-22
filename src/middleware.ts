import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { publicRoutes } from "@admin/components/pages/Utilities/data";
import { ADMIN_BASE } from "@admin/utils/adminPath";

const LOGIN_ROUTE = ADMIN_BASE;

const alwaysAllowedRoutes = [
  `${ADMIN_BASE}/create-order`,
  `${ADMIN_BASE}/profile`,
  `${ADMIN_BASE}/create-order/order-received`,
];

const isAlwaysAllowed = (pathname: string) =>
  alwaysAllowedRoutes.includes(pathname) ||
  pathname.startsWith(`${ADMIN_BASE}/assign-orders/view/`) ||
  pathname.startsWith(`${ADMIN_BASE}/assign-orders/edit/`);

const isStaticFile = (pathname: string) =>
  /\.(ico|svg|png|jpg|jpeg|gif|webp|css|js|map|woff|woff2|ttf)$/.test(pathname);

const normalizePath = (pathname: string) => {
  let p = pathname.toLowerCase();
  if (p !== ADMIN_BASE && p.endsWith("/")) p = p.slice(0, -1);
  return p;
};

const normalizeRoutes = (routes: string[]) =>
  routes.map((route) => normalizePath(route));

const clearAuthCookies = (response: NextResponse, request: NextRequest) => {
  const secure = request.nextUrl.protocol === "https:";
  const cookieOptions = {
    path: "/",
    expires: new Date(0),
    secure,
    sameSite: "lax" as const,
  };

  response.cookies.set("authToken", "", cookieOptions);
  response.cookies.set("refreshToken", "", cookieOptions);
};

function handleAdminAuth(request: NextRequest): NextResponse | null {
  const url = request.nextUrl.clone();
  const pathname = normalizePath(url.pathname);

  const normalizedPublicRoutes = normalizeRoutes(publicRoutes);
  const isPublic = normalizedPublicRoutes.includes(pathname);

  if (pathname === LOGIN_ROUTE && url.searchParams.get("logout") === "1") {
    const response = NextResponse.next();
    clearAuthCookies(response, request);
    return response;
  }

  if (isAlwaysAllowed(pathname)) {
    return NextResponse.next();
  }

  if (pathname === `${ADMIN_BASE}/no-permission`) {
    return NextResponse.next();
  }

  let refreshToken = request.cookies.get("refreshToken")?.value || "";
  refreshToken = refreshToken.trim().replace(/^["']|["']$/g, "");

  const hasRefreshToken = Boolean(refreshToken);

  if (!hasRefreshToken && !isPublic) {
    const loginUrl = new URL(LOGIN_ROUTE, request.url);
    loginUrl.searchParams.set("logout", "1");
    loginUrl.searchParams.set("_t", String(Date.now()));

    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response, request);
    return response;
  }

  // /admin login page — auto redirect off; login success-এ client redirect করবে
  return NextResponse.next();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/api/") ||
    isStaticFile(pathname)
  ) {
    return NextResponse.next();
  }

  // Admin panel auth
  if (pathname === ADMIN_BASE || pathname.startsWith(`${ADMIN_BASE}/`)) {
    return handleAdminAuth(request);
  }

  // Storefront auth (existing)
  const accessToken = request.cookies.get("accessToken")?.value;
  const privateRoutes = ["/review"];
  const isPrivateRoute = privateRoutes.some((r) => pathname.startsWith(r));

  if (isPrivateRoute && !accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  return res;
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/my-account/:path*",
    "/review/:path*",
  ],
};
