export interface ILeavePolicyContext {
    leaveData: LeavePolicy[];
    tableLoading: boolean;
    handleEditClick: (leave: LeavePolicy) => void;
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    modalMode: "Add" | "Edit";
    items: LeavePolicy | null;
    getSalaryReport: () => void;
    setItems: React.Dispatch<React.SetStateAction<LeavePolicy | null>>;
    handleRemove: (id: string) => void;
}

export interface LeavePolicy {
    _id: string;
    title: string;
    monthly_leaves: number;
    createdAt: string;
  }
  
  export interface LeavePolicyMeta {
    total_record: number;
    total_page: number;
    page: number;
    limit: number;
  }
  
  export interface LeavePolicyData {
    data: LeavePolicy[];
    meta: LeavePolicyMeta;
  }
  
  export interface LeavePolicyResponse {
    success: boolean;
    message: string;
    data: LeavePolicyData;
  }

  export interface LeavePolicyDeleteData {
    _id: string;
    title: string;
    monthly_leaves: number;
    createdAt: string; 
    updatedAt: string;
    __v: number;
  }
  
  export interface LeavePolicyDeleteResponse {
    success: boolean;
    message: string;
    data: LeavePolicyDeleteData;
  }