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
import AuthSplitLayout from "@admin/layouts/AuthSplitLayout";

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
    <AuthSplitLayout
      title="Welcome back"
      subtitle="Sign in to your admin account to continue"
    >
      <form onSubmit={handleSubmit(formSubmit)} className="space-y-1">
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

        <div className="flex items-center justify-between pt-1">
          <TermsCheckbox
            name="terms"
            label="Remember me"
            registerProperty={""}
            errorText={""}
          />
          <button
            type="button"
            className="text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            Forgot Password?
          </button>
        </div>

        <Button
          disabled={isSubmit}
          className="mt-5 flex w-full justify-center rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-green-700 disabled:bg-gray-400"
          type="submit"
        >
          {isSubmit ? <ButtonLoader /> : "Sign In"}
        </Button>

        <p className="pt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/admin/signup"
            className="font-medium text-green-600 hover:underline dark:text-green-400"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
};

export default Page;
