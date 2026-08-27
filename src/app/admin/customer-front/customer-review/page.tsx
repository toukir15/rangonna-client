"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import CustomerLoveTable from "@admin/components/pages/CustomerFront/CustomerLove/CustomerLoveTable";
import { CustomerLoveService } from "@admin/@services/apis/CustomerFront/CustomerLoveService/CustomerLove.service";
import { useRouter } from "next/navigation";

export const CustomerLoveContext = createContext<any>({} as any);

const Page: React.FC = () => {
    const router = useRouter();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [collectionData, setCollectionData] = useState<any[]>([]);
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [remove, setRemove] = useState<string | null>(null);

    const handleAddClick = () => {
        router.push("/admin/customer-front/customer-review/create");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const fetchCollections = () => {
        setTableLoading(true);

        CustomerLoveService.getCustomerLoves({
            searchTerm: debouncedSearchTerm,
            page: 1,
            limit: 50,
        })
            .then((res: any) => {
                if (res?.success) {
                    setCollectionData(res?.data?.data || []);
                } else {
                    ToastService.error(res?.message || "Failed to fetch customer reviews");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err?.message || "Something went wrong");
            })
            .finally(() => {
                setTableLoading(false);
            });
    };

    useEffect(() => {
        fetchCollections();
    }, [debouncedSearchTerm]);

    const handleRemove = (id: string) => {
        setRemove(id);
        setIsAlertOpen(true);
    };

    const cancelRemove = () => {
        setIsAlertOpen(false);
        setRemove(null);
    };

    const confirmRemove = async () => {
        if (!remove) return;

        setTableLoading(true);

        try {
            const res = await CustomerLoveService.deleteCustomerLove(remove);
            if (res?.success) {
                ToastService.success(res?.message || "Customer review deleted successfully");
                fetchCollections();
            } else {
                ToastService.error(res?.message || "Failed to delete customer review");
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastService.error(err.message);
            } else {
                ToastService.error("Something went wrong");
            }
        } finally {
            setIsAlertOpen(false);
            setRemove(null);
            setTableLoading(false);
        }
    };

    useTableRefreshRegister(fetchCollections);

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
                    Are you sure you want to remove this customer review section?
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

            <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
                <PageHeader
                    title="Customer Review"
                    action={
                        <Button
                            className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                            onClick={handleAddClick}
                        >
                            <Icon name="add" variant="outlined" size={16} />
                            Add Review
                        </Button>
                    }
                />

                <div className="data-table-card glass-card rounded-2xl orders-table-shell">
                    <div className="premium-table-toolbar">
                        <p className="premium-table-toolbar-title">Customer review records</p>
                        <p className="premium-table-toolbar-meta">
                            {collectionData.length.toLocaleString()} items
                        </p>
                    </div>

                    <div className="data-table-toolbar">
                        <div className="data-table-toolbar-start">
                            <label className="data-table-search">
                                <Icon name="search" variant="outlined" size={18} />
                                <input
                                    type="search"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Search..."
                                />
                            </label>
                        </div>
                        <div className="data-table-toolbar-end">
                            <TableRefreshButton
                                onRefresh={fetchCollections}
                                isLoading={tableLoading}
                                className="!h-9"
                            />
                        </div>
                    </div>

                    <CustomerLoveContext.Provider
                        value={{
                            collectionData,
                            tableLoading,
                            handleRemove,
                        }}
                    >
                        <CustomerLoveTable />
                    </CustomerLoveContext.Provider>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;
