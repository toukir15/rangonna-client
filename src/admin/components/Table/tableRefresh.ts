export const TABLE_REFRESH_REGISTER_EVENT = "admin-table-refresh-register";

type RefreshHandler = () => void;

const refreshHandlers = new Map<string, RefreshHandler>();

export function registerTableRefresh(
  pathname: string,
  handler: RefreshHandler,
) {
  if (!pathname) return;
  refreshHandlers.set(pathname, handler);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(TABLE_REFRESH_REGISTER_EVENT, { detail: { pathname } }),
    );
  }
}

export function unregisterTableRefresh(pathname: string, handler: RefreshHandler) {
  if (!pathname) return;
  if (refreshHandlers.get(pathname) === handler) {
    refreshHandlers.delete(pathname);
  }
}

export function triggerTableRefresh(pathname: string) {
  refreshHandlers.get(pathname)?.();
}

export function hasTableRefresh(pathname: string) {
  return refreshHandlers.has(pathname);
}
