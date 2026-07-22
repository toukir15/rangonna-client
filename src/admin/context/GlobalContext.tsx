"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useLayoutEffect,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { usePathname } from "next/navigation";
import useDarkMode from "@admin/utils/useDarkMode";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { ToastService } from "@admin/utils/toastr.service";
import {
  allPaymentMethodOptions,
  allSourceOptions,
} from "@admin/components/pages/Utilities/paymentData";
import { SelectOption } from "@admin/@interfaces/orders/order.interface";
import { NoticeService } from "@admin/@services/apis/Notice/Notice.service";
import { NoticeItem } from "@admin/components/pages/Notice/NoticeClient";
import NoticeDetails from "@admin/components/pages/Notice/NoticeDetails";
import AssignPresenceKeeper from "@admin/components/AssignPresenceKeeper/AssignPresenceKeeper";
import { PERMISSIONS_REFRESH_EVENT } from "@admin/utils/permissionRefresh";
import {
  AUTH_SESSION_SYNC_KEY,
  notifyAuthSessionChanged,
} from "@admin/utils/authSessionSync";
import { canAccessRoute } from "@admin/utils/routePermission";
import { stripAdminPrefix } from "@admin/utils/adminPath";
import { handleLoggedOutSession } from "@admin/utils/authSessionLogout";
import { useAuthSessionLogoutRedirect } from "@admin/hooks/useAuthSessionLogoutRedirect";
import { ENV } from "@admin/@config/ENV.config";

interface IUser {
  id: string;
  name: string;
  email: string;
  warehouse: string;
  role: any;
  permission: string[];
  is_main: boolean;
  need_password_change: boolean;
}

type GlobalContextType = {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (data: boolean) => void;
  baseAPI: string | undefined;
  toggleDarkMode: () => void;
  isDarkMode: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
  userInfo: IUser | null;
  setUserInfo: (user: IUser | null) => void;
  permissionList: string[];
  loadingUser: boolean;
  permissionsReady: boolean;
  isRouteAllowed: boolean;
  canFetchPageData: boolean;
  setIsPermissionPage: (data: boolean) => void;
  isPermissionPage: boolean;
  paymentMethodOptions: SelectOption[];
  sourceOptions: SelectOption[];
  handleGetPermission: (showLoader?: boolean) => Promise<string[]>;
  bootstrapPermissions: (permissions: string[]) => void;
  refreshUserPermissions: () => Promise<string[]>;
  refreshAuthUser: () => void;
  notices: NoticeItem[];
  filteredNotices: NoticeItem[];
  unseenFilteredNotices: NoticeItem[];
  fetchNotice: (silent?: boolean) => Promise<void>;
  clearAuthData: () => void;
  beginLogout: () => void;
  isLoggingOut: boolean;
  noticeLoaded: boolean;
  openNoticeModal: (id: string) => void;
};

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

const PERMISSIONS_CACHE_KEY = "userPermissions";

const getCachedPermissions = (): string[] => {
  if (typeof window === "undefined") return [];

  try {
    const cached = localStorage.getItem(PERMISSIONS_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
};

const saveCachedPermissions = (permissions: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(PERMISSIONS_CACHE_KEY, JSON.stringify(permissions));
};

const clearCachedPermissions = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PERMISSIONS_CACHE_KEY);
};

const normalizePermissionList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (value && typeof value === "object") {
    return Object.values(value).filter(
      (item): item is string => typeof item === "string",
    );
  }

  return [];
};

const arePermissionsEqual = (a: unknown, b: unknown) => {
  const listA = normalizePermissionList(a);
  const listB = normalizePermissionList(b);

  if (listA.length !== listB.length) return false;

  const setA = new Set(listA);
  return listB.every((permission) => setA.has(permission));
};

