"use client";
import React, { useContext, useEffect, useState } from "react";
import { FormValues } from "@admin/@interfaces/team/team.interface";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Switch from "@admin/components/core/SwitchButton/Switch";
import SelectComponent from "@admin/components/core/Select/Select";
import { ToastService } from "@admin/utils/toastr.service";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import { TeamContext } from "@/app/admin/team/member/page";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { Controller } from "react-hook-form";
import { WarehouseService } from "@admin/@services/apis/SettingsService/WarehouseService/Warehouse.service";

export interface IGroupOption {
  value: string;
  label: string;
}

const TeamModal: React.FC = () => {
  const {
    openDrawer,
    setOpenDrawer,
    items,
    drawerMode,
    handleDrawerSubmit,
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    errors,
    isSubmit,
    control,
  } = useContext(TeamContext);

  const [permissionData, setPermissionData] = useState<IGroupOption[]>([]);
  const [warehouseData, setWarehouseData] = useState<any>();

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

  // 🔹 Get permissions from API
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

  // 🔹 Reset form when mode or item changes
  useEffect(() => {
    if (drawerMode === "Edit" && items) {
      const selectedWarehouse = warehouseDataOption?.find(
        (option: any) => option.value === items.warehouse._id
      );
      reset({
        name: items.name || "",
        phone: items.phone || "",
        email: items.email || "",
        permission: items.permission || "",
        role: items.role || "",
        base_salary: items.base_salary || "",
        status: items.status || false,
        warehouse: selectedWarehouse || "",
      });
    } else {
      reset({
        name: "",
        phone: "",
        email: "",
        permission: "",
        role: "",
        status: false,
        base_salary: "",
        password: "",
        warehouse: "",
      });
    }
  }, [drawerMode, items, reset]);

  // 🔹 Submit handler
  const formSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      warehouse: data.warehouse.value,
    };

    try {
      await handleDrawerSubmit(payload, drawerMode);
    } catch (error) {
      console.error(error);
    }
  };

  // 🔹 Role options (static)
  const roleOption = [
    { value: "admin", label: "Admin" },
    { value: "call-center", label: "Call-center" },
    { value: "messaging", label: "Messaging" },
    { value: "packaging", label: "Packaging" },
    { value: "team-leader", label: "Team Leader" },
  ];

  const warehouseDataOption = warehouseData?.map((item: any) => ({
    label: item.title
      .toLowerCase()
      .replace(/\b\w/g, (char: string) => char.toUpperCase()),
    value: item._id,
  }));

  useEffect(() => {
    if (openDrawer) {
      getWarehouse();
    }
  }, [openDrawer]);

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
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        className=" p-5"
      >
        <Modal.Header className="pr-2 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-gray-300">
            {drawerMode === "Edit" ? `Edit: ${items?.name}` : "Add Team Member"}
          </h3>
          <Icon
            className="text-gray-600 hover:text-gray-800 dark:text-gray-300"
            onClick={() => setOpenDrawer(false)}
            name={"close"}
          />
        </Modal.Header>

        <Modal.Body className="mt-2 mb-5 overflow-y-scroll">
          {/* Group (Permission) */}
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
          </div>
          <div className="mb-4">
            <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1 ">
              Group{" "}
              <span className="text-red-400 text-[12px] font-semibold">*</span>
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

          {/* Role */}
          <div>
            <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
              Role{" "}
              <span className="text-red-400 text-[12px] font-semibold">*</span>
            </p>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  options={roleOption}
                  value={
                    roleOption.find((opt) => opt.value === field.value) || null
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

          {/* Name */}
          <Input
            label="User Name"
            placeholder="Enter full name"
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
            placeholder="Enter last_name"
            registerProperty={register("last_name")}
            errorText={errors?.last_name?.message}
            isRequired
          />

          {/* Phone */}
          <Input
            label="Phone Number"
            placeholder="Enter your number"
            registerProperty={register("phone")}
            errorText={errors?.phone?.message}
            isRequired
            type="number"
          />

          {/* Email */}
          <Input
            label="Email"
            placeholder="Enter email"
            registerProperty={register("email")}
            errorText={errors?.email?.message}
            isRequired
          />
          <div className="md:flex items-center gap-4 w-full">
            <div className="md:w-1/2 w-full">
              <Input
                label="Base Salary"
                placeholder="Enter your salary"
                registerProperty={register("base_salary")}
                errorText={errors?.base_salary?.message}
                isRequired
                type="number"
              />
            </div>
            <div className="md:w-1/2 mt-2">
              <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
                Holiday Salary
                <span className="text-red-400 font-inter text-[12px] font-semibold ms-1">
                  *
                </span>
              </label>
              <Input
                // label="Holiday Salary"
                placeholder="Enter holiday salary"
                registerProperty={register("holiday_salary")}
                errorText={errors?.base_salary?.message}
                isRequired
                type="number"
                classNames="!mt-1"
                isDisabled
              />
            </div>
          </div>

          {/* Password (only Add) */}
          {drawerMode !== "Edit" && (
            <Input
              label="Password"
              placeholder="Enter password"
              registerProperty={register("password")}
              errorText={errors?.password?.message}
              type="password"
            />
          )}

          {/* Status */}
          <div className="flex items-center gap-3 mt-4">
            <Switch
              label="IsActive"
              isChecked={watch("status")}
              onChange={(checked) => setValue("status", checked)}
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-3">
          <Button className="btn-secondary" onClick={() => setOpenDrawer(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-blue-500 text-white"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : drawerMode === "Edit" ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default TeamModal;
