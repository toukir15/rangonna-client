"use client";

import { useEffect, useState } from "react";
import { CompanyService } from "@admin/@services/apis/SettingsService/CompanySettings/company.service";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { IWebsiteOption, SelectOption } from "@admin/@interfaces/common.interface";
import Button from "@admin/components/core/Button/Button";

const Page: React.FC = () => {
  const [data, setData] = useState<any>();
  const [userOptions, setUserOptions] = useState<IWebsiteOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<SelectOption>();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [assignLimit, setAssignLimit] = useState<string>("5");
  const [limitLoading, setLimitLoading] = useState(false);

  const fetData = () => {
    setLoading(true);

    CompanyService.getCompanySetting()
      .then((res: any) => {
        if (res?.success) {
          setData(res.data);
          const limit = Number(res.data?.assign_order_limit);
          setAssignLimit(
            Number.isFinite(limit) && limit >= 1 ? String(Math.floor(limit)) : "5"
          );
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleCompanySetting = (value: boolean) => {
    CompanyService.updateCompanySettings({
      product_stock_setting: {
        is_active: value,
      },
    })
      .then((res: any) => {
        if (res?.success) {
          fetData();
          ToastService.success(res?.message);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      });
  };

  const fetchTeamList = async () => {
    TeamService.getUsers({
      page: 1,
      limit: 50,
    })
      .then((res: any) => {
        if (res?.success) {
          const options = res.data.data.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));

          setUserOptions([...options]);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const handleUserCompanySetting = () => {
    if (!selectedUser?.value) return;

    setSubmitLoading(true);

    CompanyService.updateCompanySettings({
      system_user: selectedUser.value,
    })
      .then((res: any) => {
        if (res?.success) {
          fetData();
          ToastService.success(res?.message);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setSubmitLoading(false);
      });
  };

  const handleAssignOrderLimit = () => {
    const n = Number(assignLimit);
    if (!Number.isFinite(n) || n < 1) {
      ToastService.error("Assign order limit must be at least 1");
      return;
    }

    setLimitLoading(true);
    CompanyService.updateCompanySettings({
      assign_order_limit: Math.floor(n),
    })
      .then((res: any) => {
        if (res?.success) {
          fetData();
          ToastService.success(res?.message || "Assign order limit updated");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setLimitLoading(false);
      });
  };

  useEffect(() => {
    fetData();
    fetchTeamList();
  }, []);

  useEffect(() => {
    if (data?.system_user && userOptions.length > 0) {
      const matchedUser = userOptions.find(
        (user) => user.value === data.system_user._id,
      );

      if (matchedUser) {
        setSelectedUser(matchedUser);
      }
    }
  }, [data, userOptions]);

  const isStockActive = data?.product_stock_setting?.is_active;

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="border-b border-slate-200 bg-white px-4 py-5 dark:border-slate-800 dark:bg-slate-950">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              System Configuration
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white lg:text-2xl">
              Company Setting
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage company stock automation, assign order limit, and default
              system user.
            </p>
          </div>
        </div>
      </NoScrollLayout>

      <div className=" px-4 py-6 dark:bg-slate-950">
        <div className="mx-auto max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-5 dark:border-slate-800 dark:from-slate-900 dark:to-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Company Preferences
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Update core settings used across the system.
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                    isStockActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                  }`}
                >
                  Stock Update {isStockActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                      Product Stock Update
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Enable or disable automatic product stock update.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {isStockActive ? "Enabled" : "Disabled"}
                    </span>
                    <ToggleSwitch
                      isChecked={isStockActive}
                      onToggle={() => handleCompanySetting(!isStockActive)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    Assign Order Limit
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Max pending orders each sales agent can hold while online
                    (Assign Order page).
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-full sm:max-w-xs">
                    <input
                      type="number"
                      min={1}
                      step={1}
                      value={assignLimit}
                      onChange={(e) => setAssignLimit(e.target.value)}
                      disabled={loading || limitLoading}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none ring-blue-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      placeholder="e.g. 5"
                    />
                  </div>

                  <Button
                    className="h-11 rounded-xl bg-blue-700 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    disabled={loading || limitLoading}
                    onClick={handleAssignOrderLimit}
                    type="button"
                  >
                    {limitLoading ? "Saving..." : "Save Limit"}
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-5">
                  <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                    System User
                  </h4>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select default user for company system operations.
                  </p>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-full sm:max-w-md">
                    <SelectComponent
                      options={userOptions}
                      value={selectedUser}
                      onChange={setSelectedUser}
                      placeholder="Select system user"
                      className="w-full"
                    />
                  </div>

                  <Button
                    className="h-11 rounded-xl bg-blue-700 px-6 font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                    disabled={!selectedUser?.value || submitLoading || loading}
                    onClick={handleUserCompanySetting}
                    type="submit"
                  >
                    {submitLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>

                {selectedUser?.label && (
                  <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800 ring-1 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900">
                    Selected user:{" "}
                    <span className="font-semibold">{selectedUser.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
