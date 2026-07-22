/* eslint-disable no-unused-vars */
export interface IWarehouse {
  _id: string;
  title: string;
  phone: string;
  address: string;
  email: string;
  is_active: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface WarehouseContextType {
  warehouseData: IWarehouse[];
  tableLoading: boolean;
  toggleIsActive: (item: IWarehouse) => void;
  activeToggleLoading: Record<string, boolean>;
  handleEditClick: (data: IWarehouse) => void;
  handleRemove: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalMode: string;
  items: IWarehouse | null;
  getWarehouse: () => void;
}
