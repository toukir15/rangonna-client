"use client";
import Input from "@admin/components/core/Input/Input";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { shopSchema } from "@admin/@schema/loginSchema/LoginSchema";
import Button from "@admin/components/core/Button/Button";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { ToastService } from "@admin/utils/toastr.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ICreateStore } from "@admin/@interfaces/auth/auth.interface";
import { AuthService } from "@admin/@services/apis/AuthService/Auth.service";
import Icon from "@admin/components/core/Icon/Icon";

const defaultValue: ICreateStore = {
  name: "",
};

const steps = [
  { number: 1, name: "Create Shop" },
  { number: 2, name: "About Business" },
  { number: 3, name: "Product Niche" },
  { number: 4, name: "Choose Template" },
];

const Page: React.FC = () => {
  const router = useRouter();
  const { baseAPI, token } = useGlobalContext();
  const [step] = useState(1);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [create, setCreate] = useState<string>("create_domain");
  const [response, setResponse] = useState<string>();
  const [preview, setPreview] = useState<string>();
  const [check, setCheck] = useState<any>();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<ICreateStore>({
    resolver: yupResolver(shopSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (shopValue: ICreateStore) => {
    setIsSubmit(true);
    await fetchWebAddress(shopValue);
  };

  useEffect(() => {
    if (create === "complete_domain" && response) {
      const fetchWebAddress = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(
            `${baseAPI}/store/subdomain-suggestion?name=${response}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `${
                  token?.accessToken ? token?.accessToken : token?.refreshToken
                }`,
              },
            }
          );
          const data = await res.json();

          setCheck(data);
        } catch (error: any) {
          ToastService.error(error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchWebAddress();
    }
  }, [response]);

  const fetchWebAddress = async (shopValue: ICreateStore) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${baseAPI}/store/subdomain-suggestion?name=${shopValue?.name}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${
              token?.accessToken ? token?.accessToken : token?.refreshToken
            }`,
          },
        }
      );
      const data = await response.json();
      setResponse(data.data.suggested_subdomains[0]);
      setPreview(data.data.suggested_subdomains[0]);
      setCreate("complete_domain");
    } catch (error: any) {
      ToastService.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = () => {
    AuthService.create_store({ name: response?.split(".")[0] })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push("/admin/welcome/about-you");
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
      {create === "create_domain" ? (
        <div className="flex items-center justify-center">
          <form
            onSubmit={handleSubmit(formSubmit)}
            className="w-[600px] bg-white p-5 rounded-lg mt-14"
          >
            <h2 className="text-2xl font-bold">{steps[step - 1].name}</h2>
            {step === 1 && (
              <Input
                label="Give your shop a beautiful name"
                placeholder="Enter your shop name"
                registerProperty={register("name")}
                errorText={errors?.name?.message}
                isRequired
                leftHelpText={"checkbox"}
                type="text"
              />
            )}
            <Button type="submit" className="w-full bg-blue-600">
              {isSubmit ? <ButtonLoader /> : "Next"}
            </Button>
          </form>
        </div>
      ) : create === "complete_domain" ? (
        <div className="flex items-center justify-center">
          <div className="w-[600px] bg-white p-5 rounded-lg mt-14">
            <h2 className="text-2xl font-bold">Website Address</h2>
            <p className="mb-2">
              Your website address will be:{" "}
              <span className="font-bold underline text-sm text-blue-500">
                {preview && `https://${preview}`}
              </span>
            </p>

            {/* Input with fixed prefix */}
            <div className="flex items-center border border-green-600 w-96 px-3 py-1.5 rounded-lg bg-gray-200">
              <span className="text-gray-500 select-none">https://</span>
              <input
                type="text"
                value={response?.split(".")[0]}
                onChange={(e) => setResponse(e.target.value)}
                className="bg-gray-200 focus:outline-none ml-1 flex-1"
                placeholder="enter-address"
              />
              {isLoading ? (
                <Icon
                  name={"autorenew"}
                  size={16}
                  className={`mr-2 text-gray-500 animate-spin`}
                />
              ) : (
                <Icon
                  name={`${check?.data?.isAvailable ? "task_alt" : "cancel"}`}
                  size={16}
                  className={`mr-2 ${
                    check?.data?.isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                />
              )}

              <span className="text-gray-500 select-none">f.myei.app</span>
            </div>

            <Button
              disabled={!check?.data?.isAvailable || !response}
              className="mt-4"
              onClick={handleUpdate}
            >
              Next
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h1>Something went wrong</h1>
        </div>
      )}
    </div>
  );
};

export default Page;
