#!/usr/bin/env node
/**
 * Migrates bikretaBm admin panel into rangonaa under /admin
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const BIKRETA = path.join(ROOT, "..", "bikretaBm", "src");
const ADMIN_SRC = path.join(ROOT, "src", "admin");
const ADMIN_APP = path.join(ROOT, "src", "app", "admin");

const ADMIN_BASE = "/admin";

function copyDir(src, dest, exclude = []) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (exclude.includes(entry.name)) continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function walk(dir, cb) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, cb);
    else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) cb(p);
  }
}

function replaceImports(content) {
  return content.replace(/from "@\//g, 'from "@admin/').replace(/import "@\//g, 'import "@admin/');
}

const SKIP_ROUTE_PREFIX = [
  "/api/",
  "/_next/",
  "/assets/",
  "http://",
  "https://",
  "//",
];

function shouldPrefixRoute(route) {
  if (!route || route === "/") return true;
  if (route.startsWith(ADMIN_BASE)) return false;
  return !SKIP_ROUTE_PREFIX.some((s) => route.startsWith(s));
}

function prefixRoutePath(route) {
  if (!shouldPrefixRoute(route)) return route;
  if (route === "/") return ADMIN_BASE;
  const q = route.includes("?") ? route.indexOf("?") : -1;
  const hash = route.includes("#") ? route.indexOf("#") : -1;
  let cut = route.length;
  if (q >= 0) cut = Math.min(cut, q);
  if (hash >= 0) cut = Math.min(cut, hash);
  const base = route.slice(0, cut);
  const suffix = route.slice(cut);
  if (base === ADMIN_BASE) return route;
  const prefixed = base.startsWith("/") ? `${ADMIN_BASE}${base}` : `${ADMIN_BASE}/${base}`;
  return prefixed + suffix;
}

function prefixRoutesInContent(content) {
  // href="/path" or href={'/path'}
  content = content.replace(/href=\{?"(\/[^"']*?)"/g, (_, r) => `href="${prefixRoutePath(r)}"`);
  content = content.replace(/href=\{'(\/[^']*?)'\}/g, (_, r) => `href={'${prefixRoutePath(r)}'}`);

  // router.push/replace with string literals
  content = content.replace(/router\.(push|replace)\("(\/[^"]*?)"/g, (_, m, r) => `router.${m}("${prefixRoutePath(r)}"`);
  content = content.replace(/router\.(push|replace)\('(\/[^']*?)'/g, (_, m, r) => `router.${m}('${prefixRoutePath(r)}'`);

  // template literals: router.push(`/orders/...`)
  content = content.replace(/router\.(push|replace)\(`(\/[a-zA-Z0-9_\-/${}[\].]+)`/g, (_, m, r) => {
    if (r.startsWith(ADMIN_BASE)) return `router.${m}(\`${r}\``;
    return `router.${m}(\`${ADMIN_BASE}${r}\``;
  });

  // new URL("/path"
  content = content.replace(/new URL\("(\/[^"]*?)"/g, (_, r) => `new URL("${prefixRoutePath(r)}"`);

  // pathname checks like pathname === "/holiday-shift"
  content = content.replace(/pathname === "(\/[^"]*?)"/g, (_, r) => `pathname === "${prefixRoutePath(r)}"`);

  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  content = replaceImports(content);
  content = prefixRoutesInContent(content);
  fs.writeFileSync(filePath, content);
}

console.log("1. Copying admin source...");
if (fs.existsSync(ADMIN_SRC)) fs.rmSync(ADMIN_SRC, { recursive: true });
if (fs.existsSync(ADMIN_APP)) fs.rmSync(ADMIN_APP, { recursive: true });

const folders = [
  "@acl",
  "@config",
  "@interfaces",
  "@schema",
  "@services",
  "assets",
  "components",
  "context",
  "hooks",
  "layouts",
  "lib",
  "types",
  "utils",
];
for (const f of folders) {
  copyDir(path.join(BIKRETA, f), path.join(ADMIN_SRC, f));
}

console.log("2. Copying admin app routes...");
copyDir(path.join(BIKRETA, "app"), ADMIN_APP, ["layout.tsx", "globals.css"]);

console.log("3. Copying admin globals.css...");
const globalsSrc = path.join(BIKRETA, "app", "globals.css");
let globalsCss = fs.readFileSync(globalsSrc, "utf8");
// Remove tailwind v3 directives — rangonaa already loads tailwind v4 globally
globalsCss = globalsCss
  .replace(/@tailwind base;\n?/g, "")
  .replace(/@tailwind components;\n?/g, "")
  .replace(/@tailwind utilities;\n?/g, "");
fs.writeFileSync(path.join(ADMIN_SRC, "globals.css"), globalsCss);

console.log("4. Transforming imports and routes...");
walk(ADMIN_SRC, processFile);
walk(ADMIN_APP, processFile);

console.log("5. Creating admin path utility...");
const adminPathUtil = `export const ADMIN_BASE = "${ADMIN_BASE}";

export function adminPath(path = "/"): string {
  if (!path || path === "/") return ADMIN_BASE;
  const normalized = path.startsWith("/") ? path : \`/\${path}\`;
  if (normalized.startsWith(ADMIN_BASE)) return normalized;
  return \`\${ADMIN_BASE}\${normalized}\`;
}

export function stripAdminPrefix(pathname: string): string {
  const path = pathname.split("?")[0].split("#")[0];
  if (path === ADMIN_BASE || path === \`\${ADMIN_BASE}/\`) return "/";
  if (path.startsWith(\`\${ADMIN_BASE}/\`)) {
    return path.slice(ADMIN_BASE.length) || "/";
  }
  return path;
}

export function isAdminRoute(pathname: string): boolean {
  const path = pathname.split("?")[0].split("#")[0];
  return path === ADMIN_BASE || path.startsWith(\`\${ADMIN_BASE}/\`);
}
`;
fs.writeFileSync(path.join(ADMIN_SRC, "utils", "adminPath.ts"), adminPathUtil);

console.log("6. Patching routePermission for admin prefix...");
const routePermFile = path.join(ADMIN_SRC, "utils", "routePermission.ts");
let routePerm = fs.readFileSync(routePermFile, "utf8");
routePerm = routePerm.replace(
  'import { labelPermissionMap } from "@admin/@acl/Acl";',
  `import { labelPermissionMap } from "@admin/@acl/Acl";
import { stripAdminPrefix } from "@admin/utils/adminPath";`
);
routePerm = routePerm.replace(
  "export const normalizeRoutePath = (pathname: string) => {\n  const path = pathname.split(\"?\")[0].split(\"#\")[0];\n  if (!path || path === \"/\") return \"/\";\n  return path.endsWith(\"/\") ? path.slice(0, -1) : path;\n};",
  `export const normalizeRoutePath = (pathname: string) => {
  const raw = pathname.split("?")[0].split("#")[0];
  const path = stripAdminPrefix(raw);
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
};`
);
// Prefix open routes
routePerm = routePerm.replace(
  'export const AUTHENTICATED_OPEN_ROUTES = new Set([\n  "/profile",',
  `export const AUTHENTICATED_OPEN_ROUTES = new Set([\n  "${ADMIN_BASE}/profile",`
);
routePerm = routePerm.replace('"/create-order",', `"${ADMIN_BASE}/create-order",`);
routePerm = routePerm.replace('"/create-order/order-received",', `"${ADMIN_BASE}/create-order/order-received",`);
routePerm = routePerm.replace('"/assign-orders/view/"', `"${ADMIN_BASE}/assign-orders/view/"`);
routePerm = routePerm.replace('"/assign-orders/edit/"', `"${ADMIN_BASE}/assign-orders/edit/"`);
routePerm = routePerm.replace(
  'if (path === "/no-permission") return null;',
  `if (path === "/no-permission" || raw === "${ADMIN_BASE}/no-permission") return null;`
);
// Fix - need raw variable in getRouteRequiredPermissions
routePerm = routePerm.replace(
  "export const getRouteRequiredPermissions = (\n  pathname: string,\n): string[] | null => {\n  const path = normalizeRoutePath(pathname);",
  `export const getRouteRequiredPermissions = (
  pathname: string,
): string[] | null => {
  const raw = pathname.split("?")[0].split("#")[0];
  const path = normalizeRoutePath(pathname);`
);
fs.writeFileSync(routePermFile, routePerm);

console.log("7. Patching Sidebar for /admin prefix...");
const sidebarFile = path.join(ADMIN_SRC, "layouts", "Sidebar.tsx");
let sidebar = fs.readFileSync(sidebarFile, "utf8");
sidebar = sidebar.replace(
  `const { mainPath, subPath } = useMemo(() => {
    const seg = (pathname ?? "").split("/").filter(Boolean);
    return { mainPath: norm(seg[0]), subPath: norm(seg[1]) };
  }, [pathname]);`,
  `const { mainPath, subPath } = useMemo(() => {
    const seg = (pathname ?? "").split("/").filter(Boolean);
    const offset = seg[0] === "admin" ? 1 : 0;
    return { mainPath: norm(seg[offset]), subPath: norm(seg[offset + 1]) };
  }, [pathname]);`
);
fs.writeFileSync(sidebarFile, sidebar);

console.log("8. Patching path-name constants...");
const pathNameFile = path.join(ADMIN_SRC, "utils", "path-name.ts");
let pathNames = fs.readFileSync(pathNameFile, "utf8");
pathNames = `import { ADMIN_BASE } from "@admin/utils/adminPath";\n\n` + pathNames.replace(/^export /gm, "export ");
pathNames = pathNames.replace(/= "(\/[^"]+)"/g, (_, p) => {
  if (p.startsWith(ADMIN_BASE)) return `= "${p}"`;
  return `= "${ADMIN_BASE}${p}"`;
});
fs.writeFileSync(pathNameFile, pathNames);

console.log("9. Patching publicRoutes in data.ts...");
const dataFile = path.join(ADMIN_SRC, "components", "pages", "Utilities", "data.ts");
let data = fs.readFileSync(dataFile, "utf8");
data = data.replace(
  'export const publicRoutes = ["/", "/signup", "/verify"];',
  `export const publicRoutes = ["${ADMIN_BASE}", "${ADMIN_BASE}/signup", "${ADMIN_BASE}/verify"];`
);
fs.writeFileSync(dataFile, data);

console.log("Done! Admin migration files prepared.");
