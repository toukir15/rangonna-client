import { labelPermissionMap } from "@admin/@acl/Acl";
import { stripAdminPrefix } from "@admin/utils/adminPath";
import { routePermissionMap, sideBarItems } from "@admin/components/pages/Utilities/data";

const norm = (value?: string) =>
  (value ?? "")
    .toLowerCase()
    .trim()
    .replace(/^\//, "")
    .replace(/-/g, "")
    .replace(/\s+/g, "");

const getRoute = (item: { href?: string; path?: string }) =>
  item?.href || item?.path || "";

const getMainKey = (item: { href?: string; path?: string; label?: string }) => {
  const seg = getRoute(item).split("/").filter(Boolean);
  const offset = seg[0] === "admin" ? 1 : 0;
  return norm(seg[offset]) || norm(item?.label);
};

const getSubKey = (item: { href?: string; path?: string; label?: string }) => {
  const seg = getRoute(item).split("/").filter(Boolean);
  const offset = seg[0] === "admin" ? 1 : 0;
  return norm(seg[offset + 1]) || norm(item?.label);
};

export const normalizeRoutePath = (pathname: string) => {
  const raw = pathname.split("?")[0].split("#")[0];
  const path = stripAdminPrefix(raw);
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};

/** Permission map ছাড়া — logged-in user access পাবে (profile, create-order, etc.) */
export const AUTHENTICATED_OPEN_ROUTES = new Set([
  "/profile",
  "/create-order",
  "/create-order/order-received",
]);

const AUTHENTICATED_OPEN_PREFIXES = [
  "/assign-orders/view/",
  "/assign-orders/edit/",
];

export const isAuthenticatedOpenRoute = (pathname: string): boolean => {
  const path = normalizeRoutePath(pathname);

  if (AUTHENTICATED_OPEN_ROUTES.has(path)) return true;

  return AUTHENTICATED_OPEN_PREFIXES.some((prefix) => path.startsWith(prefix));
};

const DYNAMIC_ROUTE_PATTERNS: { pattern: RegExp; permissions: string[] }[] = [
  { pattern: /^\/orders\/view\//, permissions: ["order_view"] },
  { pattern: /^\/orders\/edit\//, permissions: ["order_edit"] },
  { pattern: /^\/assign-orders\/view\//, permissions: ["order_assignment_view"] },
  { pattern: /^\/assign-orders\/edit\//, permissions: ["order_assignment_view"] },
  { pattern: /^\/report-issue\/view\//, permissions: ["report_issue_view"] },
  { pattern: /^\/orders\/wholesale-orders\/view\//, permissions: ["order_wholesale_view"] },
  { pattern: /^\/orders\/wholesale-orders\/edit\//, permissions: ["order_wholesale_edit"] },
  { pattern: /^\/product\/products\/edit\//, permissions: ["product_edit"] },
  { pattern: /^\/product\/products\/view\//, permissions: ["product_view"] },
  { pattern: /^\/pages\/edit\//, permissions: ["campaign_page_edit"] },
  { pattern: /^\/pages\/add-page/, permissions: ["campaign_page_create"] },
  { pattern: /^\/team\/member\//, permissions: ["team_user_view"] },
  { pattern: /^\/team\/permission\//, permissions: ["team_permission_view"] },
];

const buildPathPermissionMap = () => {
  const map = new Map<string, string[]>();

  const register = (route: string, permissions?: string[]) => {
    if (!route || !permissions?.length) return;
    map.set(normalizeRoutePath(route), permissions);
  };

  Object.entries(routePermissionMap).forEach(([route, permissions]) => {
    register(route, Array.isArray(permissions) ? permissions : [permissions]);
  });

  sideBarItems.forEach((item) => {
    const mainKey = getMainKey(item);
    const mainRoute = getRoute(item);

    register(mainRoute, labelPermissionMap[mainKey]);

    (item.submenu ?? []).forEach((sub) => {
      const subRoute = getRoute(sub);
      const permissionKey = `${mainKey}/${getSubKey(sub)}`;
      register(subRoute, labelPermissionMap[permissionKey]);
    });
  });

  return map;
};

const PATH_PERMISSION_MAP = buildPathPermissionMap();
const PATH_PERMISSION_ENTRIES = Array.from(PATH_PERMISSION_MAP.entries()).sort(
  (a, b) => b[0].length - a[0].length,
);

export const getRouteRequiredPermissions = (
  pathname: string,
): string[] | null => {
  const raw = pathname.split("?")[0].split("#")[0];
  const path = normalizeRoutePath(pathname);

  if (path === "/no-permission" || raw === "/admin/no-permission") return null;

  const exact = PATH_PERMISSION_MAP.get(path);
  if (exact?.length) return exact;

  for (const { pattern, permissions } of DYNAMIC_ROUTE_PATTERNS) {
    if (pattern.test(path)) return permissions;
  }

  for (const [route, permissions] of PATH_PERMISSION_ENTRIES) {
    if (path === route || path.startsWith(`${route}/`)) {
      return permissions;
    }
  }

  const segments = path.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const key = `${norm(segments[0])}/${norm(segments[1])}`;
    if (labelPermissionMap[key]?.length) return labelPermissionMap[key];
  }

  if (segments.length >= 1) {
    const key = norm(segments[0]);
    if (labelPermissionMap[key]?.length) return labelPermissionMap[key];
  }

  return null;
};

export const canAccessRoute = (
  pathname: string,
  permissions: string[],
): boolean => {
  const path = normalizeRoutePath(pathname);

  if (isAuthenticatedOpenRoute(path)) return true;

  const required = getRouteRequiredPermissions(pathname);

  // Permission map না থাকলে block করব না
  if (!required?.length) return true;

  return required.some((permission) => permissions.includes(permission));
};
