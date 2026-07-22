"use client";

import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import Button from "@admin/components/core/Button/Button";

const NoPermissionView = () => {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
      <div className="flex flex-col items-center text-center bg-white dark:bg-gray-800 shadow-2xl rounded-3xl p-10 max-w-lg w-full border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 shadow-md mb-6">
          <LockKeyhole className="w-10 h-10 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">
          No Permission
        </h2>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-md">
          You don&apos;t have the required access to view this page. Please
          contact your administrator if this is a mistake.
        </p>
        <Link href="/admin/holiday-shift" className="w-full">
          <Button className="w-full rounded-xl px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition text-white font-medium shadow-lg">
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NoPermissionView;
