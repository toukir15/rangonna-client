"use client";
import React from "react";
import MenuForm from "@admin/components/pages/CustomerFront/Menu/MenuForm";
import AuthLayout from "@admin/layouts/AuthLayout";

const CreateMenuPage = () => {
    return <AuthLayout>
        <MenuForm mode="create" />;
    </AuthLayout>
};

export default CreateMenuPage;