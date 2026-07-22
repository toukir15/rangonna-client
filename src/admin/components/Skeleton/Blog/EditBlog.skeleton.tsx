import React from "react";
import Skeleton from "@admin/components/Skeleton/Skeleton";

const EditBlogSkeleton: React.FC = () => {
    return (
        <div className="min-h-[70vh] w-full">
            <div className="2xl:flex 2xl:items-start gap-4 2xl:h-[calc(100vh-140px)] 2xl:overflow-hidden">
                <div className="2xl:w-3/4 w-full 2xl:h-full 2xl:overflow-y-auto">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-lg dark:text-gray-300">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-[#dfdfe0] h-8 w-44 rounded-xl opacity-70 dark:opacity-50 p-2">
                                <Skeleton type="text" count={1} height={18} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-[#dfdfe0] h-11 rounded-xl opacity-70 dark:opacity-50 p-2">
                                <Skeleton type="text" count={1} height={22} />
                            </div>
                            <div className="bg-[#dfdfe0] h-11 rounded-xl opacity-70 dark:opacity-50 p-2">
                                <Skeleton type="text" count={1} height={22} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
                        <div className="bg-[#dfdfe0] min-h-[320px] md:min-h-[420px] rounded-xl opacity-70 dark:opacity-50 p-2">
                            <Skeleton type="text" count={1} height={380} />
                        </div>
                    </div>
                </div>
                <div className="2xl:w-1/4 w-full 2xl:sticky 2xl:self-start 2xl:max-h-[calc(100vh-140px)] 2xl:overflow-y-auto mt-4 2xl:mt-0">
                    <div className="bg-white dark:bg-gray-800 dark:text-gray-300 rounded-lg p-4">
                        <div className="bg-[#dfdfe0] h-7 w-36 rounded-lg mb-3 opacity-70 dark:opacity-50 p-1">
                            <Skeleton type="text" count={1} height={20} />
                        </div>
                        <div className="bg-[#dfdfe0] h-44 rounded-xl opacity-70 dark:opacity-50 p-2">
                            <Skeleton type="text" count={1} height={160} />
                        </div>
                        <div className="bg-[#dfdfe0] h-11 mt-3 rounded-xl opacity-70 dark:opacity-50 p-2">
                            <Skeleton type="text" count={1} height={22} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-end gap-3 bg-white dark:bg-gray-700 rounded-lg p-4">
                        <div className="bg-[#dfdfe0] h-10 w-24 rounded-lg opacity-70 dark:opacity-50 p-1">
                            <Skeleton type="text" count={1} height={32} />
                        </div>
                        <div className="bg-[#dfdfe0] h-10 w-32 rounded-lg opacity-70 dark:opacity-50 p-1">
                            <Skeleton type="text" count={1} height={32} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBlogSkeleton;
