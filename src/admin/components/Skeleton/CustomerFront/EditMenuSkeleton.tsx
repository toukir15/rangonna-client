import React from "react";
import Skeleton from "../Skeleton";

const EditFormSkeleton: React.FC = () => {
    const menuBlocks = [1, 2];
    const submenuBlocks = [1, 2];

    return (
        <div className="w-full p-4 md:p-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b dark:border-gray-700 px-4 md:px-6 py-4">
                    <Skeleton type="text" count={1} height={26} width={180} />
                    <Skeleton type="text" count={1} height={36} width={100} />
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 space-y-6">
                    {/* Website Field */}
                    <div>
                        <div className="mb-2">
                            <Skeleton type="text" count={1} height={16} width={120} />
                        </div>
                        <div className="bg-[#dfdfe0] dark:bg-gray-800 opacity-70 dark:opacity-50 rounded-lg p-3">
                            <Skeleton type="text" count={1} height={22} width={250} />
                        </div>
                    </div>

                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                        <Skeleton type="text" count={1} height={20} width={160} />
                    </div>

                    {/* Main Menu Blocks */}
                    <div className="space-y-5">
                        {menuBlocks.map((menu) => (
                            <div
                                key={menu}
                                className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4 md:p-5 bg-white dark:bg-gray-900"
                            >
                                {/* Main Menu Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <Skeleton type="text" count={1} height={18} width={140} />
                                    <Skeleton type="text" count={1} height={18} width={70} />
                                </div>

                                {/* Main Menu Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((item) => (
                                        <div key={item}>
                                            <div className="mb-2">
                                                <Skeleton type="text" count={1} height={14} width={90} />
                                            </div>
                                            <div className="bg-[#dfdfe0] dark:bg-gray-800 opacity-70 dark:opacity-50 rounded-lg p-3">
                                                <Skeleton type="text" count={1} height={20} width={180} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Submenu Header */}
                                <div className="flex items-center justify-between mt-6 mb-3">
                                    <Skeleton type="text" count={1} height={16} width={90} />
                                    <Skeleton type="text" count={1} height={30} width={120} />
                                </div>

                                {/* Submenu Blocks */}
                                <div className="space-y-3">
                                    {submenuBlocks.map((sub) => (
                                        <div
                                            key={sub}
                                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <Skeleton type="text" count={1} height={16} width={120} />
                                                <Skeleton type="text" count={1} height={16} width={60} />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[1, 2, 3].map((item) => (
                                                    <div key={item}>
                                                        <div className="mb-2">
                                                            <Skeleton
                                                                type="text"
                                                                count={1}
                                                                height={14}
                                                                width={80}
                                                            />
                                                        </div>
                                                        <div className="bg-[#dfdfe0] dark:bg-gray-700 opacity-70 dark:opacity-50 rounded-lg p-3">
                                                            <Skeleton
                                                                type="text"
                                                                count={1}
                                                                height={20}
                                                                width={160}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add Main Menu Button */}
                    <div className="flex justify-end">
                        <Skeleton type="text" count={1} height={40} width={150} />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 border-t dark:border-gray-700 px-4 md:px-6 py-4">
                    <Skeleton type="text" count={1} height={40} width={100} />
                    <Skeleton type="text" count={1} height={40} width={140} />
                </div>
            </div>
        </div>
    );
};

export default EditFormSkeleton;