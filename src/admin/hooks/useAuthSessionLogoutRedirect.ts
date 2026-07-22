"use client";

import { useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { AUTH_SESSION_SYNC_KEY } from "@admin/utils/authSessionSync";
import {
  handleLoggedOutSession,
  isAuthenticatedSession,
  PUBLIC_AUTH_ROUTES,
} from "@admin/utils/authSessionLogout";
import { normalizeRoutePath } from "@admin/utils/routePermission";

const STORAGE_SYNC_KEYS = new Set([AUTH_SESSION_SYNC_KEY, "userPermissions"]);

export const useAuthSessionLogoutRedirect = () => {
  const pathname = usePathname();
  const { beginLogout, clearAuthData } = useGlobalContext();

  const redirectIfLoggedOut = useCallback(() => {
    if (typeof window === "undefined") return;

    const path = normalizeRoutePath(pathname || window.location.pathname);
    if (PUBLIC_AUTH_ROUTES.has(path) && !isAuthenticatedSession()) {
      clearAuthData();
      return;
    }

    handleLoggedOutSession(beginLogout, clearAuthData);
  }, [pathname, beginLogout, clearAuthData]);

  useEffect(() => {
    redirectIfLoggedOut();

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !STORAGE_SYNC_KEYS.has(event.key)) return;
      redirectIfLoggedOut();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        redirectIfLoggedOut();
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", redirectIfLoggedOut);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", redirectIfLoggedOut);
    };
  }, [redirectIfLoggedOut]);
};
