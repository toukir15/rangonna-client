import React from "react";
import Skeleton from "../Skeleton";

const NoticeSkeleton: React.FC = () => {
    const skeletonItems = Array.from({ length: 10 });

    return (
        <div className="w-full space-y-3 ">
            {skeletonItems.map((_, index) => (
                <div
                    key={index}
                    className="w-full rounded-xl bg-[#dfdfe0] border border-gray-200 dark:border-gray-700 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3  dark:bg-gray-900"
                >
                    <div className="flex gap-3 items-start flex-1">
                        {/* Icon */}
                        <div className="rounded-full p-3.5 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Skeleton type="text" count={1} height={22} width={22} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 space-y-2">
                            <Skeleton type="text" count={1} height={18} width={180} />
                            <Skeleton type="text" count={1} height={14} width={280} />
                            <Skeleton type="text" count={1} height={12} width={100} />
                        </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-2">
                        <Skeleton type="text" count={1} height={28} width={70} />
                        <Skeleton type="text" count={1} height={36} width={110} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default NoticeSkeleton;