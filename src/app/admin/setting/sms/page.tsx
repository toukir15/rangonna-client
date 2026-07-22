"use client";

import { useEffect, useState } from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import { SmsSettingService } from "@admin/@services/apis/SettingsService/SmsSetting/SmsSetting.service";
import { useForm } from "react-hook-form";

type SmsSettingPayload = {
  is_active: boolean;
  api_key: string;
  user_name: string;
  sender: string;
};

const defaultValue: SmsSettingPayload = {
  is_active: false,
  api_key: "",
  user_name: "",
  sender: "",
};

const Page: React.FC = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SmsSettingPayload>({
    defaultValues: defaultValue,
  });

  const fetchData = () => {
    setLoading(true);

    SmsSettingService.getSmsSetting()
      .then((res: any) => {
        if (res?.success) {
          const smsSetting = res?.data;

          const data = {
            is_active: smsSetting?.is_active ?? false,
            api_key: smsSetting?.api_key ?? "",
            user_name: smsSetting?.user_name ?? "",
            sender: smsSetting?.sender ?? "",
          };

          setIsActive(data.is_active);
          reset(data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err?.message || "Failed to fetch SMS setting");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = (data: SmsSettingPayload) => {
    setIsSubmit(true);

    const payload = {
      ...data,
      is_active: isActive,
    };

    SmsSettingService.updateSmsSettings(payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchData();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err?.message || "Failed to update SMS setting");
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit(onSubmit)}>
        <NoScrollLayout>
          <div className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Communication Setup
            </p>

            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-2xl">
              SMS Setting
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Configure SMS gateway credentials and activation status.
            </p>
          </div>
        </NoScrollLayout>

        <div className=" px-4 py-6 dark:bg-slate-950">
          <div className="mx-auto max-w-5xl">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      Gateway Configuration
                    </h3>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Manage SMS provider access information from here.
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                        : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                    }`}
                  >
                    SMS {isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                        SMS Service Status
                      </h4>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Enable or disable SMS service for system notifications.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {isActive ? "Enabled" : "Disabled"}
                      </span>

                      <ToggleSwitch
                        isChecked={isActive}
                        onToggle={() => setIsActive(!isActive)}
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-5">
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                      Provider Credentials
                    </h4>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Enter valid API key, username and sender ID from your SMS
                      provider.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                    <Input
                      label="API Key"
                      registerProperty={register("api_key", {
                        required: "API key is required",
                      })}
                      errorText={errors?.api_key?.message}
                      type="text"
                      isRequired
                      placeholder="Enter API Key"
                    />

                    <Input
                      label="User Name"
                      registerProperty={register("user_name", {
                        required: "User name is required",
                      })}
                      errorText={errors?.user_name?.message}
                      type="text"
                      isRequired
                      placeholder="Enter User Name"
                    />

                    <Input
                      label="Sender"
                      registerProperty={register("sender", {
                        required: "Sender is required",
                      })}
                      errorText={errors?.sender?.message}
                      type="text"
                      isRequired
                      placeholder="Enter Sender ID"
                    />
                  </div>

                  <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Changes will apply after saving the configuration.
                    </p>

                    <Button
                      className="h-11 rounded-xl bg-blue-700 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                      type="submit"
                      disabled={isSubmit || loading}
                    >
                      {isSubmit ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default Page;
