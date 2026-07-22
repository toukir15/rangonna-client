"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Input from "@admin/components/core/Input/Input";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import AuthLayout from "@admin/layouts/AuthLayout";
import { useRouter } from "next/navigation";
import { permissions } from "@admin/components/pages/Utilities/permission";
import { dispatchPermissionsRefresh } from "@admin/utils/permissionRefresh";

interface Permission {
  sectionName: string;
  section: string;
  label: string;
  value: string;
}

const schema = yup.object({
  group_name: yup.string().required("Group name is required"),
  description: yup.string().required("Description is required"),
});

const defaultValue = {
  group_name: "",
  description: "",
};

export default function CreatePermissionPage() {
  const router = useRouter();
  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: defaultValue,
  });

  const groupedPermissions = useMemo(() => {
    return (permissions || []).reduce(
      (acc, p: Permission) => {
        if (!acc[p.section]) {
          acc[p.section] = {
            sectionName: p.sectionName,
            items: [],
          };
        }
        acc[p.section].items.push(p);
        return acc;
      },
      {} as Record<string, { sectionName: string; items: Permission[] }>,
    );
  }, []);

  const watchedPermissions = watch();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const updated: Record<string, string[]> = {};

    for (const section of Object.keys(groupedPermissions)) {
      const vals = watchedPermissions?.[section];
      if (Array.isArray(vals)) {
        updated[section] = vals;
      }
    }

    setSelectedPermissions((prev) =>
      JSON.stringify(prev) === JSON.stringify(updated) ? prev : updated,
    );
  }, [isMounted, watchedPermissions, groupedPermissions]);

  const handleChildCheckboxChange = (
    section: string,
    value: string,
    isChecked: boolean,
  ) => {
    const current = selectedPermissions[section] || [];
    const updated = isChecked
      ? Array.from(new Set([...current, value]))
      : current.filter((v) => v !== value);

    setValue(section, updated);
    setSelectedPermissions((prev) => ({ ...prev, [section]: updated }));
  };

  const parentRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleParentCheckboxChange = (section: string, isChecked: boolean) => {
    const all = groupedPermissions[section]?.items?.map((p) => p.value) || [];
    const updated = isChecked ? all : [];

    setValue(section, updated);
    setSelectedPermissions((prev) => ({
      ...prev,
      [section]: updated,
    }));
  };

  useEffect(() => {
    Object.entries(groupedPermissions).forEach(([section, data]) => {
      const selected = selectedPermissions[section] || [];
      const parentRef = parentRefs.current[section];

      if (parentRef) {
        parentRef.indeterminate =
          selected.length > 0 && selected.length < data.items.length;
      }
    });
  }, [selectedPermissions, groupedPermissions]);

  const onSubmit = async (formData: any) => {
    setIsSubmit(true);

    const formattedPermissions = Object.entries(formData)
      .filter(
        ([key, val]) =>
          key !== "group_name" && key !== "description" && Array.isArray(val),
      )
      .flatMap(([, values]) => values as string[]);

    const payload = {
      name: formData.group_name,
      description: formData.description,
      permissions: formattedPermissions,
    };

    try {
      const res = await TeamService.createPermission(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Permission created successfully");
        dispatchPermissionsRefresh();
        router.push(`/team/permission/edit-permission/${res?.data?._id}`);
      } else {
        ToastService.error(res?.message || "Failed to create permission");
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong");
    } finally {
      setIsSubmit(false);
    }
  };

  if (!permissions) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading permissions...</p>
      </div>
    );
  }

  return (
    <AuthLayout>
      <div className="p-6">
        <h1 className="text-xl dark:text-gray-300 font-bold mb-4">
          Create Permission Group
        </h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:flex md:gap-6">
            <Input
              label="Group Name"
              registerProperty={register("group_name")}
              errorText={errors?.group_name?.message}
              type="text"
              placeholder="Enter group name"
              isRequired
            />

            <Input
              label="Description"
              registerProperty={register("description")}
              errorText={errors?.description?.message}
              type="text"
              placeholder="Enter description"
              isRequired
            />
          </div>

          <div className="grid xl:grid-cols-6 lg:grid-cols-4 md:grid-cols-3 grid-cols-2 gap-4 pt-5">
            {Object.entries(groupedPermissions).map(([section, data]) => {
              const { sectionName, items: perms } = data;
              const selected = selectedPermissions[section] || [];

              const allChecked = selected.length === perms.length;
              const oneChecked =
                selected.length > 0 && selected.length < perms.length;

              return (
                <div key={section} className="mb-4">
                  <div
                    className={`flex items-center justify-between gap-2 mb-2 p-3 rounded ${
                      allChecked
                        ? "bg-green-200"
                        : oneChecked
                          ? "bg-yellow-100"
                          : "bg-gray-200"
                    }`}
                  >
                    <p className="font-bold capitalize">
                      {sectionName
                        ?.split("_")
                        ?.map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        ?.join(" ")}
                    </p>

                    <input
                      ref={(el) => {
                        parentRefs.current[section] = el;
                      }}
                      type="checkbox"
                      className="cursor-pointer h-4 w-4 accent-blue-500"
                      checked={allChecked}
                      onChange={(e) =>
                        handleParentCheckboxChange(section, e.target.checked)
                      }
                    />
                  </div>

                  <div className="ml-4 gap-2 flex flex-col">
                    {perms.map((p) => (
                      <label
                        key={p.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          value={p.value}
                          checked={selected.includes(p.value)}
                          onChange={(e) =>
                            handleChildCheckboxChange(
                              section,
                              p.value,
                              e.target.checked,
                            )
                          }
                          className="cursor-pointer h-4 w-4 accent-blue-500"
                        />
                        <span className="dark:text-gray-300">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <div className="gap-5 flex items-center">
              <Button
                type="button"
                className="mt-4"
                onClick={() => router.push("/admin/team/permission")}
              >
                Cancel Permission
              </Button>

              <Button
                type="submit"
                className="bg-blue-500 text-white mt-4"
                disabled={isSubmit}
              >
                {isSubmit ? <ButtonLoader /> : "Create Permission"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
