"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Alert from "@admin/components/core/Aleart/Aleart";
import LeavePolicyModal from "@admin/components/pages/Team/LeavePolicy/LeavePolicyModal";
import LeavePolicyTable from "@admin/components/pages/Team/LeavePolicy/LeavePolicyTable";
import { LeavePolicyService } from "@admin/@services/apis/TeamService/LeavePolicyService/LeavePolicy.service";
import { ILeavePolicyContext, LeavePolicy, LeavePolicyDeleteResponse, LeavePolicyResponse } from "@admin/@interfaces/team/leavePolicy/leavePolicy.interface";

export const LeavePolicyContext = createContext<ILeavePolicyContext>(
    {} as ILeavePolicyContext
);

const Page = (): JSX.Element => {
    const { permissionList } = useGlobalContext();
    const [productPerPage, setProductPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalProduct, setTotalProduct] = useState<number>(0);
    const totalPages = Math.ceil(totalProduct / productPerPage);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [leaveData, setLeaveData] = useState<LeavePolicy[]>([]);
    const [items, setItems] = useState<LeavePolicy | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
    const [hasMounted, setHasMounted] = useState<boolean>(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState<boolean>(false);
    const [remove, setRemove] = useState<string | null>(null);
    const [removeLoading, setRemoveLoading] = useState<boolean>(false);

    useEffect(() => {
        setHasMounted(true);
        const savedPerPage = localStorage.getItem("SalaryReportPerPage");
        if (savedPerPage) {
            const parsedValue = parseInt(savedPerPage, 10);
            if (!isNaN(parsedValue)) {
                setProductPerPage(parsedValue);
            }
        }
    }, []);

    useEffect(() => {
        if (hasMounted) {
            getSalaryReport();
        }
    }, [currentPage, productPerPage, hasMounted]);

    const handleEditClick = (leave: LeavePolicy) => {
        setItems(leave)
        setModalMode("Edit");
        setIsModalOpen(true);

    };

    const handleAddClick = () => {
        setModalMode("Add");
        setIsModalOpen(true);
    };

    const handleProductPerPageChange = (newProductPerPage: number) => {
        setProductPerPage(newProductPerPage);
        localStorage.setItem("SalaryReportPerPage", newProductPerPage.toString());
        setCurrentPage(1);
    };

    const getSalaryReport = () => {
        setTableLoading(true);
        LeavePolicyService.getLeavePolicy({
            page: currentPage,
            limit: productPerPage,
        })
            .then((res: LeavePolicyResponse) => {
                if (res?.success) {
                    setLeaveData(res?.data?.data);
                    setTotalProduct(res?.data?.meta.total_record);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })
            .finally(() => {
                setTableLoading(false);
            });
    };


    const handleRemove = (id: string) => {
        setRemove(id);
        setIsDeleteAlertOpen(true);
    };

    const cancelRemove = () => {
        setIsDeleteAlertOpen(false);
        setRemove(null);
    };

    const confirmRemove = () => {
        if (!remove) return;
        setRemoveLoading(true);
        LeavePolicyService.deleteLeavePolicy(remove)
            .then((res: LeavePolicyDeleteResponse) => {
                if (res?.success) {
                    getSalaryReport();
                    ToastService.success(res?.message);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: Error) => {
                ToastService.error(err.message);
            })
            .finally(() => {
                setRemoveLoading(false);
                setIsDeleteAlertOpen(false);
                setRemove(null);
            });
    };

    return (
        <AuthLayout>
            <Alert
                isOpen={isDeleteAlertOpen}
                confirmLabel="Yes, Remove"
                cancelLabel="Cancel"
                onConfirm={confirmRemove}
                onCancel={cancelRemove}
                isLoading={removeLoading}
            >
                <h3 className="text-2xl font-bold">Confirm Delete</h3>
                <h6 className="text-md my-4">
                    Are you sure you want to remove this leave policy?
                </h6>
                <div className="flex items-center justify-center my-8">
                    <Icon
                        name="delete"
                        variant="outlined"
                        size={150}
                        className="text-red-400"
                    />
                </div>
            </Alert>
            <NoScrollLayout>
                <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
                    <div className="flex items-center gap-3">
                        <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
                            Leave Policy
                        </h2>
                        {permissionList.includes("leave_policy_create") && (
                            <Button
                                className="!bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
                                onClick={handleAddClick}
                            >
                                Add Policy
                            </Button>
                        )}
                    </div>
                </div>
            </NoScrollLayout>

            <div className="min-h-[75vh] 2xl:px-4 px-3">
                <div className="">
                    <LeavePolicyContext.Provider
                        value={{
                            leaveData,
                            tableLoading,
                            handleEditClick,
                            isModalOpen,
                            setIsModalOpen,
                            modalMode,
                            items,
                            getSalaryReport,
                            setItems,
                            handleRemove,
                        }}
                    >
                        <LeavePolicyModal />
                        <LeavePolicyTable />
                    </LeavePolicyContext.Provider>

                    <PaginationComponent
                        ordersPerPage={productPerPage}
                        handleOrdersPerPageChange={handleProductPerPageChange}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        totalPages={totalPages}
                        totalData={totalProduct}
                    />
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;
