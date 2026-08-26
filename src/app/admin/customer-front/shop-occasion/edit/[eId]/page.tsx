"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShopOccasionForm, {
    TShopOccasionData,
} from "@admin/components/pages/CustomerFront/ShopOccasion/ShopOccasionForm";
import { ShopOccasionService } from "@admin/@services/apis/CustomerFront/ShopOccasionService/ShopOccasion.service";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import EditFormSkeleton from "@admin/components/Skeleton/CustomerFront/EditMenuSkeleton";
import Button from "@admin/components/core/Button/Button";

const EditShopOccasionPage = () => {
    const router = useRouter();
    const { eId } = useParams();

    const [loading, setLoading] = useState(true);
    const [collectionData, setCollectionData] = useState<TShopOccasionData | null>(null);

    const getSingle = async () => {
        try {
            setLoading(true);
            const res = await ShopOccasionService.getSingleShopOccasion(eId);

            if (res?.success) {
                setCollectionData(res?.data || null);
            } else {
                ToastService.error(res?.message || "Failed to fetch shop occasion");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to fetch shop occasion");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eId) {
            getSingle();
        }
    }, [eId]);

    if (loading) {
        return (
            <AuthLayout>
                <EditFormSkeleton />
            </AuthLayout>
        );
    }

    if (!collectionData) {
        return (
            <AuthLayout>
                <div className="w-full p-4 md:p-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-red-500 mb-4">Shop occasion not found</p>
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/shop-occasion")}
                            className="px-4 py-2 bg-blue-500 text-white"
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <ShopOccasionForm
                mode="edit"
                initialData={collectionData}
                occasionId={eId}
            />
        </AuthLayout>
    );
};

export default EditShopOccasionPage;
