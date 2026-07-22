"use client";
import Input from "@admin/components/core/Input/Input";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { shopSchema } from "@admin/@schema/loginSchema/LoginSchema";
import Button from "@admin/components/core/Button/Button";
import { useRouter } from "next/navigation";

interface FormValues {
  shop_name: string;
}

const defaultValue: FormValues = {
  shop_name: "",
};

const steps = [
  { number: 1, name: "Create Shop" },
  { number: 2, name: "About Business" },
  { number: 3, name: "Product Niche" },
  { number: 4, name: "Choose Template" },
];

const Page: React.FC = () => {
  const router = useRouter();
  const [step] = useState(1);
  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<any>({
    resolver: yupResolver(shopSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (data: FormValues) => {
    console.log(data);
  };

  setValue("shop_name", "https//:arjun.ecom.com");

  return (
    <div className="h-screen">
      <div className="flex items-center w-[900px] mb-5 mx-auto pt-10">
        {steps.map((stepItem, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${
                step >= stepItem.number ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {stepItem.number}
            </div>
            <div
              className={`flex items-center justify-center rounded-full  mt-20 absolute -ml-8 ${
                step >= stepItem.number ? "text-green-500" : "text-gray-400"
              }`}
            >
              {stepItem.name}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-64 h-1 ${
                  step > stepItem.number ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(formSubmit)}
          className="w-[600px] bg-white p-5 rounded-lg mt-14"
        >
          <h2 className="text-2xl font-bold">Website Address</h2>
          {step === 1 && (
            <Input
              label="Your website address will be:"
              placeholder="Enter your shop name"
              registerProperty={register("shop_name")}
              errorText={errors?.shop_name?.message}
              leftHelpText={"checkbox"}
              type="text"
              isDisabled
            />
          )}
          {/* Add other step forms here */}
          <Button
            onClick={() => router.push("/admin/welcome/about-you")}
            type="submit"
            className="w-full bg-blue-600"
          >
            Next
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
