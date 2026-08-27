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
import MenuTable from "@admin/components/pages/CustomerFront/Menu/MenuTable";
import MenuModal from "@admin/components/pages/CustomerFront/Menu/MenuModal";
import { MenuService } from "@admin/@services/apis/CustomerFront/MenuService/Menu.service";
import { useRouter } from "next/navigation";

export const MenuContext = createContext<any>({} as any);

const Page: React.FC = () => {
    const router = useRouter()
    const [productPerPage, setProductPerPage] = useState<number>(10);
    const [tableLoading, setTableLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

    const [menuData, setMenuData] = useState<any[]>([]);
    const [items, setItems] = useState<any>();

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
        router.push("/admin/customer-front/menu/create-menu")
    };

    useEffect(() => {
        const savedExpensesPerPage = localStorage.getItem("reportIssuePerPage");
        if (savedExpensesPerPage) {
            setProductPerPage(Number(savedExpensesPerPage));
        }
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const fetchMenu = () => {
        setTableLoading(true);

        MenuService.getMenu({
            searchTerm: debouncedSearchTerm,
            page: 1,
            limit: 50,
        })
            .then((res: any) => {
                if (res?.success) {
                    setMenuData(res?.data?.data || []);
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
        fetchMenu();
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
            const res = await MenuService.deleteMenu(remove);
            if (res?.success) {
                ToastService.success(res?.message);
                fetchMenu();
            } else {
                ToastService.error(res?.message);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                ToastService.error(err.message);
            }
        } finally {
            setIsAlertOpen(false);
            setRemove(null);
            setTableLoading(false);
        }
    };
  useTableRefreshRegister(fetchMenu);


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
                    Are you sure you want to remove this menu?
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
                    title="Menu Management"
                    action={
                        <Button
                            className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                            onClick={handleAddClick}
                        >
                            <Icon name="add" variant="outlined" size={16} />
                            Add Menu
                        </Button>
                    }
                />

                <div className="data-table-card glass-card rounded-2xl orders-table-shell">
                    <div className="premium-table-toolbar">
                        <p className="premium-table-toolbar-title">Menu records</p>
                        <p className="premium-table-toolbar-meta">
                            {menuData.length.toLocaleString()} items
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
                                onRefresh={fetchMenu}
                                isLoading={tableLoading}
                                className="!h-9"
                            />
                        </div>
                    </div>

                    <MenuContext.Provider
                        value={{
                            menuData,
                            tableLoading,
                            handleEditClick,
                            handleRemove,
                            modalMode,
                            items,
                            setItems,
                            setIsModalOpen,
                            fetchMenu,
                            isModalOpen,
                        }}
                    >
                        <MenuTable />
                        <MenuModal />
                    </MenuContext.Provider>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;