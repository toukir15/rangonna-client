import {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormReset,
  UseFormSetValue,
} from "react-hook-form";
export interface IFormValues {
  shop_name: string;
  shop_address: string;
  phone: string;
  logo: string;
  web_url?: string;
  website_user_name: string;
}

export interface IGeneralData {
  _id: string;
  logo: string;
  shop_name: string;
  shop_address: string;
  phone: string;
  website_user_name: string;
  web_url: string;
}

type DrawerMode = "Add" | "Edit";
export interface GeneralSettingContextType {
  generalData: IGeneralData[];
  tableLoading: boolean;
  handleEditClick: (item: IGeneralData) => void;
  openDrawer: boolean;
  setOpenDrawer: (val: boolean) => void;
  items: IGeneralData | null | undefined;
  drawerMode: DrawerMode;
  handleDrawerSubmit: (data: any, mode: DrawerMode) => void;
  handleSubmit: UseFormHandleSubmit<any>;
  register: UseFormRegister<any>;
  reset: UseFormReset<any>;
  errors: FieldErrors<any>;
  isSubmit: boolean;
  setValue: UseFormSetValue<any>;
  setModalOpen: (val: boolean) => void;
  modalOpen: boolean;
  control: any;
  handleRemove: any;
}
