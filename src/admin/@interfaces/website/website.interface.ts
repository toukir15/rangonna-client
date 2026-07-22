/* eslint-disable no-unused-vars */

import { IWebsiteResponse } from "../common.interface";

export interface IWebsite {
  webhookStatus: boolean;
  url: string;
  isEnabled: boolean;
}

export interface IWebsiteContext {
  websiteData: IWebsiteResponse[];
  tableLoading: boolean;
  handleEditClick: (data: IWebsiteResponse) => void;
  handleRemove: (id: string) => void;
  modalMode: "Add" | "Edit";
  items: IWebsiteResponse | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  fetchWebsite: () => void;
  isModalOpen: boolean;

  isPriorityEditMode: boolean;
  setPriorityWebsiteData: React.Dispatch<
    React.SetStateAction<IWebsiteResponse[]>
  >;

  activeToggleLoading: any;
  toggleIsActive: any;
}
