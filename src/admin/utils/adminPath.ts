export const ADMIN_BASE = "/admin";

export const ADMIN_LOGIN_ROUTE = ADMIN_BASE;

export const ADMIN_PUBLIC_ROUTES = new Set([
  ADMIN_BASE,
  `${ADMIN_BASE}/signup`,
  `${ADMIN_BASE}/verify`,
]);

export function isAdminPublicRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];
  if (path === ADMIN_BASE || path === `${ADMIN_BASE}/`) return true;
  return ADMIN_PUBLIC_ROUTES.has(path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path);
}

export function adminPath(path = "/"): string {
  if (!path || path === "/") return ADMIN_BASE;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith(ADMIN_BASE)) return normalized;
  return `${ADMIN_BASE}${normalized}`;
}

export function stripAdminPrefix(pathname: string): string {
  const path = pathname.split("?")[0].split("#")[0];
  if (path === ADMIN_BASE || path === `${ADMIN_BASE}/`) return "/";
  if (path.startsWith(`${ADMIN_BASE}/`)) {
    return path.slice(ADMIN_BASE.length) || "/";
  }
  return path;
}

export function isAdminRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];
  return path === ADMIN_BASE || path.startsWith(`${ADMIN_BASE}/`);
}
