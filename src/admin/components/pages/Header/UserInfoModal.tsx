import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Icon from "@admin/components/core/Icon/Icon";
import { UserInfoModalProps } from "@admin/@interfaces/common.interface";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  showUserDropdown,
  setShowUserDropdown,
  showAlert,
}) => {
  const { permissionList, userInfo } = useGlobalContext();
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

  const userInitial =
    userInfo?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowUserDropdown]);

  return (
    <div className="relative" ref={userDropdownRef}>
      <button
        type="button"
        aria-label="User menu"
        aria-expanded={showUserDropdown}
        onClick={() => setShowUserDropdown(!showUserDropdown)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-green-200 bg-green-50 text-sm font-semibold text-green-700 transition-colors hover:bg-green-100 dark:border-green-500/30 dark:bg-green-950/40 dark:text-green-300 dark:hover:bg-green-900/50"
      >
        {userInitial}
      </button>

      {showUserDropdown && (
        <div className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-black/10 bg-white shadow-xl dark:border-white/10 dark:bg-gray-900 z-50">
          {userInfo?.name && (
            <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
              <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                {userInfo.name}
              </p>
              {userInfo.email && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {userInfo.email}
                </p>
              )}
            </div>
          )}

          <div className="p-1.5">
            <Link
              href="/admin/profile"
              onClick={() => setShowUserDropdown(false)}
              className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                <Icon name="person" variant="outlined" size={18} />
              </div>
              <div>
                <p>My Profile</p>
                <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
                  View and update profile
                </p>
              </div>
            </Link>

            {hasPermission(permissionList, "task_my_task_view") && (
              <Link
                href="/admin/task-manager/my-task"
                onClick={() => setShowUserDropdown(false)}
                className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Icon name="fact_check" variant="outlined" size={18} />
                </div>
                <div>
                  <p>My Task</p>
                  <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
                    Check assigned tasks
                  </p>
                </div>
              </Link>
            )}
          </div>

          <div className="border-t border-black/5 p-1.5 dark:border-white/10">
            <button
              type="button"
              onClick={() => {
                showAlert();
                setShowUserDropdown(false);
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
                <Icon name="logout" variant="outlined" size={18} />
              </div>
              <div>
                <p>Log Out</p>
                <p className="text-xs font-normal text-red-400 dark:text-red-500">
                  Sign out from your account
                </p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserInfoModal;
