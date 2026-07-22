"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Button from "@admin/components/core/Button/Button";
import { yupResolver } from "@hookform/resolvers/yup";
import TermsCheckbox from "@admin/components/core/Checkbox/TermsCheckbox";
import Link from "next/link";
import { ToastService } from "@admin/utils/toastr.service";
import { logInSchema } from "@admin/@schema/loginSchema/LoginSchema";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { ILogin } from "@admin/@interfaces/auth/auth.interface";
import { AuthService } from "@admin/@services/apis/AuthService/Auth.service";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import Cookies from "js-cookie";
import { notifyAuthSessionChanged } from "@admin/utils/authSessionSync";

const defaultValue: ILogin = {
  email_phone: "",
  password: "",
};

const LoginPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchValue = searchParams.get("email") || "";
  const logoutValue = searchParams.get("logout");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const { setToken, bootstrapPermissions, refreshAuthUser, clearAuthData } =
    useGlobalContext();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
  } = useForm<ILogin>({
    resolver: yupResolver(logInSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    setValue("email_phone", searchValue);
  }, [searchValue, setValue]);

  // logout marker thakle auth clear kore url clean kore dibe
  useEffect(() => {
    if (logoutValue !== "1") return;

    clearAuthData();
    router.replace("/admin");
  }, [logoutValue, clearAuthData, router]);

  
  const formSubmit = async (data: ILogin) => {
    try {
      setIsSubmit(true);

      const modifyEmailPhone = data?.email_phone.includes("@")
        ? data.email_phone
        : `88${data?.email_phone}`;

      const updatedData = {
        email_phone: modifyEmailPhone,
        password: data?.password,
      };

      const res: any = await AuthService.login(updatedData);

      if (!res?.success) {
        ToastService.error(res?.message || "Login failed");
        return;
      }

      ToastService.success(res?.message || "Login successful");

      Cookies.set("authToken", res?.data?.accessToken, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });

      Cookies.set("refreshToken", res?.data?.refreshToken, {
        expires: 7,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
      });

      setToken?.(res?.data?.accessToken || null);
      refreshAuthUser();

      try {
        const permRes: any = await GlobalService.getPermission();
        if (permRes?.success) {
          bootstrapPermissions(permRes?.data?.permissions || []);
        }
      } catch {
        // Dashboard will fetch permissions if prefetch fails.
      }

      localStorage.setItem("authInfo", JSON.stringify(res.data));
      notifyAuthSessionChanged();
      router.replace("/admin/holiday-shift");
    } catch (err: any) {
      ToastService.error(err?.message || "Login failed");
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit(formSubmit)}
        className="max-w-md mx-auto dark:bg-gray-800 bg-white p-5 rounded-lg w-96 shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
          Log In
        </h1>

        <Input
          label="Email or Phone"
          placeholder="Enter your email or phone"
          registerProperty={register("email_phone")}
          errorText={errors?.email_phone?.message}
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

        <div className="flex items-center justify-between">
          <TermsCheckbox
            name="terms"
            label="Remember me"
            registerProperty={""}
            errorText={""}
          />
          <h6>
            <small className="text-sm text-gray-600 dark:text-gray-300 font-normal cursor-pointer">
              Forgot Password?
            </small>
          </h6>
        </div>

        <Button
          disabled={isSubmit}
          className="disabled:bg-gray-400 rounded-md px-6 bg-blue-400 flex justify-center font-medium text-white w-full mt-4"
          type="submit"
        >
          {isSubmit ? <ButtonLoader /> : "Log In"}
        </Button>

        <div className="text-center mt-2">
          <Link
            href="/admin/signup"
            className="text-blue-400 dark:text-gray-300 hover:underline text-xs font-medium text-center"
          >
            {`Don't have an account? Sign Up`}
          </Link>
        </div>
      </form>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
};

export default Page;