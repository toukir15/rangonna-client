"use client";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { parse, isValid } from "date-fns";
import { useParams, useRouter } from "next/navigation";
import { IGroupOption } from "@admin/components/pages/Team/Users/TeamDrawer";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import SelectComponent from "@admin/components/core/Select/Select";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { ToastService } from "@admin/utils/toastr.service";
import { formatDateRange } from "@admin/utils/hook.utils";
import { dispatchPermissionsRefresh } from "@admin/utils/permissionRefresh";

const editMemberSchema = yup.object({
  name: yup.string().required("User name is required"),
  first_name: yup.string().required("First name is required"),
  last_name: yup.string().required("Last name is required"),
  phone: yup.string().required("Phone number is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  permission: yup.string().required("Group is required"),
  role: yup.string().required("Role is required"),
  warehouse: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required(),
    })
    .nullable()
    .required("Warehouse is required"),
  base_salary: yup
    .number()
    .typeError("Base salary must be a number")
    .required("Base salary is required")
    .min(0, "Base salary cannot be negative"),
  holiday_salary: yup
    .number()
    .typeError("Holiday salary must be a number")
    .required("Holiday salary is required")
    .min(0, "Holiday salary cannot be negative"),
  password: yup.string().nullable(),
  joining_date: yup.date().nullable(),
});

interface FormValues {
  name: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  permission: string;
  role: string;
  warehouse: { label: string; value: string } | null;
  leave_policy: { label: string; value: string } | null;
  base_salary: number | string;
  holiday_salary: number | string;
  password: string;
  joining_date: Date | null;
}

