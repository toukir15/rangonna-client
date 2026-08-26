"use client";

import React from "react";
import CustomerLoveForm from "@admin/components/pages/CustomerFront/CustomerLove/CustomerLoveForm";
import AuthLayout from "@admin/layouts/AuthLayout";

const CreateCustomerLovePage = () => {
    return (
        <AuthLayout>
            <CustomerLoveForm mode="create" />
        </AuthLayout>
    );
};

export default CreateCustomerLovePage;
