"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import PageSearch from "@admin/components/core/Search/PageSearch";
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

            <NoScrollLayout>
                <div className="md:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
                    <div className="md:flex items-center gap-3">
                        <div className="flex items-center gap-3">
                            <h2 className="2xl:text-2xl lg:text-xl text-lg font-semibold text-app">
                                Customer Review
                            </h2>
                            <div className="mt-3 md:mt-0 flex items-end justify-end">
                                <Button
                                    className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                                    onClick={handleAddClick}
                                >
                                    <span className="ml-1">Add Review</span>
                                </Button>
                            </div>
                        </div>

                        <div className="md:w-80 w-full md:mt-0 mt-4">
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
