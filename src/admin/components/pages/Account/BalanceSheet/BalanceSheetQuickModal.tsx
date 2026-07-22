"use client";

import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";

const BalanceSheetQuickModal = ({
    isModalOpen,
    setIsModalOpen,
    quickId,
}: any) => {
    const [loading, setLoading] = useState(false);
    const [accountData, setAccountData] = useState<any>(null);

    const getReportCategory = async () => {
        try {
            setLoading(true);

            const res = await AccountListService.getSyncBalanceSheet(quickId);

            if (res?.success) {
                setAccountData(res?.data);
            } else {
                ToastService.error(res?.message || "Failed to get report");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen && quickId) {
            getReportCategory();
        }
    }, [isModalOpen, quickId]);

    return (
        <div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-full md:w-3/4"
                maxWidth="max-w-2xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {accountData?.account_name || "Balance Sheet"}
                    </h3>

                    <Icon
                        name="close"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="w-full min-h-72 space-y-6">
                        {loading ? (
                            <p className="text-center text-gray-500">Loading...</p>
                        ) : (
                            <>
                                {/* Deposit Section */}
                                <div>
                                    <h4 className="text-base font-semibold text-green-600 mb-3">
                                        Deposit Sources
                                    </h4>

                                    {accountData?.deposit_payment_source_summary?.length > 0 ? (
                                        <div className="space-y-3">
                                            {accountData.deposit_payment_source_summary.map(
                                                (item: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                                                    >
                                                        <div className="flex items-center gap-2 capitalize">
                                                            <Icon
                                                                name="south_west"
                                                                className="text-green-600"
                                                            />
                                                            <span>{item?.payment_source}</span>
                                                        </div>

                                                        <div className="font-semibold text-green-600">
                                                            ৳ {item?.total?.toLocaleString() || 0}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">No deposit data available</p>
                                    )}
                                </div>

                                {/* Expense Section */}
                                <div>
                                    <h4 className="text-base font-semibold text-red-600 mb-3">
                                        Expense Sources
                                    </h4>

                                    {accountData?.expense_payment_source_summary?.length > 0 ? (
                                        <div className="space-y-3">
                                            {accountData.expense_payment_source_summary.map(
                                                (item: any, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 border rounded-lg dark:border-gray-700"
                                                    >
                                                        <div className="flex items-center gap-2 capitalize">
                                                            <Icon
                                                                name="north_east"
                                                                className="text-red-600"
                                                            />
                                                            <span>{item?.payment_source}</span>
                                                        </div>

                                                        <div className="font-semibold text-red-600">
                                                            ৳ {item?.total?.toLocaleString() || 0}
                                                        </div>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400">No expense data available</p>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default BalanceSheetQuickModal;