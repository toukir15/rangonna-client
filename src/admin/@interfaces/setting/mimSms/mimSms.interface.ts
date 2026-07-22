export interface IMimSms {
  _id: string;
  title: string;
  message: string;
}

export interface MimSmsContextType {
  mimSmsData: IMimSms[];
  tableLoading: boolean;
  handleEditClick: (data: IMimSms) => void;
  handleRemove: (id: string) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  modalMode: string;
  items: IMimSms | null;
  getMimSms: () => void;
}
