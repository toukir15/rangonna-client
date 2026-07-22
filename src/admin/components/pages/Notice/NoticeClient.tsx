"use client";

import React, { useMemo, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import LiveWatch from "./LiveWatch";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import NoticeSkeleton from "@admin/components/Skeleton/Notice/NoticeSkeleton";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

export type NoticeItem = {
    _id: string;
    title: string;
    description: string;
    permissions: string[];
    createdAt: string;
    seen: boolean;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
    };
};

function NoticeClient() {
    const [productPerPage, setProductPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const { filteredNotices, noticeLoaded, openNoticeModal } = useGlobalContext();

    const totalProduct = filteredNotices.length;
    const totalPages = Math.ceil(totalProduct / productPerPage);

    const paginatedNotices = useMemo(() => {
        const start = (currentPage - 1) * productPerPage;
        const end = start + productPerPage;
        return filteredNotices.slice(start, end);
    }, [filteredNotices, currentPage, productPerPage]);

    const handleProductPerPageChange = (newProductPerPage: number) => {
        setProductPerPage(newProductPerPage);
        localStorage.setItem("AccountCategoryPerPage", newProductPerPage.toString());
        setCurrentPage(1);
    };

    const stripHtml = (html?: string) => {
        if (!html) return "";
        return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
    };

    const getShortDescription = (html?: string, maxLength = 120) => {
        const text = stripHtml(html);
        if (text.length <= maxLength) return text;
        return `${text.slice(0, maxLength)}...`;
    };

    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center px-3 pt-3 mb-2 flex-wrap gap-2">
                    <h2 className="text-xl font-semibold dark:text-gray-400">Notice:</h2>
                    <LiveWatch />
                </div>
            </div>

            <div className="px-3">
                <div className="min-h-[700px] space-y-3">
                    {!noticeLoaded ? (
                        <NoticeSkeleton />
                    ) : paginatedNotices.length > 0 ? (
                        paginatedNotices.map((notice) => (
                            <div
                                key={notice._id}
                                className={`w-full rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 transition-all duration-300 ${notice?.seen
                                    ? "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-300"
                                    }`}
                            >
                                <div className="flex gap-3 items-start">
                                    <div
                                        className={`rounded-full text-center p-3.5 justify-center items-center flex ${notice?.seen
                                            ? "bg-gray-200 dark:bg-gray-700"
                                            : "bg-blue-500 text-white"
                                            }`}
                                    >
                                        <Icon name="notifications_active" />
                                    </div>

                                    <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                                            {notice.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {getShortDescription(notice.description)}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            {formatTimeAgo(notice.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {!notice.seen && (
                                        <span className="text-xs !px-2 !py-1 rounded-full bg-blue-500 text-white">
                                            Unread
                                        </span>
                                    )}

                                    {notice.seen && (
                                        <span className="text-xs !px-2 !py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                                            Read
                                        </span>
                                    )}

                                    <Button
                                        onClick={() => openNoticeModal(notice._id)}
                                        className="flex items-center gap-1 !px-2 !py-1 bg-blue-600"
                                    >
                                        <Icon name="visibility" />
                                        View Details
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="w-full !h-[calc(100vh-14rem)] rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-gray-800/40">

                            {/* Icon */}
                            <div className="w-12 h-12 flex items-center justify-center rounded-full bg-white dark:bg-gray-700 shadow-sm mb-3">
                                <Icon name="notifications_off" className="text-gray-400 dark:text-gray-300" />
                            </div>

                            {/* Title */}
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                                No Notices Found
                            </h3>

                            {/* Description */}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                                There are currently no notices to display. Please check back later.
                            </p>

                        </div>
                    )}
                </div>

                <PaginationComponent
                    ordersPerPage={productPerPage}
                    handleOrdersPerPageChange={handleProductPerPageChange}
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    totalPages={totalPages}
                    totalData={totalProduct}
                />
            </div>
        </>
    );
}

export default NoticeClient;