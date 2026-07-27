"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { AUTH_SESSION_SYNC_KEY } from "@admin/utils/authSessionSync";

const PERMISSIONS_CACHE_KEY = "userPermissions";

const STORAGE_SYNC_KEYS = new Set([
  AUTH_SESSION_SYNC_KEY,
  PERMISSIONS_CACHE_KEY,
]);

export { notifyAuthSessionChanged } from "@admin/utils/authSessionSync";

export const useAuthSessionRedirect = (
  redirectTo = "/admin/dashboard/all",
  enabled = true,
) => {
  const router = useRouter();
  const { refreshAuthUser, bootstrapPermissions, handleGetPermission } =
    useGlobalContext();

  const redirectIfAuthenticated = useCallback(async () => {
    if (!enabled) return;

    const authToken = Cookies.get("authToken");
    const refreshToken = Cookies.get("refreshToken");
    if (!authToken && !refreshToken) return;

    refreshAuthUser();

    let hadCachedPermissions = false;

    try {
      const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          bootstrapPermissions(parsed);
          hadCachedPermissions = true;
        }
      }
    } catch {
      // Ignore invalid permission cache.
    }

    await handleGetPermission(!hadCachedPermissions);
    router.replace(redirectTo);
  }, [
    enabled,
    redirectTo,
    refreshAuthUser,
    bootstrapPermissions,
    handleGetPermission,
    router,
  ]);

  useEffect(() => {
    redirectIfAuthenticated();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !STORAGE_SYNC_KEYS.has(event.key)) return;
      redirectIfAuthenticated();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        redirectIfAuthenticated();
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", redirectIfAuthenticated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", redirectIfAuthenticated);
    };
  }, [redirectIfAuthenticated]);
};
