"use client";

import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";

const FraudDetectionModal = ({
    isModalOpen,
    setIsModalOpen,
    singleFraudDetectionData,
}: any) => {
    const formatLabel = (value: string) =>
        value?.replace(/_/g, " ")?.replace(/\b\w/g, (char) => char.toUpperCase());

    const formatValue = (value: any) => {
        if (value === null || value === undefined || value === "") return "N/A";
        if (typeof value === "boolean") return value ? "Yes" : "No";
        if (Array.isArray(value)) return `${value.length} item(s)`;
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    const isProductArray = (value: any) =>
        Array.isArray(value) &&
        value.every((item) => typeof item === "object" && item?.product);

    const renderProductTable = (products: any[] = []) => {
        if (!products?.length) {
            return <p className="text-sm text-gray-500 dark:text-gray-400">No products</p>;
        }

        return (
            <div className="overflow-x-auto">
                {products.map((item, index) => (
                    <div key={index} className="border-b border-gray-100 dark:border-gray-800 flex items-center ">
                        <p className="">{item?.product || "N/A"}</p>
                        <p className=" ">- {item?.quantity ?? "N/A"}</p>
                    </div>
                ))}

            </div>
        );
    };

    const changes = singleFraudDetectionData?.changes
        ? Object.entries(singleFraudDetectionData.changes)
        : [];

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            width="w-full md:w-3/4"
            maxWidth="max-w-5xl"
        >
            <Modal.Header className="flex items-start justify-between border-b border-gray-200 pb-4 dark:border-gray-700">
                <div className="pr-4">
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
                        {singleFraudDetectionData?.log_message || "Fraud Detection Details"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Detailed activity log and field changes
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                    <Icon name="close" className="text-gray-600 cursor-pointer dark:text-gray-300" />
                </button>
            </Modal.Header>

            <Modal.Body className="max-h-[75vh] overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Icon name="history" className="text-purple-600 dark:text-purple-400" />
                            <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                Field Changes
                            </h4>
                        </div>

                        {changes.length > 0 ? (
                            <div className="space-y-4">
                                {changes.map(([key, value]: any, index: number) => {
                                    const beforeValue = value?.before;
                                    const afterValue = value?.after;
                                    const isChanged =
                                        JSON.stringify(beforeValue) !== JSON.stringify(afterValue);

                                    return (
                                        <div
                                            key={index}
                                            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                                        >
                                            <div className="mb-3 flex items-center justify-between">
                                                <h5 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                                                    {formatLabel(key)}
                                                </h5>

                                                <span
                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${isChanged
                                                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                >
                                                    {isChanged ? "Modified" : "Unchanged"}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {value?.before !== undefined && (
                                                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-900/10">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <Icon name="remove_circle" className="text-red-600 dark:text-red-400" />
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                                                                Before
                                                            </span>
                                                        </div>

                                                        {isProductArray(beforeValue) ? (
                                                            renderProductTable(beforeValue)
                                                        ) : (
                                                            <p className="break-all text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                {formatValue(beforeValue)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {value?.after !== undefined && (
                                                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900/40 dark:bg-green-900/10">
                                                        <div className="mb-2 flex items-center gap-2">
                                                            <Icon name="check_circle" className="text-green-600 dark:text-green-400" />
                                                            <span className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
                                                                After
                                                            </span>
                                                        </div>

                                                        {isProductArray(afterValue) ? (
                                                            renderProductTable(afterValue)
                                                        ) : (
                                                            <p className="break-all text-sm font-medium text-gray-800 dark:text-gray-200">
                                                                {formatValue(afterValue)}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                                <Icon name="info" className="mx-auto mb-2 text-gray-400" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No change history found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default FraudDetectionModal;