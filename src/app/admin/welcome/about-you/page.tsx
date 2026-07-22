"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { aboutSchema } from "@admin/@schema/loginSchema/LoginSchema";
import Button from "@admin/components/core/Button/Button";
import { useRouter } from "next/navigation";
import { ToastService } from "@admin/utils/toastr.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { AuthService } from "@admin/@services/apis/AuthService/Auth.service";

interface FormValues {
  agreement: string;
}

const defaultValue: FormValues = {
  agreement: "",
};

const steps = [
  { number: 1, name: "Create Shop" },
  { number: 2, name: "About Business" },
  { number: 3, name: "Product Niche" },
  { number: 4, name: "Choose Template" },
];

const Page: React.FC = () => {
  const router = useRouter();
  const [step] = useState(2);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(aboutSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (aboutData: FormValues) => {
    setIsSubmit(true);

    AuthService.master_user({ about: aboutData.agreement })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push("/admin/welcome/product-type");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  const options = [
    {
      value: "i am just getting started",
      label: "I AM JUST GETTING STARTED",
    },
    {
      value: "i have a business but i don't have a website yet",
      label: "I HAVE A BUSINESS BUT I DON'T HAVE A WEBSITE YET",
    },
    {
      value: "i have an ecommerce website on a different system",
      label: "I HAVE AN ECOMMERCE WEBSITE ON A DIFFERENT SYSTEM",
    },
    {
      value: "i am just looking around",
      label: "I AM JUST LOOKING AROUND",
    },
  ];

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
    setValue("agreement", value);
  };

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
              className={`flex items-center justify-center rounded-full mt-20 absolute -ml-8 ${
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
          <h2 className="text-2xl font-bold">About You</h2>

          <div className="space-y-4 mt-4">
            {options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleOptionClick(option.value)}
                className={`p-4 cursor-pointer rounded-lg border-green-400 border ${
                  selectedOption === option.value
                    ? "bg-green-600 text-white border border-green-400"
                    : "bg-gray-100 hover:bg-gray-200 border border-blue-400"
                }`}
              >
                {option.label}
              </div>
            ))}
          </div>

          {errors.agreement && (
            <p className="text-red-500 text-sm mt-2">
              {errors.agreement.message}
            </p>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 mt-6"
            disabled={!selectedOption}
          >
            {isSubmit ? <ButtonLoader /> : "Next"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Page;
