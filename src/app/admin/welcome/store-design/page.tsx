"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { aboutSchema } from "@admin/@schema/loginSchema/LoginSchema";
import Button from "@admin/components/core/Button/Button";
import Image from "next/image";
import landing from "@admin/assets/images/ecom.jpg";
import { useRouter } from "next/navigation";
import Icon from "@admin/components/core/Icon/Icon";
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
  const [step] = useState(4);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [complete, setComplete] = useState<string>("template");
  const [isImporting, setIsImporting] = useState<boolean>(false);
  const [importingText, setImportingText] = useState<string>("Importing");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(aboutSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (templateData: FormValues) => {
    setIsSubmit(true);
    // try {
    //   const response = await fetch(`${baseAPI}/master-user`, {
    //     method: "PATCH",
    //     headers: {
    //       Authorization: `${
    //         token?.accessToken ? token?.accessToken : token?.refreshToken
    //       }`,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({ template: templateData.agreement }),
    //   });
    //   const data = await response.json();

    //   if (data?.success) {
    //     ToastService.success(data?.message);

    //     setComplete("complete-temp");
    //   } else {
    //     ToastService.error(data?.message);
    //   }
    // } catch (err: any) {
    //   ToastService.error(err);
    // } finally {
    //   setIsSubmit(false);
    // }

    AuthService.master_user({ template: templateData.agreement })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);

          setComplete("complete-temp");
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
      value: "fashion ",
      label: "Fashion",
      img: "",
    },
    {
      value: "electronics",
      label: "Electronics",
      img: "",
    },
    {
      value: "health",
      label: "Health",
      img: "",
    },
    {
      value: "furniture",
      label: "Furniture",
      img: "",
    },
  ];

  const handleOptionClick = (value: string) => {
    setSelectedOption(value);
    setValue("agreement", value);
  };

  const handleImportDesign = () => {
    setIsImporting(true);

    setTimeout(() => {
      setIsImporting(false);
      setComplete("");
    }, 3000);
  };

  useEffect(() => {
    if (isImporting) {
      const interval = setInterval(() => {
        setImportingText((prev) => {
          if (prev === "Importing...") return "Importing";
          if (prev === "Importing") return "Importing.";
          if (prev === "Importing.") return "Importing..";
          if (prev === "Importing..") return "Importing...";
          return "Importing";
        });
      }, 500);

      return () => clearInterval(interval);
    }
  }, [isImporting]);

  return (
    <div className={`${complete === "complete-temp" ? "h-auto" : "h-screen"}`}>
      {/* Full-Page Loading Overlay */}
      {isImporting && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-24 w-24 border-t-4  border-b-4 border-white mb-4"></div>
            <p className="text-white text-xl ">{importingText}</p>
          </div>
        </div>
      )}

      <div className="flex items-center w-[900px] mb-5 mx-auto pt-10">
        {steps.map((stepItem, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full text-white font-bold ${step >= stepItem.number ? "bg-green-500" : "bg-gray-300"
                }`}
            >
              {stepItem.number}
            </div>
            <div
              className={`flex items-center justify-center rounded-full mt-20 absolute -ml-8 ${step >= stepItem.number ? "text-green-500" : "text-gray-400"
                }`}
            >
              {stepItem.name}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-64 h-1 ${step > stepItem.number ? "bg-green-500" : "bg-gray-300"
                  }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center">
        <form
          onSubmit={handleSubmit(formSubmit)}
          className="w-[1000px] bg-white p-5 rounded-lg my-14"
        >
          <h2 className="text-2xl font-bold">Choose Template</h2>
          <p>You can always change your store design later.</p>

          {complete === "template" ? (
            <>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {options.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleOptionClick(option.value)}
                    className={`p-4 cursor-pointer rounded-lg  ${selectedOption === option.value
                      ? "bg-green-600 text-white "
                      : "bg-gray-100 hover:bg-gray-200 border "
                      }`}
                  >
                    <Image src={landing} alt={""} />
                    <p className="text-xl mt-4 text-center">{option?.label}</p>
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
            </>
          ) : complete === "complete-temp" ? (
            <>
              <div className="w-full flex items-center gap-5 px-32 mt-5">
                <Button
                  className="w-full bg-gray-400"
                  onClick={() => setComplete("template")}
                >
                  Choose Another Design
                </Button>
                <Button
                  className="w-full bg-green-500"
                  onClick={handleImportDesign}
                  disabled={isImporting}
                >
                  Import Design
                </Button>
              </div>
              <div className="mt-5 px-10">
                <Image src={landing} alt={""} />
              </div>

              <div className="w-full flex items-center gap-5 px-32 mt-5">
                <Button
                  className="w-full bg-gray-400"
                  onClick={() => setComplete("template")}
                >
                  Choose Another Design
                </Button>
                <Button
                  className="w-full bg-green-500"
                  onClick={handleImportDesign}
                  disabled={isImporting}
                >
                  Import Design
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-10">
                <div className="flex justify-center">
                  <div className="bg-green-500 rounded-full w-20 h-20 items-center justify-center flex">
                    <Icon name={"check"} className="text-white " size={50} />
                  </div>
                </div>

                <p className="text-center mt-2">Your Site is Ready</p>
                <div className="flex justify-center">
                  <Button
                    onClick={() =>
                      router.push("/admin/dashboard/all")
                    }
                    type="submit"
                    className=" bg-blue-600 mt-3"
                  >
                    Go To Dashboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default Page;
