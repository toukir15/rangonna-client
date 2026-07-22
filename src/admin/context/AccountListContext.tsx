import { createContext } from "react";
import { IAccount } from "@admin/@interfaces/account/account-list/account-list.interface";

interface IAccountListContext {
  accountListData: IAccount[];
  tableLoading: boolean;
  activeToggleLoading: Record<string, boolean>;
  defaultToggleLoading: Record<string, boolean>;
  toggleIsActive: (item: IAccount) => void;
  toggleIsADefault: (item: IAccount) => void;
  handleEditClick: () => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  modalMode: "Add" | "Edit";
  items: IAccount | null;
  getAccountList: () => void;
  setItems: React.Dispatch<React.SetStateAction<IAccount | null>>;
  isPriorityEditMode: boolean;
  setPriorityListData: React.Dispatch<React.SetStateAction<IAccount[]>>;
}

export const AccountListContext = createContext({} as IAccountListContext);
