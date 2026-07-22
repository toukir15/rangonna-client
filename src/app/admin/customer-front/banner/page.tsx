"use client";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import PageSearch from "@admin/components/core/Search/PageSearch";
import BannerTable from "@admin/components/pages/CustomerFront/Banner/BannerTable";
import BannerModal from "@admin/components/pages/CustomerFront/Banner/BannerModal";
import { BannerService } from "@admin/@services/apis/CustomerFront/BannerService/Banner.service";
import { useRouter } from "next/navigation";

export const BannerContext = createContext<any>({} as any);

const Page: React.FC = () => {
    const router = useRouter()

    const [productPerPage, setProductPerPage] = useState<number>(10);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

    const [bannerData, setBannerData] = useState<any[]>([]);
    const [items, setItems] = useState<any>(null);

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
        router.push("/admin/customer-front/banner/create-banner")
    };

    useEffect(() => {
        const savedPerPage = localStorage.getItem("bannerPerPage");
        if (savedPerPage) {
            setProductPerPage(Number(savedPerPage));
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const fetchBanner = () => {
        setTableLoading(true);

        BannerService.getBanner({
            searchTerm: debouncedSearchTerm,
            page: 1,
            limit: 50,
        })
            .then((res: any) => {
                if (res?.success) {
                    setBannerData(res?.data?.data || []);
                } else {
                    ToastService.error(res?.message || "Failed to fetch banners");
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
        fetchBanner();
    }, [debouncedSearchTerm, productPerPage]);

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
            const res = await BannerService.deleteBanner(remove);
            if (res?.success) {
                ToastService.success(res?.message || "Banner deleted successfully");
                fetchBanner();
            } else {
                ToastService.error(res?.message || "Failed to delete banner");
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
                    Are you sure you want to remove this banner?
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
                            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
                                Banner <span className="text-sm">(Size : Web-300/900px, Mobile-300/680px, TvWeb-300/1280px)</span>
                            </h2>
                            <div className="mt-3 md:mt-0 flex items-end justify-end">
                                <Button
                                    className="flex items-center !bg-green-200 !text-green-600 !px-4 !py-1.5 text-nowrap"
                                    onClick={handleAddClick}
                                >

                                    <span className="ml-1">Add Banner</span>
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
                    <BannerContext.Provider
                        value={{
                            bannerData,
                            tableLoading,
                            handleEditClick,
                            handleRemove,
                            modalMode,
                            items,
                            setItems,
                            setIsModalOpen,
                            fetchBanner,
                            isModalOpen,
                        }}
                    >
                        <BannerTable />
                        <BannerModal />
                    </BannerContext.Provider>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;