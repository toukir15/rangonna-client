"use client";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React from "react";

type DutyQuickModalProps = {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    userInfo: any;
};

const DutyQuickModal = ({
    isModalOpen,
    setIsModalOpen,
    userInfo,
}: DutyQuickModalProps) => {
    const handleClose = () => {
        setIsModalOpen(false);
    };

    return (
        <Modal
            isOpen={isModalOpen}
            onClose={handleClose}
            width="w-full md:w-3/4"
            maxWidth="max-w-4xl"
        >
            <Modal.Header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white uppercase">
                        {userInfo?.shift_time}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300">
                        View all team member information
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

            <Modal.Body>
                <div className="w-full min-h-72 py-2">
                    {userInfo?.team_members?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userInfo?.team_members?.map((user: any, index: number) => (
                                <div
                                    key={user?._id || index}
                                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="h-11 w-11 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                                            <Icon name="person" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-base font-semibold text-gray-900 dark:text-white break-words">
                                                {user?.name || "No Name"}
                                            </h4>

                                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-300 break-all">
                                                {user?.email || "No Email"}
                                            </p>


                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="min-h-60 flex flex-col items-center justify-center text-center">
                            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
                                <Icon
                                    name="group_off"
                                    className="text-gray-500 dark:text-gray-400"
                                />
                            </div>
                            <h4 className="text-base font-semibold text-gray-800 dark:text-white">
                                No team members found
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                This duty does not have any assigned members.
                            </p>
                        </div>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default DutyQuickModal;