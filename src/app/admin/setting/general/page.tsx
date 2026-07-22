"use client";
import { shopService } from "@admin/@services/apis/SettingsService/Shop.service";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { createContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { generalSchema } from "@admin/@schema/setting/GeneralSetting/generalSchema";
import { generalService } from "@admin/@services/apis/SettingsService/GeneralSettingsService/General.Service";
import GeneralSettingTable from "@admin/components/pages/Settings/GeneralSetting/GeneralSettingTable";
import {
  GeneralSettingContextType,
  IGeneralData,
} from "@admin/@interfaces/setting/general/general.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import GeneralSettingModal from "@admin/components/pages/Settings/GeneralSetting/GeneralSettingDrawer";
import Alert from "@admin/components/core/Aleart/Aleart";

export const GeneralSettingContext = createContext<GeneralSettingContextType>(
  {} as GeneralSettingContextType
);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [openDrawer, setOpenDrawer] = useState<boolean>(false);
  const [items, setItems] = useState<IGeneralData | null>();
  const [drawerMode, setDrawerMode] = useState<"Add" | "Edit">("Add");
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [generalData, setGeneralData] = useState<IGeneralData[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    formState: { errors },
    setValue,
    reset,
    control,
  } = useForm<any>({
    resolver: yupResolver(generalSchema),
    defaultValues: {
      shop_name: "",
      shop_address: "",
      phone: "",
      logo: "",
      website_id: "",
    },
  });

  const handleDrawerSubmit = async (data: any, mode: string) => {
    setIsSubmit(true);
    const formattedData = {
      ...data,
      web_url: data?.web_url?.value || data?.web_url || "", // safely handle both cases
    };
    if (mode === "Edit" && items?._id) {
      shopService
        .updateShop(items?._id, formattedData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setOpenDrawer(false);
            handleGetPermission();
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
      shopService
        .createShop(formattedData)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);

            setOpenDrawer(false);
            handleGetPermission();
            reset();
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

  const handleAddClick = () => {
    setDrawerMode("Add");
    setItems(null);
    setOpenDrawer(true);
  };

  const handleEditClick = (item: any) => {
    setDrawerMode("Edit");
    setItems(item);
    setOpenDrawer(true);
  };

  useEffect(() => {
    handleGetPermission();
  }, []);

  const handleGetPermission = () => {
    setTableLoading(true);
    generalService
      .getGeneral()
      .then((res: any) => {
        if (res?.success) {
          setGeneralData(res.data.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;
    try {
      const res = await shopService.deleteGeneralSetting(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        handleGetPermission();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("An unexpected error occurred");
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(true);
    }
  };

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className="flex items-center p-4 gap-3">
          <h1 className="text-xl font-semibold dark:text-gray-300">
            General Settings
          </h1>
          {permissionList.includes("setting_general_create") && (
            <Button
              onClick={handleAddClick}
              className="!bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
            >
              Add General
            </Button>
          )}
        </div>
      </NoScrollLayout>

      <GeneralSettingContext.Provider
        value={{
          generalData,
          tableLoading,
          handleEditClick,
          openDrawer,
          setOpenDrawer,
          items,
          drawerMode,
          handleDrawerSubmit,
          handleSubmit,
          register,
          reset,
          errors,
          isSubmit,
          setValue,
          setModalOpen,
          modalOpen,
          control,
          handleRemove,
        }}
      >
        <GeneralSettingTable />
        <GeneralSettingModal />
      </GeneralSettingContext.Provider>
    </AuthLayout>
  );
};

export default Page;
