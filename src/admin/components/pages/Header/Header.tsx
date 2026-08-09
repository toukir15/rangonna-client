"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import Image from "next/image";
import Icon from "@admin/components/core/Icon/Icon";
import userLogo from "@admin/assets/images/user.png";
import AdminBrandLogo from "@admin/components/core/Brand/AdminBrandLogo";
import UserInfoModal from "./UserInfoModal";
import LogOutLogo from "@admin/assets/images/logOut.png";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { Suggestion } from "@admin/@interfaces/common.interface";
import DarkModeToggle from "./DarkModeToggle";
import Alert from "@admin/components/core/Aleart/Aleart";
import { Palette } from "lucide-react";
import Cookies from "js-cookie";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Button from "@admin/components/core/Button/Button";
import { getStatusStyle } from "@admin/utils/system.utils";
import { ensureSocketConnected } from "@admin/@config/socket.config";
import {
  INeedOrdersNotification,
  OrderAssignmentService,
} from "@admin/@services/apis/OrdersService/OrderAssignment.service";
import TransferOrdersModal from "@admin/components/pages/Orders/TransferOrdersModal";
import { stopAssignPresenceSession } from "@admin/@config/assignPresence.session";
import { notifyAuthSessionChanged } from "@admin/utils/authSessionSync";

const needOrdersReadStorageKey = (adminUserId: string) =>
  `need_orders_read_${adminUserId}`;

