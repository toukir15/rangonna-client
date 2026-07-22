import Cookies from "js-cookie";
import {
  ADMIN_LOGIN_ROUTE,
  isAdminPublicRoute,
  stripAdminPrefix,
} from "@admin/utils/adminPath";

/** Paths after stripping /admin prefix — used with normalizeRoutePath */
export const PUBLIC_AUTH_ROUTES = new Set(["/", "/signup", "/verify"]);

export const isAuthenticatedSession = (): boolean => {
  return Boolean(Cookies.get("authToken") || Cookies.get("refreshToken"));
};

export const handleLoggedOutSession = (
  beginLogout: () => void,
  clearAuthData: () => void,
): boolean => {
  if (typeof window === "undefined") return false;
  if (isAuthenticatedSession()) return false;

  const pathname = window.location.pathname;

  if (isAdminPublicRoute(pathname)) {
    clearAuthData();
    return false;
  }

  const normalized = stripAdminPrefix(pathname.split("?")[0].split("#")[0]);
  if (PUBLIC_AUTH_ROUTES.has(normalized)) {
    clearAuthData();
    return false;
  }

  beginLogout();
  window.location.replace(`${ADMIN_LOGIN_ROUTE}?logout=1`);
  return true;
};
