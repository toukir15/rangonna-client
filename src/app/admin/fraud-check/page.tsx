"use client";
import { fraudSchema } from "@admin/@schema/loginSchema/LoginSchema";
import AuthLayout from "@admin/layouts/AuthLayout";
import { createContext, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { ToastService } from "@admin/utils/toastr.service";
import FraudRatioCart from "@admin/components/pages/FraudCheck/FraudRatioCart";
import FraudForm from "@admin/components/pages/FraudCheck/FraudForm";
import FraudSummaryCart from "@admin/components/pages/FraudCheck/FraudSummaryCart";
import FraudCheckTable from "@admin/components/pages/FraudCheck/FraudCheckTable";
import {
  defaultValue,
  IFraudCheckContextInterface,
  ICourierData,
  IFormData,
} from "@admin/@interfaces/fraud-check/fraud-check.interface";

export const FraudCheckContext = createContext(
  {} as IFraudCheckContextInterface
);

const Page: React.FC = () => {
  const baseApi = process.env.NEXT_PUBLIC_FRAUD_BASE_URL;
  const [number, setNumber] = useState<string>("");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [totalOrder, setTotalOrder] = useState<any>();
  const [delivery, setDelivery] = useState<number>(0);
  const ratio = parseInt(totalOrder?.avg_success_rate);
  const [courierData, setCourierData] = useState<ICourierData[]>([
    { courier: "Pathao", delivered: 0, returned: 0, total: 0, ratio: "0%" },
    { courier: "Paperfly", delivered: 0, returned: 0, total: 0, ratio: "0%" },
    { courier: "RedX", delivered: 0, returned: 0, total: 0, ratio: "0%" },
    { courier: "SteadFast", delivered: 0, returned: 0, total: 0, ratio: "0%" },
  ]);

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<IFormData>({
    resolver: yupResolver(fraudSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: IFormData) => {
    setIsSubmit(true);
    const phoneNumber = formData?.phone.slice(-11);
    try {
      const response = await fetch(
        `${baseApi}/check?api=1381e7a82b62ae85aca763ec861bbdd7e7bd6d71&phone=${phoneNumber}`
      );
      if (!response.ok) throw new Error("Failed to fetch fraud data");

      const data = await response.json();
      setNumber(phoneNumber);

      const delivered = data?.data?.reduce(
        (acc: number, item: any) => acc + item.delivered,
        0
      );
      setTotalOrder(data?.summary);
      setDelivery(delivered);
      setCourierData(data?.detailed);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsSubmit(false);
    }
  };

  const handleIconClick = async () => {
    const text = await navigator.clipboard.readText();
    const numericText = text.replace(/\D/g, "");
    if (numericText) {

      setValue("phone", numericText);
    } else {
      ToastService.error("Some went wrong");
    }
  };

  return (
    <AuthLayout>
      <FraudCheckContext.Provider
        value={{
          ratio,
          handleSubmit,
          register,
          formSubmit,
          handleIconClick,
          errors,
          isSubmit,
          number,
          totalOrder,
          delivery,
          courierData,
        }}
      >
        <div className="min-h-[81vh] md:p-6 p-3 max-w-[950px] mx-auto">
          <div className="flex md:flex-row flex-col-reverse  dark:bg-gray-800 bg-white md:p-12 p-4 rounded-lg gap-8 justify-between">
            <FraudRatioCart />
            <div className="md:w-8/12 md:mt-0 mt-4">
              <FraudForm />
              <FraudSummaryCart />
              <FraudCheckTable />
            </div>
          </div>
        </div>
      </FraudCheckContext.Provider>
    </AuthLayout>
  );
};

export default Page;
