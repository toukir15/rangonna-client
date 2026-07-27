"use client";
import AuthLayout from "@admin/layouts/AuthLayout";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { teamSchema } from "@admin/@schema/teamSchema/teamSchema";
import { IGroupOption } from "@admin/components/pages/Team/Users/TeamDrawer";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { ToastService } from "@admin/utils/toastr.service";
import React, { useEffect, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import SelectComponent from "@admin/components/core/Select/Select";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { Controller } from "react-hook-form";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { formatDateRange } from "@admin/utils/hook.utils";
import { useRouter } from "next/navigation";


const Page: React.FC = () => {
  const router = useRouter()
  const [permissionData, setPermissionData] = useState<IGroupOption[]>([]);
  const [warehouseData, setWarehouseData] = useState<any>();
  const [leavePolicyData, setLeavePolicyData] = useState<any>();
  const [websiteData, setWebsiteData] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<any>({
    resolver: yupResolver(teamSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      permission: "",
      base_salary: "",
      date: "",
      password: "",
      website: null,
    },
  });

  const getWarehouse = () => {
    WarehouseService.getWarehouse()
      .then((res: any) => {
        if (res?.success) {
          setWarehouseData(res?.data.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };
  const getLeavePolicy = () => {
    WarehouseService.getLeavePolicySuggestion()
      .then((res: any) => {
        if (res?.success) {
          setLeavePolicyData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getWebsites = () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          setWebsiteData(Array.isArray(res?.data) ? res.data : []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };


  useEffect(() => {
    TeamService.getPermission({ searchTerm: "", page: 1, limit: 100 })
      .then((res: any) => {
        if (res?.success) {
          setPermissionData(
            res.data.map((p: any) => ({
              value: p._id,
              label: p.name,
            }))
          );
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, []);


  const formSubmit = async (data: any) => {
    setIsSubmit(true);
    const payload = {
      joining_date: formatDateRange(data.date).trim(),
      name: data.name,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password,
      permission: data.permission,
      base_salary: data.base_salary,
      holiday_salary: data.holiday_salary,
      warehouse: data.warehouse.value,
      leave_policy: data.leave_policy.value,
      website: data.website.value,
    };


    TeamService.createTeam(payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          router.push(`/admin/team/member/edit/${res?.data?._id}`)
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };


  const roleOption = [
    { value: "admin", label: "Admin" },
    { value: "call-center", label: "Call-center" },
    { value: "messaging", label: "Messaging" },
    { value: "packaging", label: "Packaging" },
    { value: "team-leader", label: "Team Leader" },
    { value: "showroom", label: "Showroom" },
  ];

  const warehouseDataOption = warehouseData?.map((item: any) => ({
    label: item.title
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));
  const leavePolicyDataOption = leavePolicyData?.map((item: any) => ({
    label: item.title
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));

  const websiteDataOption = websiteData?.map((item: any) => ({
    label: item.web_name || item.web_url || "Website",
    value: item._id,
  }));

  useEffect(() => {
    getWarehouse();
    getLeavePolicy();
    getWebsites();
  }, []);

  const baseSalaryWatch = watch("base_salary");

  useEffect(() => {
    const base = Number(baseSalaryWatch || 0);

    if (!base || isNaN(base)) {
      setValue("holiday_salary", 500 as any);
      return;
    }

    const perDay = base / 30;
    const holidaySalary = perDay < 500 ? 500 : Math.round(perDay);

    setValue("holiday_salary", holidaySalary as any, {
      shouldValidate: true,
      shouldDirty: true,
    });
  }, [baseSalaryWatch, setValue]);
  return (
    <AuthLayout>
      <div className="px-4 py-3">
        <h2 className="text-2xl font-bold">Add Member</h2>
      </div>

      <div className="min-h-[70vh] px-4">
        <form action="" onSubmit={handleSubmit(formSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Warehouse
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="warehouse"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={warehouseDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Warehouse"
                    isRequired
                    className=""
                  />
                )}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm">
                  {(errors.warehouse as any)?.message as string}
                </p>
              )}
            </div>

            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Team
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="website"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={websiteDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Team"
                    isRequired
                    className=""
                  />
                )}
              />
              {errors.website && (
                <p className="text-red-500 text-sm">
                  {(errors.website as any)?.message as string}
                </p>
              )}
            </div>
            <div className="mb-4">
              <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1 ">
                Group{" "}
                <span className="text-red-400 text-[12px] font-semibold">
                  *
                </span>
              </p>
              <Controller
                name="permission"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={permissionData}
                    value={
                      permissionData.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={(val: IGroupOption) => field.onChange(val?.value)}
                    placeholder="Select Group"
                    isRequired
                  />
                )}
              />
              {errors.permission && (
                <p className="text-red-500 text-sm">
                  {errors.permission.message as string}
                </p>
              )}
            </div>

            <div>
              <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Role{" "}
                <span className="text-red-400 text-[12px] font-semibold">
                  *
                </span>
              </p>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={roleOption}
                    value={
                      roleOption.find((opt) => opt.value === field.value) ||
                      null
                    }
                    onChange={(val: IGroupOption) => field.onChange(val?.value)}
                    placeholder="Select Role"
                    isRequired
                  />
                )}
              />
              {errors.role && (
                <p className="text-red-500 text-sm">
                  {errors.role.message as string}
                </p>
              )}
            </div>



            <Input
              label="User Name"
              placeholder="Enter user name"
              registerProperty={register("name")}
              errorText={errors?.name?.message}
              isRequired
            />
            <Input
              label="First Name"
              placeholder="Enter first name"
              registerProperty={register("first_name")}
              errorText={errors?.first_name?.message}
              isRequired
            />
            <Input
              label="Last Name"
              placeholder="Enter last name"
              registerProperty={register("last_name")}
              errorText={errors?.last_name?.message}
              isRequired
            />

            <Input
              label="Phone Number"
              placeholder="Enter your number"
              registerProperty={register("phone")}
              errorText={errors?.phone?.message}
              isRequired
              type="number"
            />
            <Input
              label="Email"
              placeholder="Enter email"
              registerProperty={register("email")}
              errorText={errors?.email?.message}
              isRequired
            />
            <div className=" w-full">
              <Input
                label="Base Salary"
                placeholder="Enter your salary"
                registerProperty={register("base_salary")}
                errorText={errors?.base_salary?.message}
                isRequired
                type="number"
              />
            </div>
            <div className="mt-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                Holiday Salary
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Input
                placeholder="Enter holiday salary"
                registerProperty={register("holiday_salary")}
                errorText={errors?.base_salary?.message}
                isRequired
                type="number"
                classNames="!mt-1"
                isDisabled
              />
            </div>

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  selectedDate={field.value}
                  onChange={(date) => field.onChange(date)}
                  label="Joining Date"
                  dateFormat="dd-MM-yy"
                  wrapperClassName="w-full"
                />
              )}
            />

            <Input
              label="Password"
              placeholder="Enter password"
              registerProperty={register("password")}
              errorText={errors?.password?.message}
              type="password"
            />
            <div className="pb-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Leave Policy
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Controller
                name="leave_policy"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <SelectComponent
                    options={leavePolicyDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Leave Policy"
                    isRequired
                    className=""
                  />
                )}
              />
            </div>
          </div>



          <div className="flex justify-end gap-3 mt-6">
            <Button
              className="bg-gray-400"
              onClick={() => router.push("/admin/team/member")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-500 text-white"
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader /> : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Page;