const Page: React.FC = () => {
  const { eId } = useParams();
  const router = useRouter();
  const [permissionData, setPermissionData] = useState<IGroupOption[]>([]);
  const [warehouseData, setWarehouseData] = useState<any[]>([]);
  const [isSubmit, setIsSubmit] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [leavePolicyData, setLeavePolicyData] = useState<any>();

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    watch,
    reset,
    control,
  } = useForm<any>({
    resolver: yupResolver(editMemberSchema),
    defaultValues: {
      name: "",
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      permission: "",
      role: "",
      warehouse: null,
      leave_policy: null,
      base_salary: "",
      holiday_salary: 500,
      password: "",
      joining_date: null,
    },
  });

  const warehouseDataOption =
    warehouseData?.map((item: any) => ({
      label: item?.title
        ?.toLowerCase()
        ?.replace(/\b\w/g, (char: string) => char.toUpperCase()),
      value: item?._id,
    })) || [];
  const leavePolicyDataOption = leavePolicyData?.map((item: any) => ({
    label: item.title
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));
  const roleOption = [
    { value: "admin", label: "Admin" },
    { value: "call-center", label: "Call-center" },
    { value: "messaging", label: "Messaging" },
    { value: "packaging", label: "Packaging" },
    { value: "team-leader", label: "Team Leader" },
    { value: "showroom", label: "Showroom" },
  ];

  const getData = () => {
    TeamService.getUserById(eId)
      .then((res: any) => {
        if (res?.success) {
          setUserData(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const getWarehouse = () => {
    WarehouseService.getWarehouse()
      .then((res: any) => {
        if (res?.success) {
          setWarehouseData(res?.data?.data || []);
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

  useEffect(() => {
    TeamService.getPermission({ searchTerm: "", page: 1, limit: 100 })
      .then((res: any) => {
        if (res?.success) {
          setPermissionData(
            res?.data?.map((p: any) => ({
              value: p?._id,
              label: p?.name,
            })) || [],
          );
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, []);

  useEffect(() => {
    getWarehouse();
    getLeavePolicy();
  }, []);

  useEffect(() => {
    if (eId) getData();
  }, [eId]);

  useEffect(() => {
    if (!userData?._id) return;

    const wh = userData?.warehouse;

    const selectedWarehouse =
      warehouseDataOption?.find((w: any) => w.value === wh?._id) ??
      (wh?._id
        ? {
            label: wh?.title
              ?.toLowerCase()
              ?.replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: wh?._id,
          }
        : null);

    const leavePolicy = userData?.leave_policy;

    const selectedLeavePolicy =
      leavePolicyDataOption?.find((w: any) => w.value === leavePolicy?._id) ??
      (leavePolicy?._id
        ? {
            label: leavePolicy?.title
              ?.toLowerCase()
              ?.replace(/\b\w/g, (c: string) => c.toUpperCase()),
            value: leavePolicy?._id,
          }
        : null);

    let parsedJoiningDate: Date | null = null;

    if (userData?.joining_date) {
      const parsed = parse(userData.joining_date, "dd-MM-yyyy", new Date());
      parsedJoiningDate = isValid(parsed) ? parsed : null;
    }

    reset({
      name: userData?.name ?? "",
      first_name: userData?.first_name ?? "",
      last_name: userData?.last_name ?? "",
      phone: userData?.phone ?? "",
      email: userData?.email ?? "",
      permission: userData?.permission ?? "",
      role: userData?.role ?? "",
      warehouse: selectedWarehouse,
      leave_policy: selectedLeavePolicy,
      base_salary: userData?.base_salary ?? "",
      holiday_salary: userData?.holiday_salary ?? 500,
      password: "",
      joining_date: parsedJoiningDate,
    });
  }, [userData, reset, warehouseData.length, leavePolicyData?.length]);

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

  const formSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const payload = {
      name: data.name,
      joining_date: data.joining_date
        ? formatDateRange(data.joining_date).trim()
        : userData?.joining_date || "",
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      password: data.password || "",
      permission: data.permission,
      base_salary: Number(data.base_salary) || 0,
      holiday_salary: Number(data.holiday_salary) || 0,
      warehouse: data.warehouse?.value,
      leave_policy: data.leave_policy?.value,
    };

    TeamService.updateTeam(eId, payload)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message || "Member updated successfully");
          dispatchPermissionsRefresh();
          // router.back();
        } else {
          ToastService.error(res?.message || "Update failed");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Something went wrong");
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  const formError = (formErrors: any) => {
    const firstError =
      formErrors?.warehouse?.message ||
      formErrors?.permission?.message ||
      formErrors?.role?.message ||
      formErrors?.name?.message ||
      formErrors?.first_name?.message ||
      formErrors?.last_name?.message ||
      formErrors?.phone?.message ||
      formErrors?.email?.message ||
      formErrors?.base_salary?.message ||
      formErrors?.holiday_salary?.message;

    ToastService.error(
      firstError || "Please fill all required fields correctly",
    );
  };

  return (
    <AuthLayout>
      <div className="px-4 py-3">
        <h2 className="text-2xl font-bold">Edit Member</h2>
      </div>

      <div className="min-h-[70vh] px-4">
        <form onSubmit={handleSubmit(formSubmit, formError)}>
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
                render={({ field }) => (
                  <SelectComponent
                    options={warehouseDataOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Warehouse"
                    isRequired
                  />
                )}
              />
              {errors.warehouse && (
                <p className="text-red-500 text-sm">
                  {errors.warehouse.message as string}
                </p>
              )}
            </div>

            <div className="mb-4">
              <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
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

            <div className="w-full">
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
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300">
                Holiday Salary
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Input
                placeholder="Enter holiday salary"
                registerProperty={register("holiday_salary")}
                errorText={errors?.holiday_salary?.message}
                isRequired
                type="number"
                classNames="!mt-1"
                isDisabled
              />
            </div>

            <Controller
              name="joining_date"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  selectedDate={field.value}
                  onChange={(date) => field.onChange(date)}
                  label="Joining Date"
                  dateFormat="dd-MM-yy"
                  wrapperClassName="w-full"
                  // isDisabled
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
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-lg cursor-pointer text-sm"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                router.back();
              }}
            >
              Cancel
            </button>

            <Button
              type="submit"
              className="bg-blue-500 text-white"
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader /> : "Update"}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Page;
