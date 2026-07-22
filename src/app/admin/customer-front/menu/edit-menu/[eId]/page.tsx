"use client";

import React, { useEffect, useState } from "react";
import MenuForm, { TMenuItem } from "@admin/components/pages/CustomerFront/Menu/MenuForm";
import { MenuService } from "@admin/@services/apis/CustomerFront/MenuService/Menu.service";
import { ToastService } from "@admin/utils/toastr.service";
import { useParams } from "next/navigation";
import AuthLayout from "@admin/layouts/AuthLayout";
import EditFormSkeleton from "@admin/components/Skeleton/CustomerFront/EditMenuSkeleton";

const EditMenuPage = () => {
    const { eId } = useParams();
    const [loading, setLoading] = useState(true);
    const [menuData, setMenuData] = useState<TMenuItem | null>(null);

    const getSingleMenu = async () => {
        try {
            setLoading(true);

            const res = await MenuService.getSingleMenu(eId);

            if (res?.success) {
                setMenuData(res?.data || null);
            } else {
                ToastService.error(res?.message || "Failed to fetch menu");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to fetch menu");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eId) {
            getSingleMenu();
        }
    }, [eId]);

    if (loading) {
        return (
            <AuthLayout>
                <EditFormSkeleton />
            </AuthLayout>
        );
    }

    if (!menuData) {
        return (
            <AuthLayout>
                <div className="w-full  p-4 md:p-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-red-500">Menu data not found</p>
                    </div>
                </div>
            </AuthLayout>

        );
    }

    return <AuthLayout>
        <MenuForm mode="edit" initialData={menuData} menuId={eId} />
    </AuthLayout>;
};

export default EditMenuPage;