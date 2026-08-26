"use client";

import React from "react";
import FeaturedCollectionForm from "@admin/components/pages/CustomerFront/FeaturedCollection/FeaturedCollectionForm";
import AuthLayout from "@admin/layouts/AuthLayout";

const CreateFeaturedCollectionPage = () => {
    return (
        <AuthLayout>
            <FeaturedCollectionForm mode="create" />
        </AuthLayout>
    );
};

export default CreateFeaturedCollectionPage;
