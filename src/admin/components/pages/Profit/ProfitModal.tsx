"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { OrderReportProfitService } from "@admin/@services/apis/OrderReport/OrderReportProfit.service";


export interface IAccountFormValues {
    total_courier_amount: number | null;
}
const defaultValue: IAccountFormValues = {
    total_courier_amount: null,
};

const webSchema: yup.ObjectSchema<IAccountFormValues> = yup.object({
    total_courier_amount: yup.number().required("Account no is required"),

});

const ProfitModal = ({ isModalOpen, setIsModalOpen, currenValue, warehouseReport }: any) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);

    const {
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<IAccountFormValues>({
        resolver: yupResolver(webSchema),
        defaultValues: defaultValue,
    });


    const formSubmit = async (formData: IAccountFormValues) => {
        setIsSubmit(true);

        const payload = {
            ...formData,
            total_stock: warehouseReport?.remaining_stock_purchase_value,
            total_deposit_amount: currenValue?.total_deposit_amount,
            total_expense_amount: currenValue?.total_expense_amount,
            total_purchase_due: currenValue?.total_purchase_due,

        };
        OrderReportProfitService.createMontyProfit(payload)
            .then((res: { success: boolean; message: string }) => {
                if (res?.success) {
                    ToastService.success(res.message);
                    // getAccountList();
                    setIsModalOpen(false);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })
            .finally(() => {
                setIsSubmit(false);
                reset();
            });

    };

    return (
        <form onSubmit={handleSubmit(formSubmit)}>
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                width="w-full md:w-3/4"
                maxWidth="max-w-2xl"
            >
                <Modal.Header className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
                        {"Update Monthly Value"}
                    </h3>
                    <Icon
                        name={"close"}
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-600 cursor-pointer"
                    />
                </Modal.Header>
                <Modal.Body>
                    <div className="w-full">
                        <Input
                            label={"Courier Amount"}
                            registerProperty={register("total_courier_amount")}
                            errorText={errors?.total_courier_amount?.message}
                            type="number"
                            isRequired
                            placeholder="Enter courier amount"
                        />

                    </div>
                </Modal.Body>
                <Modal.Footer className="flex justify-end space-x-2">
                    <Button
                        onClick={() => setIsModalOpen(false)}
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
                        ) : (
                            "Create"
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </form>
    );
};

export default ProfitModal;
