"use client";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";

import { AdvanceSalaryService } from "@admin/@services/apis/SalaryManager/AdvanceSalary/AdvanceSalary.service";
import { ToastService } from "@admin/utils/toastr.service";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const defaultValue: any = {
    amount: "",
    note: "",
    payment_method: null,
    trx_id: "",
};

const webSchema = yup.object({
    payment_method: yup.mixed().required("Payment method is required"),
    amount: yup
        .string()
        .required("Amount is required")
        .matches(/^\d+$/, "Amount cannot be negative"),
    note: yup.string(),
    trx_id: yup.string().required("Trx ID is required"),
});

const ReportIssueAdModal = ({
    isModalOpen,
    setIsModalOpen,
    modalMode,
    getAdvanceList,
    singleData,
    advanceData = [],
    fetchAdvanceOrder,
    fetchOrderSumary,
    handleAddNewPayment,
    handleEditPayment,
}: any) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { permissionList, paymentMethodOptions } = useGlobalContext();

    // ✅ clicked row id (Edit button) store here
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
        null
    );

    const {
        handleSubmit,
        register,
        reset,
        control,
        formState: { errors },
        setError,
    } = useForm<any>({
        resolver: yupResolver(webSchema),
        defaultValues: defaultValue,
    });

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPaymentId(null);
        reset(defaultValue);
    };

    useEffect(() => {
        if (!isModalOpen) return;

        if (modalMode === "Edit" && selectedPaymentId) {
            const selectedAdvance = advanceData?.find(
                (a: any) => a?._id === selectedPaymentId
            );

            const selectedPayment = paymentMethodOptions.find(
                (p) => p.value === selectedAdvance?.payment_method
            );

            reset({
                amount: selectedAdvance?.amount ?? "",
                trx_id: selectedAdvance?.trx_id ?? "",
                note: selectedAdvance?.note ?? "",
                payment_method: selectedPayment ?? null,
            });
        } else {
            reset({
                ...defaultValue,
                amount: singleData?.payment?.due ?? "",
            });
        }
    }, [
        isModalOpen,
        modalMode,
        selectedPaymentId,
        advanceData,
        paymentMethodOptions,
        reset,
    ]);

    useEffect(() => {
        if (isModalOpen) {
            fetchAdvanceOrder();
        }
    }, [isModalOpen]);

    const formSubmit = async (formData: any) => {
        setIsSubmit(true);

        const payload = {
            ...formData,
            payment_method: formData.payment_method?.value,
            report_issue: singleData?._id,
            // payment_source: "order-payment",
        };




        if (modalMode === "Edit") {
            const updateId = selectedPaymentId || singleData?._id;

            AdvanceSalaryService.updateReportIssueAdvanceOrder(updateId, payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        fetchAdvanceOrder();
                        closeModal();
                        getAdvanceList();
                        fetchOrderSumary();
                    } else {
                        ToastService.error(res?.message);
                    }
                })
                .catch((err: any) =>
                    ToastService.error(err?.message || "Something went wrong")
                )
                .finally(() => {
                    setIsSubmit(false);
                });
        } else {
            AdvanceSalaryService.createReportIssueAdvanceOrder(payload)
                .then((res: any) => {
                    if (res?.success) {
                        ToastService.success(res?.message);
                        closeModal();
                        getAdvanceList?.();
                        fetchAdvanceOrder?.();
                        fetchOrderSumary?.();
                    } else {
                        ToastService.error(res?.message);
                    }
                })
                .catch((err: any) => {
                    setError("trx_id", {
                        message: `${err?.message || "Failed"} (Ref: ${err?.data?.reference_no || "N/A"
                            })`,
                    });
                })
                .finally(() => {
                    setIsSubmit(false);
                });
        }
    };

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                width="w-full md:w-3/4"
                maxWidth="max-w-4xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            Order Payment
                        </h3>
                        {
                            permissionList.includes("report_issue_payment_create") && <Button
                                type="button"
                                onClick={handleAddNewPayment}
                                className="!text-sm !px-2 !py-1"
                            >
                                Add Payment
                            </Button>
                        }

                    </div>

                    <Icon
                        name="close"
                        onClick={closeModal}
                        className="text-gray-600 cursor-pointer dark:text-gray-300"
                    />
                </Modal.Header>

                <Modal.Body>
                    {modalMode === "View" ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full border border-gray-300">
                                <thead className="bg-gray-200">
                                    <tr>
                                        <th className="border p-2 text-center">Date</th>
                                        <th className="border p-2 text-center">Method</th>
                                        <th className="border p-2 text-center">Amount</th>
                                        <th className="border p-2 text-center">Trx ID</th>
                                        <th className="border p-2 text-center">Note</th>
                                        <th className="border p-2 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {advanceData?.map((item: any) => (
                                        <tr
                                            key={item?._id || item?.reference_no}
                                            className="text-center"
                                        >
                                            <td className="border p-2">
                                                {formatTimeAgo(item?.createdAt)}
                                            </td>

                                            <td className="border p-2">
                                                {item?.payment_method || "-"}
                                            </td>

                                            <td className="border p-2 font-semibold text-green-600">
                                                {item?.amount ?? 0}
                                            </td>

                                            <td className="border p-2">{item?.trx_id || "-"}</td>
                                            <td className="border p-2">{item?.note || "-"}</td>

                                            <td className="border p-2">
                                                {
                                                    permissionList.includes("report_issue_payment_edit") &&
                                                    <div className="flex items-center justify-center">
                                                        {permissionList.includes("order_payment_edit") && (
                                                            <Button
                                                                type="button"
                                                                className="flex items-center bg-white !text-gray-500 !px-3 !py-1"
                                                                onClick={() => {
                                                                    setSelectedPaymentId(item?._id);
                                                                    handleEditPayment?.(item?._id);
                                                                }}
                                                            >
                                                                <Icon name={"edit_document"} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                }

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div>
                            <div className="pb-2">
                                <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                                    Payment Method
                                    <span className="text-red-400 text-[12px] font-semibold ms-1">
                                        *
                                    </span>
                                </label>

                                <Controller
                                    name="payment_method"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectComponent
                                            options={paymentMethodOptions}
                                            value={field.value}
                                            onChange={(val: any) => field.onChange(val)}
                                            placeholder="Select Payment Method"
                                            isRequired
                                        />
                                    )}
                                />

                                {errors?.payment_method && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {errors.payment_method.message as string}
                                    </p>
                                )}
                            </div>

                            <Input
                                label="Amount"
                                registerProperty={register("amount")}
                                errorText={errors.amount?.message}
                                type="number"
                                isRequired
                                // isDisabled
                                placeholder="Enter amount"
                            />

                            <Input
                                label="Trx ID"
                                registerProperty={register("trx_id")}
                                errorText={errors.trx_id?.message}
                                type="text"
                                placeholder="Enter Trx ID"
                                isRequired
                            />

                            <Input
                                label="Note"
                                registerProperty={register("note")}
                                errorText={errors.note?.message}
                                type="textarea"
                                placeholder="Enter note"
                            />
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer className="flex justify-end space-x-2">
                    {modalMode !== "View" && (
                        <>
                            <Button
                                type="button"
                                onClick={closeModal}
                                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
                                disabled={isSubmit}
                            >
                                {isSubmit ? (
                                    <ButtonLoader />
                                ) : modalMode === "Edit" ? (
                                    "Update"
                                ) : (
                                    "Create"
                                )}
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default ReportIssueAdModal;
