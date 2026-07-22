"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import DutyTable from "@admin/components/pages/DutyPlan/Duty/DutyTable";
import DutyModal from "@admin/components/pages/DutyPlan/Duty/DutyModal";
import { DutyService } from "@admin/@services/apis/DutyPlan/Duty/Duty.service";
import PageSearch from "@admin/components/core/Search/PageSearch";

export const DutyContext = createContext({} as any);

const Page: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const [productPerPage, setProductPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalProduct, setTotalProduct] = useState<number>(0);
    const totalPages = Math.ceil(totalProduct / productPerPage);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
    const [dutyTimeData, setDutyTimeData] = useState<any[]>([]);
    const [items, setItems] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [remove, setRemove] = useState<string | null>(null);

    const handleEditClick = (data: any) => {
        setItems(data);
        setModalMode("Edit");
        setIsModalOpen(true);
    };

    const handleAddClick = () => {
        setModalMode("Add");
        setIsModalOpen(true);
    };

    const handleProductPerPageChange = (newProductPerPage: number) => {
        setProductPerPage(newProductPerPage);
        localStorage.setItem("productListPerPage", newProductPerPage.toString());
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const getDeposit = () => {
        setTableLoading(true);
        DutyService.getDuty({
            searchTerm: debouncedSearchTerm,
            page: currentPage,
            limit: productPerPage,
        })
            .then((res: any) => {
                if (res?.success) {
                    setDutyTimeData(res?.data.data);
                    setTotalProduct(res?.data.meta.total_record);
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

    useEffect(() => {
        getDeposit();
    }, [debouncedSearchTerm, currentPage, productPerPage]);

    const handleRemove = (id: string) => {
        setRemove(id);
        setIsAlertOpen(true);
    };

    const cancelRemove = () => {
        setIsAlertOpen(false);
        setRemove(null);
    };

    const confirmRemove = async () => {
        setTableLoading(true);
        if (!remove) return;
        try {
            const res = await DutyService.deleteDuty(remove);
            if (res?.success) {
                ToastService.success(res?.message);
                getDeposit();
            } else {
                ToastService.error(res?.message);
            }
        } catch (err: any) {
            ToastService.error(err.message);
        } finally {
            setIsAlertOpen(false);
            setRemove(null);
            setTableLoading(false);
        }
    };

    return (
        <AuthLayout>
            <Alert
                isOpen={isAlertOpen}
                confirmLabel="Yes, Remove"
                cancelLabel="Cancel"
                onConfirm={confirmRemove}
                onCancel={cancelRemove}
                isLoading={tableLoading}
            >
                <h3 className="text-2xl font-bold">Confirm Delete</h3>
                <h6 className="text-md my-4">
                    Are you sure you want to remove this group?
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
                    <div className="md:flex items-center gap-3">
                        <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
                            Roster Plan
                        </h2>
                        {hasPermission(permissionList, "roster_plan_create") && (
                            <Button
                                className="!bg-green-200 !text-green-600 !py-1.5 !px-4"
                                onClick={handleAddClick}
                            >
                                Add Roster
                            </Button>
                        )}
                        <div className="md:w-80 w-full md:my-0 my-2">
                            <PageSearch
                                value={searchTerm}
                                onChange={handleSearchChange}
                                wrapperClass="w-full"
                            />
                        </div>
                    </div>
                </div>
            </NoScrollLayout>

            <div className="min-h-[75vh] 2xl:px-4 px-3">
                <div className="xl:mt-3 mt-2">
                    <DutyContext.Provider
                        value={{
                            dutyTimeData,
                            tableLoading,
                            handleEditClick,
                            handleRemove,
                            modalMode,
                            items,
                            setIsModalOpen,
                            isModalOpen,
                            getDeposit,
                        }}
                    >
                        <DutyTable />
                        <DutyModal />
                    </DutyContext.Provider>

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
