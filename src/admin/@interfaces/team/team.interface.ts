export interface IItems {
  id: number;
  image: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  action: string;
  position: string;
}

export interface ITeamDrawer {
  openDrawer: boolean;
  setOpenDrawer: (open: boolean) => void;
  items: IItems;
}

export interface FormValues {
  name: string;
  phone: string;
  email: string;
  permission: string;
  status: string;
  password: any;
  warehouse: any;
}

export interface ITeamData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string;
  permission: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface TeamManagementContextProps {
  isLoading: boolean;
  teamData: any[];
  handleEditClick: (item: any) => void;
  handleRemove: (id: string) => void;
  isModalOpen: boolean;
  setOpenDrawer: (open: boolean) => void;
  openDrawer: boolean;
  setModalOpen: (open: boolean) => void;
  items: any;
  drawerMode: any;
  handleDrawerSubmit: any;
  handleSubmit: (data: any) => void;
  register: any;
  setValue: (name: string, value: any) => void;
  watch: (name?: string) => any;
  reset: () => void;
  errors: any;
  isSubmit: boolean;
  isAlertOpen: boolean;
  confirmRemove: () => void;
  cancelRemove: () => void;
}