const loadNeedOrdersReadIds = (adminUserId: string): Set<string> => {
  if (!adminUserId || typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(needOrdersReadStorageKey(adminUserId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
};

const saveNeedOrdersReadIds = (adminUserId: string, ids: Set<string>) => {
  if (!adminUserId || typeof window === "undefined") return;
  localStorage.setItem(
    needOrdersReadStorageKey(adminUserId),
    JSON.stringify([...ids])
  );
};

export default function Header() {
  const {
    permissionList,
    setToken,
    userInfo,
    isSidebarOpen,
    setIsSidebarOpen,
    beginLogout,
  } = useGlobalContext();
  const router = useRouter();
  const pathname = usePathname() || "";
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [searchId, setSearchId] = useState("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(
    [],
  );
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [needOrderAlerts, setNeedOrderAlerts] = useState<
    INeedOrdersNotification[]
  >([]);
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState<string | null>(null);
  const [bellVibrating, setBellVibrating] = useState(false);
  const bellVibrateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    () => new Set()
  );

  const canManageAssign = permissionList?.includes("order_assignment_transfer");
  const myUserId = String(userInfo?.id || "");
  const unreadOrderAlertCount = needOrderAlerts.filter(
    (alert) => !readNotificationIds.has(alert.id)
  ).length;

  const markNotificationRead = (notificationId: string) => {
    if (!myUserId) return;
    setReadNotificationIds((prev) => {
      if (prev.has(notificationId)) return prev;
      const next = new Set(prev);
      next.add(notificationId);
      saveNeedOrdersReadIds(myUserId, next);
      return next;
    });
  };

  const markAllNotificationsRead = () => {
    if (!myUserId || needOrderAlerts.length === 0) return;
    setReadNotificationIds((prev) => {
      const next = new Set(prev);
      needOrderAlerts.forEach((alert) => next.add(alert.id));
      saveNeedOrdersReadIds(myUserId, next);
      return next;
    });
  };

  const playNotificationSound = () => {
    try {
      if (typeof window === "undefined") return;
      if (!notificationAudioRef.current) {
        const audio = new Audio("/sounds/notification.wav");
        audio.preload = "auto";
        audio.volume = 0.7;
        notificationAudioRef.current = audio;
      }
      const audio = notificationAudioRef.current;
      audio.currentTime = 0;
      void audio.play().catch(() => {
        // Autoplay may be blocked until user interacts with the page
      });
    } catch {
      // Audio unsupported
    }
  };

  const triggerNotificationAlert = () => {
    playNotificationSound();

    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        // Double pulse — works on Android Chrome (desktop usually no-op)
        navigator.vibrate([120, 60, 120]);
      }
    } catch {
      // Vibration unsupported or blocked
    }

    if (bellVibrateTimerRef.current) {
      clearTimeout(bellVibrateTimerRef.current);
    }
    setBellVibrating(false);
    // Restart animation even if already vibrating
    requestAnimationFrame(() => {
      setBellVibrating(true);
      bellVibrateTimerRef.current = setTimeout(() => {
        setBellVibrating(false);
        bellVibrateTimerRef.current = null;
      }, 600);
    });
  };

  const getCookie = (cookieName: string): string | null => {
    if (typeof document === "undefined") return null;

    const cookieArr = document.cookie.split("; ");
    for (let cookie of cookieArr) {
      const [name, value] = cookie.split("=");
      if (name === cookieName) {
        return decodeURIComponent(value);
      }
    }
    return null;
  };

  useEffect(() => {
    const authToken = getCookie("authToken");
    setIsAuthenticated(!!authToken);
    setSearchId("");
    setShowSuggestions(false);
  }, [pathname]);

  useEffect(() => {
    if (!myUserId) return;
    setReadNotificationIds(loadNeedOrdersReadIds(myUserId));
  }, [myUserId]);

  useEffect(() => {
    if (!myUserId || needOrderAlerts.length === 0) return;
    const activeIds = new Set(needOrderAlerts.map((alert) => alert.id));
    setReadNotificationIds((prev) => {
      const pruned = new Set([...prev].filter((id) => activeIds.has(id)));
      if (pruned.size === prev.size) return prev;
      saveNeedOrdersReadIds(myUserId, pruned);
      return pruned;
    });
  }, [myUserId, needOrderAlerts]);

  useEffect(() => {
    if (!isAuthenticated || !canManageAssign) return;

    const unlockAudio = () => {
      try {
        if (!notificationAudioRef.current) {
          const audio = new Audio("/sounds/notification.wav");
          audio.preload = "auto";
          audio.volume = 0.7;
          notificationAudioRef.current = audio;
        }
        const audio = notificationAudioRef.current;
        audio.muted = true;
        void audio
          .play()
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.muted = false;
          })
          .catch(() => {
            audio.muted = false;
          });
      } catch {
        // ignore
      }
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [isAuthenticated, canManageAssign]);

  useEffect(() => {
    if (!isAuthenticated || !canManageAssign) {
      return;
    }

    let active = true;
    let myDomains = new Set<string>();

    const domainsOverlap = (notificationDomains?: string[]) => {
      if (!myDomains.size) return true; // until loaded, don't drop; list API already filters
      const nDomains = (notificationDomains || []).map((d) =>
        String(d || "").trim().replace(/\/+$/, "")
      );
      if (!nDomains.length) return false;
      return nDomains.some((d) => myDomains.has(d));
    };

    OrderAssignmentService.getMe()
      .then((res: any) => {
        if (!active) return;
        const domains = (res?.data?.domains || []) as string[];
        myDomains = new Set(
          domains.map((d) => String(d || "").trim().replace(/\/+$/, "")).filter(Boolean)
        );
      })
      .catch(() => undefined);

    OrderAssignmentService.listNeedOrdersNotifications()
      .then((res: any) => {
        if (active && res?.success && Array.isArray(res.data)) {
          // Never show your own need-orders request in the bell
          const filtered = myUserId
            ? res.data.filter(
                (n: INeedOrdersNotification) => n.user_id !== myUserId
              )
            : res.data;
          setNeedOrderAlerts(filtered);
        }
      })
      .catch(() => undefined);

    const socket = ensureSocketConnected();
    if (!socket) {
      return;
    }

    const joinAdmin = () => {
      socket.emit("assign:join-admin-notify");
    };
    if (socket.connected) joinAdmin();
    else socket.once("connect", joinAdmin);

    const onNeed = (payload: INeedOrdersNotification) => {
      if (myUserId && payload.user_id === myUserId) {
        return;
      }
      if (!domainsOverlap(payload.domains)) {
        return;
      }
      setNeedOrderAlerts((prev) => {
        const rest = prev.filter((n) => n.user_id !== payload.user_id);
        return [payload, ...rest];
      });
      setShowNotifications(true);
      triggerNotificationAlert();
    };
    const onDismiss = (payload: { user_id: string }) => {
      setNeedOrderAlerts((prev) =>
        prev.filter((n) => n.user_id !== payload.user_id)
      );
    };
    const onClaimed = (payload: {
      user_id: string;
      claimed_by: string;
      claimed_by_name: string;
      claimed_at: string;
    }) => {
      setNeedOrderAlerts((prev) =>
        prev.map((n) =>
          n.user_id === payload.user_id
            ? {
                ...n,
                claimed_by: payload.claimed_by,
                claimed_by_name: payload.claimed_by_name,
                claimed_at: payload.claimed_at,
              }
            : n
        )
      );
    };
    const onReleased = (payload: { user_id: string }) => {
      setNeedOrderAlerts((prev) =>
        prev.map((n) =>
          n.user_id === payload.user_id
            ? {
                ...n,
                claimed_by: null,
                claimed_by_name: null,
                claimed_at: null,
              }
            : n
        )
      );
    };

    socket.on("assign:need-orders", onNeed);
    socket.on("assign:need-orders-dismissed", onDismiss);
    socket.on("assign:need-orders-claimed", onClaimed);
    socket.on("assign:need-orders-released", onReleased);
    return () => {
      active = false;
      socket.off("assign:need-orders", onNeed);
      socket.off("assign:need-orders-dismissed", onDismiss);
      socket.off("assign:need-orders-claimed", onClaimed);
      socket.off("assign:need-orders-released", onReleased);
      if (bellVibrateTimerRef.current) {
        clearTimeout(bellVibrateTimerRef.current);
        bellVibrateTimerRef.current = null;
      }
    };
  }, [isAuthenticated, canManageAssign, userInfo?.id]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        notificationsRef?.current &&
        !notificationsRef?.current?.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const showAlert = () => {
    setIsAlertOpen(true);
  };

  const handleCancel = () => {
    setIsAlertOpen(false);
  };

  const handleLogout = () => {
    setIsAlertOpen(false);
    beginLogout();
    stopAssignPresenceSession();

    const cookieOptions = {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax" as const,
    };

    Cookies.remove("authToken", cookieOptions);
    Cookies.remove("refreshToken", cookieOptions);

    notifyAuthSessionChanged();
    ToastService.success("Logged out successfully!");
    window.location.replace("/admin?logout=1");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const value = e.target.value ?? "";
    setSearchId(value);

    if (value.trim().length >= 3) {
      fetchSuggestions(value);
    } else {
      setShowSuggestions(false);
    }
    if (!value.length) {
      setFilteredSuggestions([]);
    }
  };

  const fetchSuggestions = async (query: string) => {
    GlobalService.getSearchOrders({
      searchTerm: query,
    })
      .then((res: any) => {
        if (res?.success) {
          setFilteredSuggestions(res.data);
          setShowSuggestions(res.data.length > 0);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleSuggestionClick = (suggestion: any) => {
    setSearchId(
      String(
        suggestion?.orderID ??
          suggestion?.order_id ??
          suggestion?.sysid ??
          "",
      ),
    );
    setShowSuggestions(false);
    if (suggestion?.status) {
      localStorage.setItem("viewOrderStatus", suggestion.status);
    }
    router.push(`/admin/orders/view/${encodeURIComponent(suggestion?._id)}`);
    setFilteredSuggestions([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredSuggestions.length === 1) {
      const suggestion: any = filteredSuggestions[0];
      localStorage.setItem("viewOrderStatus", suggestion?.status);
      router.push(`/admin/orders/view/${encodeURIComponent(suggestion?._id)}`);
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLDivElement | HTMLInputElement>,
  ) => {
    if (
      suggestionBoxRef.current &&
      !suggestionBoxRef.current.contains(e.relatedTarget)
    ) {
      setTimeout(() => {
        setShowSuggestions(false);
      }, 200);
    }
  };
  const hideHeaderPaths = [
    "/admin/welcome",
    "/admin/welcome/create-shop",
    "/admin/welcome/website-address",
    "/admin/welcome/about-you",
    "/admin/welcome/product-type",
    "/admin/welcome/store-design",
    "/admin/verify",
  ];
  if (hideHeaderPaths.includes(pathname)) {
    return null;
  }

  const handleCashClean = async (): Promise<void> => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("cache_bust", Date.now().toString());
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((reg) => reg.unregister()));
      }

      window.location.replace(url.toString());
      alert("Cache cleared successfully. Refreshing...");
    } catch (error) {
      console.error("Cache clearing failed:", error);
      alert("Cache clearing encountered an error");
    }
  };

  return (
    <>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Log Out"
        cancelLabel="Stay Here"
        onConfirm={handleLogout}
        onCancel={handleCancel}
      >
        <div className="px-2 py-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10">
            <Image
              className="h-9 w-auto object-contain"
              src={LogOutLogo}
              alt="Logout"
              width={36}
              height={36}
              style={{ width: "auto", height: "auto" }}
            />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">
            Confirm Logout
          </h3>

          <p className="mt-3 text-sm md:text-base leading-6 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Are you sure you want to log out of your account? You will need to
            sign in again to access your dashboard.
          </p>

          <div className="mt-6 rounded-xl border border-red-100 dark:border-red-500/20 bg-red-50/70 dark:bg-red-500/5 px-4 py-3">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              Your current session will be ended securely.
            </p>
          </div>
        </div>
      </Alert>
      <header className="admin-header sticky top-0 z-50 flex h-[60px] items-center gap-3 px-3 no-print md:px-4">
        <div className="flex min-w-0 shrink-0 items-center gap-2">
          {isAuthenticated && (
            <button
              type="button"
              aria-label="Toggle sidebar"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] text-app-secondary transition-colors hover:bg-[var(--bg-hover)] hover:text-app xl:inline-flex"
            >
              <Icon
                name={isSidebarOpen ? "menu" : "menu_open"}
                variant="outlined"
                size={22}
              />
            </button>
          )}

          <Link
            href={isAuthenticated ? "/admin/dashboard/all" : "/admin"}
            className="flex items-center"
          >
            <AdminBrandLogo size="sm" variant="green" />
          </Link>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          {isAuthenticated && (
            <div
              className="relative w-full max-w-xl"
              onBlur={handleBlur}
              onFocus={() => setShowSuggestions(true)}
            >
              <input
                type="text"
                ref={searchInputRef}
                placeholder="Search orders by ID, phone, name..."
                className="input-app !h-9 !py-0 pr-10"
                value={searchId ?? ""}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-app-muted">
                <Icon name="search" variant="outlined" size={18} />
              </span>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionBoxRef}
                  className="absolute top-full left-0 right-0 z-10 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] shadow-[var(--shadow-soft)]"
                >
                  <ul>
                    {filteredSuggestions.map(
                      (suggestion: any, index: number) => {
                        return (
                          <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="flex cursor-pointer flex-col border-b border-[var(--border)] p-4 transition-colors last:border-b-0 hover:bg-[var(--bg-hover)]"
                          >
                            <div className="flex justify-between items-center">
                              <div className="text-sm font-semibold text-app">
                                Order ID: {suggestion?.sysid}
                              </div>
                              <div
                                className={`text-sm font-medium px-2 py-1 rounded-lg capitalize ${getStatusStyle(
                                  suggestion.status,
                                )}`}
                              >
                                {suggestion?.status === "ready-for-box"
                                  ? "R-D"
                                  : suggestion?.status === "waiting-payment"
                                    ? "To be Paid"
                                    : suggestion?.status}
                              </div>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Customer Name: {suggestion?.customer?.first_name}
                              {suggestion?.customer?.last_name}
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Contact Number: {suggestion?.customer?.phone}
                            </div>
                          </li>
                        );
                      },
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-2.5">
          {pathname === "/admin" || pathname === "/admin/signup" ? null : (
            <>
              <Link
                href="/admin/setting/dashboard-theme"
                aria-label="Appearance"
                title="Appearance"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                <Palette className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
              </Link>
              <DarkModeToggle />
            </>
          )}

          {isAuthenticated ? (
            <>
              {permissionList.includes("order_create") && (
                <Link
                  href="/admin/create-order"
                  className="btn-primary btn-primary-inline hidden md:!inline-flex h-9 !items-center !rounded-lg !px-3.5 !text-sm !shadow-sm"
                >
                  Create Order
                </Link>
              )}

              <button
                type="button"
                onClick={handleCashClean}
                className="hidden lg:inline-flex h-9 shrink-0 items-center rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition-colors hover:border-[var(--brand-border-medium)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
              >
                Clear Cash
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-black/5 text-gray-700 transition-colors hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-gray-900 ${
                    bellVibrating ? "animate-notify-vibrate" : ""
                  }`}
                >
                  <Icon name="notifications" variant="outlined" size={20} />
                  {unreadOrderAlertCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {unreadOrderAlertCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div
                    ref={notificationsRef}
                    className="absolute right-0 z-20 mt-2 w-80 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900"
                  >
                    {needOrderAlerts.length === 0 ? (
                      <div className="w-full p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/40">
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm mb-3">
                          <Icon
                            name="notifications_none"
                            className="text-gray-400 dark:text-gray-300"
                          />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          No New Notifications
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                          {`You're all caught up! No order requests right now.`}
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-600 flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Order requests
                          </span>
                          {unreadOrderAlertCount > 0 && (
                            <button
                              type="button"
                              onClick={markAllNotificationsRead}
                              className="text-[11px] font-medium text-green-600 dark:text-green-300 hover:underline whitespace-nowrap"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>
                        {needOrderAlerts.map((alert) => {
                          const claimedByOther =
                            !!alert.claimed_by &&
                            alert.claimed_by !== myUserId;
                          const isRead = readNotificationIds.has(alert.id);
                          return (
                            <div
                              key={alert.id}
                              className={`flex items-stretch border-b border-gray-100 dark:border-gray-600 last:border-b-0 ${
                                !isRead
                                  ? "bg-green-50/80 dark:bg-green-900/20"
                                  : claimedByOther
                                    ? "bg-gray-50 dark:bg-gray-800/50"
                                    : ""
                              }`}
                            >
                              <button
                                type="button"
                                disabled={claimedByOther}
                                className={`flex-1 min-w-0 text-left px-3 py-3 ${
                                  claimedByOther
                                    ? "opacity-60 cursor-not-allowed"
                                    : "hover:bg-gray-50/80 dark:hover:bg-gray-600/50"
                                }`}
                                onClick={async () => {
                                  if (claimedByOther) return;
                                  try {
                                    const res =
                                      await OrderAssignmentService.claimNeedOrdersNotification(
                                        alert.user_id
                                      );
                                    if (!res?.success) {
                                      ToastService.error(
                                        res?.message ||
                                          "Someone else is already handling this request"
                                      );
                                      return;
                                    }
                                    markNotificationRead(alert.id);
                                    setNeedOrderAlerts((prev) =>
                                      prev.map((n) =>
                                        n.user_id === alert.user_id
                                          ? {
                                              ...n,
                                              claimed_by: myUserId,
                                              claimed_by_name:
                                                String(userInfo?.name || "You"),
                                              claimed_at: new Date().toISOString(),
                                            }
                                          : n
                                      )
                                    );
                                    setTransferToUserId(alert.user_id);
                                    setTransferOpen(true);
                                    setShowNotifications(false);
                                  } catch (err: any) {
                                    ToastService.error(
                                      err?.message ||
                                        "Someone else is already handling this request"
                                    );
                                  }
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  {!isRead && (
                                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                                  )}
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                      {alert.user_name} needs orders
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-0.5">
                                      Queue{" "}
                                      {alert.active_order_count}/{alert.max_orders}
                                      {" · "}
                                      {new Date(
                                        alert.created_at
                                      ).toLocaleTimeString()}
                                    </p>
                                    {claimedByOther ? (
                                      <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                                        Being handled by{" "}
                                        {alert.claimed_by_name || "another admin"}
                                      </p>
                                    ) : (
                                      <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                                        Click to transfer
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </button>
                              {!isRead ? (
                                <button
                                  type="button"
                                  title="Mark as read"
                                  aria-label="Mark as read"
                                  onClick={() => markNotificationRead(alert.id)}
                                  className="shrink-0 px-2.5 flex items-center border-l border-gray-100 dark:border-gray-600 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-gray-600 dark:hover:text-green-300 transition-colors"
                                >
                                  <Icon
                                    name="mark_email_read"
                                    className="text-base"
                                  />
                                </button>
                              ) : (
                                <div
                                  title="Read"
                                  className="shrink-0 px-2.5 flex items-center border-l border-gray-100 dark:border-gray-600 text-gray-300 dark:text-gray-500"
                                >
                                  <Icon
                                    name="drafts"
                                    className="text-base"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <UserInfoModal
                showUserDropdown={showUserDropdown}
                setShowUserDropdown={setShowUserDropdown}
                showAlert={showAlert}
                userLogo={userLogo}
              />
            </>
          ) : (
            <div className="flex items-center gap-2">
              {pathname === "/admin" && (
                <Link
                  href="/admin/signup"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700"
                >
                  Sign Up
                </Link>
              )}

              {pathname === "/admin/signup" && (
                <Link
                  href="/admin"
                  className="btn-primary btn-primary-inline !inline-flex !rounded-lg !px-4 !py-2 !text-sm !shadow-sm"
                >
                  Login
                </Link>
              )}
            </div>
          )}
        </div>
      </header>
      {canManageAssign && (
        <TransferOrdersModal
          isOpen={transferOpen}
          onClose={(opts) => {
            const toUserId = transferToUserId;
            setTransferOpen(false);
            setTransferToUserId(null);
            // Close without transfer → free claim so another admin can take it
            if (toUserId && !opts?.transferred) {
              OrderAssignmentService.releaseNeedOrdersNotificationClaim(toUserId)
                .catch(() => {});
            }
          }}
          initialToUserId={transferToUserId}
          onTransferred={() => {
            OrderAssignmentService.listNeedOrdersNotifications()
              .then((res: any) => {
                if (res?.success && Array.isArray(res.data)) {
                  setNeedOrderAlerts(res.data);
                }
              })
              .catch(() => {});
          }}
        />
      )}
    </>
  );
}
