"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BannerForm, {
    TBannerData,
} from "@admin/components/pages/CustomerFront/Banner/BannerForm";
import { BannerService } from "@admin/@services/apis/CustomerFront/BannerService/Banner.service";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import EditFormSkeleton from "@admin/components/Skeleton/CustomerFront/EditMenuSkeleton";
import Button from "@admin/components/core/Button/Button";

const EditBannerPage = () => {

    const router = useRouter();
    const { eId } = useParams();

    const [loading, setLoading] = useState(true);
    const [bannerData, setBannerData] = useState<TBannerData | null>(null);

    const getSingleBanner = async () => {
        try {
            setLoading(true);

            const res = await BannerService.getSingleBanner(eId);

            if (res?.success) {
                setBannerData(res?.data || null);
            } else {
                ToastService.error(res?.message || "Failed to fetch banner");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to fetch banner");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eId) {
            getSingleBanner();
        }
    }, [eId]);

    if (loading) {
        return <AuthLayout>
            <EditFormSkeleton />
        </AuthLayout>
    }

    if (!bannerData) {
        return (
            <AuthLayout>
                <div className="w-full p-4 md:p-6">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-red-500 mb-4">Banner data not found</p>
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/banner")}
                            className="px-4 py-2 bg-blue-500 text-white"
                        >
                            Back
                        </Button>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return <AuthLayout>
        <BannerForm mode="edit" initialData={bannerData} bannerId={eId} />
    </AuthLayout>;
};

export default EditBannerPage;