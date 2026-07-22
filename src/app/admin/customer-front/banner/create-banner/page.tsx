"use client";

import React from "react";
import BannerForm from "@admin/components/pages/CustomerFront/Banner/BannerForm";
import AuthLayout from "@admin/layouts/AuthLayout";

const CreateBannerPage = () => {
    return <AuthLayout>
        <BannerForm mode="create" />;
    </AuthLayout>
};

export default CreateBannerPage;