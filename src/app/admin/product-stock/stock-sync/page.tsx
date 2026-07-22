"use client";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useState } from "react";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import { hasPermission } from "@admin/utils";
import { useGlobalContext } from "@admin/context/GlobalContext";

const Page: React.FC = () => {
    const { permissionList } = useGlobalContext();
    const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
    const [syncLoading, setSyncLoading] = useState<boolean>(false);

    const createStockSync = async () => {
        setSyncLoading(true);

        try {
            const res = await WarehouseService.createProductStockSync();
            if (res?.success) {
                ToastService.success(res?.message);
            } else {
                ToastService.error(res?.message);
            }
        } catch (err: any) {
            ToastService.error(err.message);
        } finally {
            setIsAlertOpen(false);

            setSyncLoading(false);
        }
    };

    const cancelRemove = () => {
        setIsAlertOpen(false);
    };

    return (
        <AuthLayout>
            <Alert
                isOpen={isAlertOpen}
                confirmLabel="Yes, Sync"
                cancelLabel="Cancel"
                onConfirm={createStockSync}
                onCancel={cancelRemove}
                isLoading={syncLoading}
            >
                <h3 className="text-2xl font-bold text-center">Stock Update</h3>
                <h6 className="text-md my-4 text-center">
                    Are you sure you want to product stock sync?
                </h6>
                <div className="flex items-center justify-center my-8">
                    <Icon
                        name="sync_alt"
                        variant="outlined"
                        size={130}
                        className="text-blue-400"
                    />
                </div>
            </Alert>

            <div className="2xl:px-4 px-3 relative h-[calc(100vh-3rem)] w-full flex items-center justify-center">
                <div className="flex items-center gap-2">
                    {hasPermission(permissionList, "product_stock_report_sync") && (
                        <Button
                            className="flex items-center bg-blue-500 !px-4"
                            onClick={() => setIsAlertOpen(true)}
                        >
                            <Icon name={"sync"} />
                            <span className="ml-1 text-nowrap">Stock Sync </span>
                        </Button>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;
