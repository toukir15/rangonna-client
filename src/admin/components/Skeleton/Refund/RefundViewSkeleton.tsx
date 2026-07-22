"use client";
import React from "react";

const RefundViewSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 w-full max-w-sm">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-6 w-44 rounded bg-gray-200" />
            <div className="h-4 w-36 rounded bg-gray-200" />
          </div>
          <div className="h-7 w-24 rounded-full bg-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 bg-gray-50 p-3 space-y-2"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-4 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-gray-100 bg-white p-4 space-y-2"
          >
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-4/6 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="h-4 w-28 rounded bg-gray-200 mb-3" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="rounded-xl border border-gray-100 p-3">
              <div className="flex gap-3">
                <div className="h-16 w-16 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-4/5 rounded bg-gray-200" />
                  <div className="h-3 w-2/5 rounded bg-gray-200" />
                  <div className="h-3 w-3/5 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="h-4 w-28 rounded bg-gray-200 mb-3" />
        <div className="h-16 w-full rounded bg-gray-200" />
      </div>
    </div>
  );
};

export default RefundViewSkeleton;
