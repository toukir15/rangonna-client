"use client";

import React from "react";

const SkeletonBox = ({ className = "" }: { className?: string }) => {
    return (
        <div
            className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-700 ${className}`}
        />
    );
};

const PolicyDetailsSkeleton = () => {
    return (
        <div className="space-y-5">
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                    >
                        <div className="flex items-center gap-3">
                            <SkeletonBox className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <SkeletonBox className="h-3 w-24" />
                                <SkeletonBox className="h-4 w-36" />
                            </div>
                        </div>
                    </div>
                ))}
            </div> */}

            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                    <SkeletonBox className="h-5 w-5 rounded" />
                    <SkeletonBox className="h-5 w-40" />
                </div>

                <div className="space-y-3">
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-11/12" />
                    <SkeletonBox className="h-4 w-10/12" />
                    <SkeletonBox className="h-4 w-full" />
                    <SkeletonBox className="h-4 w-9/12" />
                    <SkeletonBox className="h-4 w-8/12" />
                </div>
            </div>
        </div>
    );
};

export default PolicyDetailsSkeleton;