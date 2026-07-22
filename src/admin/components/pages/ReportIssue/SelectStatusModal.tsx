"use client";
import React, { useState } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import { useGlobalContext } from "@admin/context/GlobalContext";

type ReportIssueForm = {
    status: { label: string; value: string } | null;
};

const defaultValue: ReportIssueForm = {
    status: null,
};

const webSchema = yup.object({
    status: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required(),
        })
        .nullable()
        .required("Status is required"),
});

const SelectStatusModal = ({
    isModalOpen,
    setIsModalOpen,
    sysId,
    fetchCurrentStatus,
    fetchLogsDetails
}: any) => {
    const [isSubmit, setIsSubmit] = useState(false);
    const { permissionList } = useGlobalContext();

    const {
        handleSubmit,
        control,
        formState: { errors },
        reset,
    } = useForm<any>({
        resolver: yupResolver(webSchema),
        defaultValues: defaultValue,
    });

    const formSubmit = async (formData: any) => {
        try {
            setIsSubmit(true);
            await OrdersService.statusUpdate(sysId, { status: formData.status?.value });
            if (["cancel"].includes(formData.status?.value)) {
                OrdersService.returnStockUpdate(sysId, { status: formData.status?.value });
            }
            reset();
            setIsModalOpen(false);
            fetchCurrentStatus()
            fetchLogsDetails()

        } catch (error) {
            console.error("Submit error:", error);
        } finally {
            setIsSubmit(false);
        }
    };


    // const selectStatus = [
    //     { label: "Pending", value: "pending" },
    //     { label: "To be Paid", value: "waiting-payment" },
    //     { label: "Approved", value: "approved" },
    //     { label: "Printed", value: "printed" },
    //     { label: "R-D", value: "ready-for-box" },
    //     { label: "Transit", value: "in-transit" },
    //     { label: "Follow Up", value: "follow-up" },
    //     { label: "Cancelled", value: "cancel" },
    // ];

    const selectStatus = [
        { label: "Pending", value: "pending", permission: "order_status_pending" },
        { label: "To be Paid", value: "waiting-payment", permission: "order_status_to_be_paid" },
        { label: "Approved", value: "approved", permission: "order_status_approved" },
        { label: "Printed", value: "printed", permission: "order_status_printed" },
        { label: "R-D", value: "ready-for-box", permission: "order_status_rd" },
        { label: "Transit", value: "in-transit", permission: "order_status_transit" },
        { label: "Follow Up", value: "follow-up", permission: "order_status_follow_up" },
        { label: "Cancelled", value: "cancel", permission: "order_status_cancelled" },
    ];

    const filteredStatus = selectStatus.filter((item) =>
        permissionList.includes(item.permission)
    );

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-full md:w-3/4"
                maxWidth="max-w-2xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300">
                        Change Status
                    </h3>
                    <Icon
                        name="close"
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    <div className="w-full gap-5">
                        <div className="mt-5">
                            <div className="pb-4">
                                <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                    Status
                                    <span className="text-red-400 text-[12px] font-semibold ms-1">
                                        *
                                    </span>
                                </label>

                                <Controller
                                    name="status"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectComponent
                                            options={filteredStatus}
                                            value={field.value}
                                            onChange={(selectedOption: any) => {
                                                field.onChange(selectedOption);
                                            }}
                                            placeholder="Select Status"
                                            isRequired
                                        />
                                    )}
                                />

                                {errors?.status?.message && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {String(errors.status.message)}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                        type="button"
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
                        disabled={isSubmit}
                    >
                        {isSubmit ? <ButtonLoader /> : "Update"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default SelectStatusModal;