"use client";

import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { NoticeService } from "@admin/@services/apis/Notice/Notice.service";
import CustomHTMLParser from "@admin/components/core/HtmlParser/HtmlParser";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import PolicyDetailsSkeleton from "@admin/components/Skeleton/HolidayShift/PolicySkeleton";

type NoticeDetailsType = {
    _id: string;
    title: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt?: string;
    seen: boolean;
    user?: {
        _id?: string;
        name?: string;
        email?: string;
    };
};

type NoticeDetailsProps = {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    fetchNotice: () => Promise<void> | void;
    detailsId: string;
    onCloseNext?: (closedId: string) => void;
};

const NoticeDetails = ({
    isModalOpen,
    setIsModalOpen,
    detailsId,
    fetchNotice,
    onCloseNext,
}: NoticeDetailsProps) => {
    const [notice, setNotice] = useState<NoticeDetailsType | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    const resetState = () => {
        setNotice(null);
        setLoading(false);
        setSubmitLoading(false);
        setIsChecked(false);
    };

    const handleClose = () => {
        const closedId = detailsId;

        setIsModalOpen(false);
        resetState();

        setTimeout(() => {
            onCloseNext?.(closedId);
        }, 120);
    };

    const fetchSingleNotice = async () => {
        if (!detailsId) return;

        try {
            setLoading(true);
            const res: any = await NoticeService.getMyNoticesWithId(detailsId);

            if (res?.success) {
                const noticeData = res?.data || null;
                setNotice(noticeData);
                setIsChecked(!!noticeData?.seen);
            } else {
                ToastService.error(res?.message || "Failed to fetch notice details");
                setNotice(null);
            }
        } catch (err: any) {
            ToastService.error(
                err?.message || "An error occurred while fetching notice details"
            );
            setNotice(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!detailsId) {
            ToastService.error("Notice ID is missing");
            return;
        }

        if (!isChecked) {
            ToastService.error("Please confirm that you have read this notice");
            return;
        }

        try {
            setSubmitLoading(true);

            const res: any = await NoticeService.updateNoticesWithId(detailsId);

            if (res?.success) {
                ToastService.success(res?.message || "Notice updated successfully");

                const closedId = detailsId;

                setIsModalOpen(false);
                resetState();

                await fetchNotice();

                setTimeout(() => {
                    onCloseNext?.(closedId);
                }, 180);
            } else {
                ToastService.error(res?.message || "Failed to update notice");
            }
        } catch (err: any) {
            ToastService.error(
                err?.message || "An error occurred while updating the notice"
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen && detailsId) {
            fetchSingleNotice();
        }

        if (!isModalOpen) {
            resetState();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isModalOpen, detailsId]);

    return (
        <Modal
            isOpen={isModalOpen}
            width="w-full md:w-3/4 !overflow-hidden max-h-[calc(100vh-3rem)]"
            maxWidth="max-w-4xl"
        >
            <Modal.Header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notice?.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                        View full notice information
                    </p>
                </div>

                {notice?.seen && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    >
                        <Icon name="close" />
                    </button>
                )}
            </Modal.Header>

            <Modal.Body className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="w-full">
                    {loading ? (
                        <PolicyDetailsSkeleton />
                    ) : !notice ? (
                        <div className="flex items-center justify-center py-16 text-sm text-gray-600 dark:text-gray-300">
                            No notice data found.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                                <div className="mb-3 flex items-center gap-2">
                                    <Icon name="description" />
                                    <h4 className="text-sm font-semibold">
                                        Description
                                    </h4>
                                </div>

                                <CustomHTMLParser htmlContent={notice.description || ""} />

                                {!notice.seen && (
                                    <label className="flex items-start gap-2 cursor-pointer pt-5">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            onChange={(e) => setIsChecked(e.target.checked)}
                                        />
                                        <span className="text-sm -mt-0.5 text-gray-600 dark:text-gray-300">
                                            I have viewed this notice details and read this notice.
                                        </span>
                                    </label>
                                )}
                            </div>

                            <div className="pb-4">
                                {!notice.seen ? (
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={!isChecked || submitLoading}
                                            className="!bg-blue-600"
                                        >
                                            {submitLoading ? <ButtonLoader /> : "Submit"}
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end">
                                        <Button variant="outline" onClick={handleClose}>
                                            Close
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default NoticeDetails;