const areUsersEqual = (a: IUser | null, b: IUser): boolean => {
  if (!a) return false;

  return (
    a.id === b.id &&
    a.name === b.name &&
    a.email === b.email &&
    a.warehouse === b.warehouse &&
    a.is_main === b.is_main &&
    a.need_password_change === b.need_password_change &&
    arePermissionsEqual(a.permission, b.permission)
  );
};

const AuthSessionSync = () => {
  useAuthSessionLogoutRedirect();
  return null;
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const baseAPI = ENV.ApiEndpoint ?? undefined;
  const normalizedPathname = pathname || "/";

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPermissionPage, setIsPermissionPage] = useState(false);
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isDarkMode, toggleDarkMode] = useDarkMode();
  const [permissionList, setPermissionList] = useState<string[]>([]);
  const [loadingUser, setLoadingUser] = useState(true);
  const [permissionsReady, setPermissionsReady] = useState(false);
  const isInitialPermissionLoad = useRef(true);
  const permissionRequestIdRef = useRef(0);
  const lastSuccessfulPermissionsRef = useRef<string[]>([]);
  const permissionListRef = useRef<string[]>([]);
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [noticeLoaded, setNoticeLoaded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    permissionListRef.current = permissionList;
  }, [permissionList]);

  const bootstrapPermissions = useCallback((permissions: string[]) => {
    if (!permissions?.length) return;

    lastSuccessfulPermissionsRef.current = permissions;
    permissionListRef.current = permissions;
    saveCachedPermissions(permissions);
    setPermissionList(permissions);
    setPermissionsReady(true);
    setLoadingUser(false);
  }, []);

  const hydratePermissionsFromCache = useCallback(() => {
    const cached = getCachedPermissions();
    if (cached.length === 0) return false;

    bootstrapPermissions(cached);
    return true;
  }, [bootstrapPermissions]);

  useLayoutEffect(() => {
    hydratePermissionsFromCache();
  }, [hydratePermissionsFromCache]);

  useEffect(() => {
    if (!token || permissionListRef.current.length > 0) return;
    hydratePermissionsFromCache();
  }, [token, hydratePermissionsFromCache]);

  // Global notice modal state
  const [globalNoticeModalOpen, setGlobalNoticeModalOpen] = useState(false);
  const [globalNoticeDetailsId, setGlobalNoticeDetailsId] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [queueIds, setQueueIds] = useState<string[]>([]);
  const [processedNoticeIds, setProcessedNoticeIds] = useState<string[]>([]);
  const [isQueueRunning, setIsQueueRunning] = useState(false);

  // prevent accidental duplicate queue start in same render cycle
  const queueBootingRef = useRef(false);

  const parseJwt = (tokenValue: string): any => {
    try {
      const base64Url = tokenValue.split(".")[1];
      if (!base64Url) return null;

      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join(""),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Error parsing JWT:", error);
      return null;
    }
  };

  const getCookie = (cookieName: string): string | null => {
    if (typeof document === "undefined") return null;

    const cookieArr = document.cookie.split("; ");
    for (const cookie of cookieArr) {
      const [name, ...rest] = cookie.split("=");
      if (name === cookieName) {
        return decodeURIComponent(rest.join("="));
      }
    }

    return null;
  };

  const beginLogout = useCallback(() => {
    isLoggingOutRef.current = true;
    setIsLoggingOut(true);
  }, []);

  const clearAuthData = useCallback(() => {
    isLoggingOutRef.current = false;
    setIsLoggingOut(false);
    setToken(null);
    setUserInfo(null);
    setPermissionList([]);
    lastSuccessfulPermissionsRef.current = [];
    clearCachedPermissions();
    setPermissionsReady(false);
    setNotices([]);
    setNoticeLoaded(false);
    setLoadingUser(false);

    setGlobalNoticeModalOpen(false);
    setGlobalNoticeDetailsId("");
    setQueueIds([]);
    setProcessedNoticeIds([]);
    setIsQueueRunning(false);
    queueBootingRef.current = false;

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("authInfo");
    }

    notifyAuthSessionChanged();
  }, []);

  const refreshAuthUser = useCallback(() => {
    if (typeof window === "undefined") return;

    const authToken = getCookie("authToken");

    if (!authToken) {
      if (isLoggingOutRef.current) return;
      handleLoggedOutSession(beginLogout, clearAuthData);
      return;
    }

    const decoded = parseJwt(authToken);

    if (!decoded?._id) {
      if (isLoggingOutRef.current) return;
      handleLoggedOutSession(beginLogout, clearAuthData);
      return;
    }

    const userData: IUser = {
      id: decoded._id || "",
      name: decoded.name || "",
      email: decoded.email || "",
      warehouse: decoded.warehouse || "",
      role: decoded.role || null,
      permission: normalizePermissionList(decoded.permission),
      is_main: decoded.is_main ?? false,
      need_password_change: decoded.need_password_change ?? false,
    };

    setToken((prev) => (prev === authToken ? prev : authToken));
    setUserInfo((prev) => (areUsersEqual(prev, userData) ? prev : userData));

    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
  }, [clearAuthData, beginLogout]);

  const handleGetPermission = useCallback(async (showLoader = true) => {
    const authToken = getCookie("authToken");

    if (!authToken) {
      if (isLoggingOutRef.current) return [];
      handleLoggedOutSession(beginLogout, clearAuthData);
      return [];
    }

    const requestId = ++permissionRequestIdRef.current;

    const hasCachedPermissions =
      permissionListRef.current.length > 0 ||
      getCachedPermissions().length > 0;

    const shouldShowLoader =
      showLoader && !hasCachedPermissions && !!authToken;

    if (shouldShowLoader) {
      setLoadingUser(true);
    }

    const applyFallbackPermissions = () => {
      const fallback =
        lastSuccessfulPermissionsRef.current.length > 0
          ? lastSuccessfulPermissionsRef.current
          : getCachedPermissions();

      setPermissionList((prev) =>
        arePermissionsEqual(prev, fallback) ? prev : [...fallback],
      );

      if (fallback.length > 0) {
        setPermissionsReady(true);
      }

      return fallback;
    };

    try {
      const res: any = await GlobalService.getPermission();

      if (requestId !== permissionRequestIdRef.current) {
        return permissionListRef.current;
      }

      if (res?.success) {
        const permissions = res?.data?.permissions || [];
        lastSuccessfulPermissionsRef.current = permissions;
        saveCachedPermissions(permissions);
        setPermissionList((prev) =>
          arePermissionsEqual(prev, permissions) ? prev : [...permissions],
        );
        setPermissionsReady(true);
        return permissions;
      }

      if (res?.message && showLoader) {
        ToastService.error(res.message);
      }

      return applyFallbackPermissions();
    } catch (err: any) {
      console.error("Permission fetch error:", err);

      if (requestId !== permissionRequestIdRef.current) {
        return permissionListRef.current;
      }

      return applyFallbackPermissions();
    } finally {
      if (requestId === permissionRequestIdRef.current && shouldShowLoader) {
        setLoadingUser(false);
      }
    }
  }, [beginLogout, clearAuthData]);

  const refreshUserPermissions = useCallback(async () => {
    refreshAuthUser();
    return handleGetPermission(false);
  }, [refreshAuthUser, handleGetPermission]);

  const fetchNotice = useCallback(async (silent = false) => {
    const authToken = getCookie("authToken");

    if (!authToken) {
      setNotices((prev) => (prev.length === 0 ? prev : []));
      setNoticeLoaded(true);
      return;
    }

    try {
      if (!silent) {
        setNoticeLoaded(false);
      }

      const res: any = await NoticeService.getMyNotices();

      if (res?.success) {
        const noticeList = res?.data?.data || [];
        setNotices((prev) => {
          if (
            prev.length === noticeList.length &&
            prev.every((item, index) => item._id === noticeList[index]?._id)
          ) {
            return prev;
          }
          return noticeList;
        });
      } else {
        setNotices((prev) => (prev.length === 0 ? prev : []));
      }
    } catch (err: any) {
      console.error("Notice fetch error:", err);
      setNotices((prev) => (prev.length === 0 ? prev : []));
    } finally {
      setNoticeLoaded(true);
    }
  }, []);

  useEffect(() => {
    refreshAuthUser();
  }, [refreshAuthUser]);

  useEffect(() => {
    const showLoader = isInitialPermissionLoad.current;
    if (isInitialPermissionLoad.current) {
      isInitialPermissionLoad.current = false;
    }

    handleGetPermission(showLoader);
    fetchNotice();
  }, [handleGetPermission, fetchNotice]);

  useEffect(() => {
    const refreshPermissions = () => {
      if (document.visibilityState !== "visible") return;
      handleGetPermission(false);
    };

    const intervalId = window.setInterval(refreshPermissions, 60_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [handleGetPermission]);

  useEffect(() => {
    const handlePermissionsRefresh = () => {
      refreshUserPermissions();
    };

    window.addEventListener(
      PERMISSIONS_REFRESH_EVENT,
      handlePermissionsRefresh,
    );

    return () => {
      window.removeEventListener(
        PERMISSIONS_REFRESH_EVENT,
        handlePermissionsRefresh,
      );
    };
  }, [refreshUserPermissions]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshAuthUser();
        handleGetPermission(false);
        fetchNotice(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refreshAuthUser, handleGetPermission, fetchNotice]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === AUTH_SESSION_SYNC_KEY ||
        event.key === PERMISSIONS_CACHE_KEY ||
        event.key === null
      ) {
        if (handleLoggedOutSession(beginLogout, clearAuthData)) {
          return;
        }
      }

      refreshAuthUser();
      hydratePermissionsFromCache();

      if (
        event.key === AUTH_SESSION_SYNC_KEY ||
        event.key === PERMISSIONS_CACHE_KEY ||
        event.key === null
      ) {
        handleGetPermission(false);
      }

      fetchNotice(true);
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
    };
  }, [
    refreshAuthUser,
    hydratePermissionsFromCache,
    handleGetPermission,
    fetchNotice,
    beginLogout,
    clearAuthData,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedSidebar = localStorage.getItem("isSidebarOpen");
    if (storedSidebar) {
      setIsSidebarOpen(JSON.parse(storedSidebar));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("isSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const paymentMethodOptions = useMemo(() => {
    return allPaymentMethodOptions.filter((method) =>
      permissionList.includes(
        `order_payment_method_${method.value.replace("-", "_")}`,
      ),
    );
  }, [permissionList]);

  const sourceOptions: SelectOption[] = useMemo(() => {
    return allSourceOptions.filter((source) =>
      permissionList.includes(`order_source_${source.value.replace("-", "_")}`),
    );
  }, [permissionList]);

  const filteredNotices = useMemo(() => {
    const userPermissionIds = userInfo?.permission || [];

    return notices.filter((notice) =>
      notice?.permissions?.some((permissionId: string) =>
        userPermissionIds.includes(permissionId),
      ),
    );
  }, [notices, userInfo?.permission]);

  const unseenFilteredNotices = useMemo(() => {
    return filteredNotices.filter((notice) => notice.seen === false);
  }, [filteredNotices]);

  // Start a new batch only when no batch is running and modal is not open
  useEffect(() => {
    if (!noticeLoaded) return;
    if (isQueueRunning) return;
    if (globalNoticeModalOpen) return;
    if (queueBootingRef.current) return;

    const remainingUnseenIds = unseenFilteredNotices
      .map((item) => item._id)
      .filter((id) => !processedNoticeIds.includes(id));

    if (remainingUnseenIds.length === 0) {
      return;
    }

    queueBootingRef.current = true;

    setQueueIds(remainingUnseenIds);
    setGlobalNoticeDetailsId(remainingUnseenIds[0]);
    setGlobalNoticeModalOpen(true);
    setIsQueueRunning(true);

    setTimeout(() => {
      queueBootingRef.current = false;
    }, 0);
  }, [
    noticeLoaded,
    unseenFilteredNotices,
    processedNoticeIds,
    isQueueRunning,
    globalNoticeModalOpen,
  ]);

  // Shift queue, do not rebuild from server here
  const handleOpenNextUnseen = useCallback((closedId: string) => {
    setProcessedNoticeIds((prev) =>
      prev.includes(closedId) ? prev : [...prev, closedId],
    );

    setQueueIds((prevQueue) => {
      const nextQueue = prevQueue.filter((id) => id !== closedId);

      if (nextQueue.length > 0) {
        setGlobalNoticeDetailsId(nextQueue[0]);
        setGlobalNoticeModalOpen(true);
      } else {
        setGlobalNoticeModalOpen(false);
        setGlobalNoticeDetailsId("");
        setIsQueueRunning(false);
      }

      return nextQueue;
    });
  }, []);

  const openNoticeModal = useCallback((id: string) => {
    setGlobalNoticeDetailsId(id);
    setGlobalNoticeModalOpen(true);
  }, []);

  const isRouteAllowed = useMemo(() => {
    if (isLoggingOut) return true;
    if (loadingUser && permissionList.length === 0) return false;
    if (stripAdminPrefix(normalizedPathname) === "/no-permission") return true;
    return canAccessRoute(normalizedPathname, permissionList);
  }, [isLoggingOut, loadingUser, normalizedPathname, permissionList]);

  const canFetchPageData = isRouteAllowed;

  useEffect(() => {
    setIsPermissionPage((prev) => (prev ? false : prev));
  }, [normalizedPathname]);

  const contextValue = useMemo(
    () => ({
      isSidebarOpen,
      setIsSidebarOpen,
      baseAPI,
      toggleDarkMode,
      isDarkMode,
      token,
      setToken,
      userInfo,
      setUserInfo,
      permissionList,
      loadingUser,
      permissionsReady,
      isRouteAllowed,
      canFetchPageData,
      setIsPermissionPage,
      isPermissionPage,
      paymentMethodOptions,
      sourceOptions,
      handleGetPermission,
      bootstrapPermissions,
      refreshUserPermissions,
      refreshAuthUser,
      notices,
      filteredNotices,
      unseenFilteredNotices,
      fetchNotice,
      clearAuthData,
      beginLogout,
      isLoggingOut,
      noticeLoaded,
      openNoticeModal,
    }),
    [
      isSidebarOpen,
      baseAPI,
      toggleDarkMode,
      isDarkMode,
      token,
      userInfo,
      permissionList,
      loadingUser,
      permissionsReady,
      isRouteAllowed,
      canFetchPageData,
      isPermissionPage,
      paymentMethodOptions,
      sourceOptions,
      handleGetPermission,
      bootstrapPermissions,
      refreshUserPermissions,
      refreshAuthUser,
      notices,
      filteredNotices,
      unseenFilteredNotices,
      fetchNotice,
      clearAuthData,
      beginLogout,
      isLoggingOut,
      noticeLoaded,
      openNoticeModal,
    ],
  );

  return (
    <GlobalContext.Provider value={contextValue}>
      <AuthSessionSync />
      <AssignPresenceKeeper />
      {children}

      <NoticeDetails
        isModalOpen={globalNoticeModalOpen}
        setIsModalOpen={setGlobalNoticeModalOpen}
        detailsId={globalNoticeDetailsId}
        fetchNotice={fetchNotice}
        onCloseNext={handleOpenNextUnseen}
      />
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);

  if (!context) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }

  return context;
};
