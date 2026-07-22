import React, { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Icon from "@admin/components/core/Icon/Icon";
import { UserInfoModalProps } from "@admin/@interfaces/common.interface";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const UserInfoModal: React.FC<UserInfoModalProps> = ({
  showUserDropdown,
  setShowUserDropdown,
  showAlert,
  userLogo,
}) => {
  const { permissionList } = useGlobalContext();
  const userDropdownRef = useRef<HTMLDivElement | null>(null);

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
    <div>
      <div
        className="flex items-center border border-gray-300 bg-gray-400 rounded-md p-2 cursor-pointer "
        onClick={() => setShowUserDropdown(!showUserDropdown)}
      >
        <Image className="w-auto h-5 " src={userLogo} alt="user logo" />
      </div>

      {showUserDropdown && (
        <div
          ref={userDropdownRef}
          className="absolute -right-2 mt-3 w-72 overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 shadow-2xl z-50 backdrop-blur-sm"
        >
          <div className="p-2">
            <Link
              href="/admin/profile"
              className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 group-hover:scale-105 transition-transform duration-200">
                <Icon name="person" variant="outlined" />
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
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="fact_check" variant="outlined" />
                </div>
                <div>
                  <p>My Task</p>
                  <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
                    Check assigned tasks
                  </p>
                </div>
              </Link>
            )}

            {hasPermission(permissionList, "leave_application_my_view") && (
              <Link
                href="/admin/team/my-leave"
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 group-hover:scale-105 transition-transform duration-200">
                  <Icon name="event_busy" variant="outlined" />
                </div>
                <div>
                  <p>My Leave</p>
                  <p className="text-xs font-normal text-gray-400 dark:text-gray-500">
                    Track leave requests
                  </p>
                </div>
              </Link>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-700 p-2">
            <button
              onClick={() => {
                showAlert();
                setShowUserDropdown(!showUserDropdown);
              }}
              className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 dark:text-red-400 transition-all duration-200 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400 group-hover:scale-105 transition-transform duration-200">
                <Icon name="logout" variant="outlined" />
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
