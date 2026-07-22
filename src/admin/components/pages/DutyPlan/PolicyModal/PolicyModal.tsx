"use client";
import React, { useEffect, useState } from "react";
import { CompanyPolicyService } from "@admin/@services/apis/DutyPlan/CompanyPolicy/CompanyPolicy.service";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import PolicyDetailsSkeleton from "@admin/components/Skeleton/HolidayShift/PolicySkeleton";
import CustomHTMLParser from "@admin/components/core/HtmlParser/HtmlParser";


type PolicyModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    policyInfo: any;
};

const PolicyModal = ({
    isModalOpen,
    setIsModalOpen,
    policyInfo,
}: PolicyModalProps) => {
    const [singlePolicy, setSinglePolicy] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleClose = () => {
        setIsModalOpen(false);
        setSinglePolicy(null);
    };

    const fetchSingleCompanyPolicy = async () => {
        if (!policyInfo?._id) return;

        try {
            setLoading(true);

            const res: any = await CompanyPolicyService.getSingleCompanyPolicy(
                policyInfo?._id
            );

            if (res?.success) {
                setSinglePolicy(res?.data);
            } else {
                ToastService.error(res?.message || "Failed to load company policy");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isModalOpen && policyInfo?._id) {
            fetchSingleCompanyPolicy();
        }
    }, [isModalOpen, policyInfo?._id]);


    return (
        <Modal
            isOpen={isModalOpen}
            onClose={handleClose}
            width="w-full md:w-3/4 !overflow-hidden max-h-[calc(100vh-3rem)]"
            maxWidth="max-w-4xl"
        >
            <Modal.Header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
                        {singlePolicy?.title || policyInfo?.title || "Company Policy"}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                        View company policy details
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full p-2 text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                    <Icon name="close" />
                </button>
            </Modal.Header>

            <Modal.Body className="overflow-y-auto max-h-[calc(100vh-8rem)]">
                <div className="w-full min-h-72 py-2">
                    {loading ? (
                        <PolicyDetailsSkeleton />
                    ) : singlePolicy ? (
                        <div className="space-y-5">


                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon
                                        name="description"
                                        className="text-gray-700 dark:text-gray-300"
                                    />
                                    <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                                        Policy Description
                                    </h4>
                                </div>
                                <CustomHTMLParser htmlContent={singlePolicy?.description} />
                            </div>
                        </div>
                    ) : (
                        <div className="min-h-60 flex flex-col items-center justify-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                <Icon
                                    name="info"
                                    className="text-gray-500 dark:text-gray-400"
                                />
                            </div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                                No policy data found
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Unable to load this company policy details.
                            </p>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default PolicyModal;