"use client";

import React from "react";
import ShopOccasionForm from "@admin/components/pages/CustomerFront/ShopOccasion/ShopOccasionForm";
import AuthLayout from "@admin/layouts/AuthLayout";

const CreateShopOccasionPage = () => {
    return (
        <AuthLayout>
            <ShopOccasionForm mode="create" />
        </AuthLayout>
    );
};

export default CreateShopOccasionPage;
