import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Checkbox from "@admin/components/core/Checkbox/Checkbox";
import Drawer from "@admin/components/core/Drawer/Drawer";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import { ToastService } from "@admin/utils/toastr.service";
import { dispatchPermissionsRefresh } from "@admin/utils/permissionRefresh";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

interface Permission {
  section: string;
  label: string;
  value: string;
}

interface AddRolesDrawerProps {
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
  permissions: Permission[];
  drawerMode: any;
  handleGetPermission: any;
  initialValues?: any;
}

const defaultValue: any = {
  group_name: "",
  dashboard: [],
  incomplete: [],
  product: [],
  description: "",
};

const webSchema = yup.object({
  group_name: yup.string().required("Group name is required"),
  description: yup.string().required("Description name is required"),
  dashboard: yup.array().of(yup.string()),
  incomplete: yup.array().of(yup.string()),
  product: yup.array().of(yup.string()),
});

const AddRolesDrawer: React.FC<AddRolesDrawerProps> = ({
  openDrawer,
  setOpenDrawer,
  permissions,
  drawerMode,
  handleGetPermission,
  initialValues,
}) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Record<string, string[]>
  >({});

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const transformPermissions = (permissions: string[]) => {
    const result: Record<string, string[]> = {};

    permissions.forEach((permission) => {
      if (permission.includes("_")) {
        const [section, value] = permission.split("_");
        if (!result[section]) {
          result[section] = [];
        }
        result[section].push(value);
      } else {
        if (!result[permission]) {
          result[permission] = [];
        }
        result[permission].push(permission);
      }
    });

    return result;
  };

  useEffect(() => {
    if (drawerMode === "Edit" && initialValues) {
      const transformedPermissions = transformPermissions(
        initialValues.permissions
      );

      reset({
        group_name: initialValues.name,
        description: initialValues.description,
        ...transformedPermissions,
      });

      setSelectedPermissions(transformedPermissions);
    } else {
      reset(defaultValue);
      setSelectedPermissions({});
    }
  }, [drawerMode, initialValues, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const formattedPermissions = Object.entries(formData)
      .filter(
        ([key, value]) =>
          key !== "group_name" && Array.isArray(value) && value.length > 0
      )
      .flatMap(([section, values]) => {
        return (values as string[]).map((value) => {
          if (
            section === "dashboard" ||
            section === "role" ||
            section === "settings" ||
            section === "fraud_checker" ||
            section === "stocky"
          ) {
            return value;
          }

          return `${section}_${value}`;
        });
      });

    const formattedData = {
      name: formData.group_name,
      description: formData.description,
      permissions: formattedPermissions,
    };

    if (drawerMode === "Edit" && initialValues) {
      TeamService.updatePermission(initialValues._id, formattedData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            handleGetPermission();
            dispatchPermissionsRefresh();
            setOpenDrawer(false);
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
    } else {
      TeamService.createPermission(formattedData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            handleGetPermission();
            dispatchPermissionsRefresh();
            setOpenDrawer(false);
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
    }
  };

  const handleParentCheckboxChange = (section: string, isChecked: boolean) => {
    const childPermissions = groupedPermissions[section].map((p) => p.value);
    setValue(section, isChecked ? childPermissions : []);

    setSelectedPermissions((prev) => ({
      ...prev,
      [section]: isChecked ? childPermissions : [],
    }));
  };

  const handleChildCheckboxChange = (
    section: string,
    value: string,
    isChecked: boolean
  ) => {
    const updatedPermissions = isChecked
      ? [...(selectedPermissions[section] || []), value]
      : (selectedPermissions[section] || []).filter((v) => v !== value);

    setValue(section, updatedPermissions);

    setSelectedPermissions((prev) => ({
      ...prev,
      [section]: updatedPermissions,
    }));

    const allChecked = groupedPermissions[section].every((p) =>
      updatedPermissions.includes(p.value)
    );
    setValue(`${section}_parent`, allChecked);
  };

  const groupedPermissions = permissions?.reduce((acc, permission) => {
    if (!acc[permission.section]) {
      acc[permission.section] = [];
    }
    acc[permission.section].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <form onSubmit={handleSubmit(formSubmit)} className="">
      <Drawer
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        className="lg:ps-10 xs:ps-6 py-5"
      >
        <Drawer.Header className="pr-2 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-gray-300">
            {drawerMode === "Edit"
              ? `Update: Call Center Permission`
              : "Create Permission"}
          </h3>
          <Icon
            onClick={() => setOpenDrawer(false)}
            className=" text-gray-600 hover:text-gray-800 cursor-pointer me-5 dark:text-gray-300"
            name={"close"}
          />
        </Drawer.Header>

        <Drawer.Body className="mt-2 mb-5 overflow-y-scroll">
          <div className="mb-8">
            <Input
              label={"Group Name"}
              registerProperty={register("group_name")}
              errorText={errors?.group_name?.message}
              type="text"
              isRequired
              placeholder="Enter your group name"
            />
            <Input
              label={"Description"}
              registerProperty={register("description")}
              errorText={errors?.description?.message}
              type="text"
              isRequired
              placeholder="Enter your description"
            />
          </div>

          {Object.entries(groupedPermissions)?.map(
            ([section, permissions], index) => (
              <div key={index} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-bold capitalize dark:text-gray-300">
                    {section}
                  </p>
                  <input
                    type="checkbox"
                    className="form-checkbox h-3.5 w-3.5 text-blue-600 hover:!cursor-pointer"
                    checked={
                      (selectedPermissions[section] || []).length ===
                      permissions.length
                    }
                    onChange={(e) =>
                      handleParentCheckboxChange(section, e.target.checked)
                    }
                  />
                </div>
                <div
                  className={`ml-4 ${
                    permissions.length > 3 ? "flex flex-wrap " : ""
                  }`}
                >
                  {permissions.map((permission, index) => (
                    <div key={index} className="mb-2 flex-1 min-w-[150px]">
                      <Checkbox
                        label={permission?.label}
                        value={permission?.value}
                        checked={(selectedPermissions[section] || []).includes(
                          permission.value
                        )}
                        onChange={(e: any) =>
                          handleChildCheckboxChange(
                            section,
                            permission.value,
                            e.target.checked
                          )
                        }
                        register={register}
                        name={section}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </Drawer.Body>

        <Drawer.Footer className=" flex items-end justify-end">
          <div className="flex gap-3">
            <Button
              className="btn-secondary"
              onClick={() => setOpenDrawer(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmit}
            >
              {isSubmit ? (
                <ButtonLoader className="w-12" />
              ) : drawerMode === "Edit" ? (
                "Update"
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </Drawer.Footer>
      </Drawer>
    </form>
  );
};

export default AddRolesDrawer;
