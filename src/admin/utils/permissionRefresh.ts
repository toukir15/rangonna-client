export const PERMISSIONS_REFRESH_EVENT = "user-permissions-updated";

export const dispatchPermissionsRefresh = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PERMISSIONS_REFRESH_EVENT));
};
