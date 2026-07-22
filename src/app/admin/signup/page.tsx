"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Button from "@admin/components/core/Button/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import TermsCheckbox from "@admin/components/core/Checkbox/TermsCheckbox";
import Link from "next/link";
import { ToastService } from "@admin/utils/toastr.service";
import { signUpSchema } from "@admin/@schema/signUpSchema/SignUpSchema";
import { ISignUp } from "@admin/@interfaces/auth/auth.interface";
import { AuthService } from "@admin/@services/apis/AuthService/Auth.service";
// import { getCookieeeee } from "@admin/utils";

const defaultValue: ISignUp = {
  name: "",
  phone: "",
  email: "",
  password: "",
  country_phone_code: "+880",
  terms: true,
};

const Page: React.FC = () => {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm<ISignUp>({
    resolver: yupResolver(signUpSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (data: ISignUp) => {
    const updatedData = {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: `88${data.phone}`,
    };
    setIsSubmit(true);

    AuthService.signup(updatedData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          const userData = {
            email: updatedData.email,
            phone: updatedData.phone,
            valid_until: res.data.valid_until,
          };

          localStorage.setItem("signData", JSON.stringify(userData));
          router.push("/admin/verify");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
        // setError("phone", {
        //   type: "string",
        //   message: "Phone no already exist",
        // });
      });
  };

  // useEffect(() => {
  //   const authToken = getCookieeeee("authToken");
  //   if (authToken) router.replace("/admin/notice");
  // }, []);

  return (
    <div className="flex items-center justify-center h-[94vh]">
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="max-w-md mx-auto bg-white dark:bg-gray-700 p-5 shadow-xl rounded-lg w-96"
      >
        <h1 className="text-xl font-semibold text-gray-600 dark:text-gray-300">
          Sign Up
        </h1>
        <Input
          label="Full Name"
          placeholder="Enter full name"
          registerProperty={register("name")}
          errorText={errors?.name?.message}
          type="text"
          isRequired
          classNames="mb-10"
        />
        <Input
          label="Phone Number"
          placeholder="Enter your number"
          registerProperty={register("phone")}
          errorText={errors?.phone?.message}
          isRequired
          leftHelpText={"checkbox"}
          type="number"
        />
        <Input
          label="Email"
          placeholder="Enter your email"
          registerProperty={register("email")}
          errorText={errors?.email?.message}
          isRequired
          leftHelpText={"checkbox"}
          type="text"
        />
        <Input
          label="Password"
          placeholder="Enter password"
          registerProperty={register("password")}
          errorText={errors?.password?.message}
          type="password"
          isRequired
        />

        <TermsCheckbox
          name="terms"
          label="I aggre to the ecom"
          registerProperty={register("terms")}
          errorText={errors?.terms?.message}
          termsLink="/terms-and-conditions"
          linkLabel="Privacy Policy"
          className="mt-4"
        />
        <Button
          disabled={isSubmit || !watch("terms")}
          className={
            "disabled:bg-gray-400 rounded-md px-6 pt-3  bg-blue-400 flex justify-center font-medium text-white w-full mt-4"
          }
          type="submit"
        >
          {isSubmit ? <ButtonLoader /> : "Sign Up"}
        </Button>
        <div className="text-center mt-2">
          <Link
            href="/admin"
            className="text-blue-400 hover:underline text-xs font-medium text-center"
          >
            Already have an account? Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Page;
