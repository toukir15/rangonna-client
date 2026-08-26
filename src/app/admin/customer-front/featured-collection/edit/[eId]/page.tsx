"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import FeaturedCollectionForm, {
    TFeaturedCollectionData,
} from "@admin/components/pages/CustomerFront/FeaturedCollection/FeaturedCollectionForm";
import { FeaturedCollectionService } from "@admin/@services/apis/CustomerFront/FeaturedCollectionService/FeaturedCollection.service";
import { ToastService } from "@admin/utils/toastr.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import EditFormSkeleton from "@admin/components/Skeleton/CustomerFront/EditMenuSkeleton";
import Button from "@admin/components/core/Button/Button";

const EditFeaturedCollectionPage = () => {
    const router = useRouter();
    const { eId } = useParams();

    const [loading, setLoading] = useState(true);
    const [collectionData, setCollectionData] = useState<TFeaturedCollectionData | null>(null);

    const getSingle = async () => {
        try {
            setLoading(true);
            const res = await FeaturedCollectionService.getSingleFeaturedCollection(eId);

            if (res?.success) {
                setCollectionData(res?.data || null);
            } else {
                ToastService.error(res?.message || "Failed to fetch featured collection");
            }
        } catch (err: any) {
            ToastService.error(err?.message || "Failed to fetch featured collection");
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
                        <p className="text-red-500 mb-4">Featured collection not found</p>
                        <Button
                            type="button"
                            onClick={() => router.push("/admin/customer-front/featured-collection")}
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
            <FeaturedCollectionForm
                mode="edit"
                initialData={collectionData}
                collectionId={eId}
            />
        </AuthLayout>
    );
};

export default EditFeaturedCollectionPage;
