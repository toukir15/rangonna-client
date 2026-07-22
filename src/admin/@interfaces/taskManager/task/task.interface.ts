export interface TaskContextType {
  taskData: ITask[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleDuplicateClick: (item: any) => void;
  handleUpdateNote: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: ITask | any;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsNoteModalOpen: (isOpen: boolean) => void;
  fetchTask: () => void;
  isModalOpen: boolean;
  isNoteModalOpen: boolean;
}
export interface MyTaskContextType {
  taskData: ITask[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleUpdateNote: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: ITask | any;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsNoteModalOpen: (isOpen: boolean) => void;
  fetchTask: () => void;
  isModalOpen: boolean;
  isNoteModalOpen: boolean;
}

export enum StatusEnum {
  PENDING = "pending",
  IN_PROGRESS = "in-progress",
  CANCEL = "cancel",
  ON_HOLD = "on-hold",
  COMPLETE = "complete",
}

export enum PriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface ITaskNote {
  user: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProject {
  id: string;
  title: string;
}

export interface ITask {
  _id: string;
  task_no: string;
  title: string;
  start_date: string;
  end_date: string;
  project: IProject;
  assign_employee: string[];
  status: StatusEnum;
  description: string;
  documents: string[];
  priority: PriorityEnum;
  notes: ITaskNote[];
  createdAt: string;
  updatedAt: string;
}

export interface IPaginationMeta {
  total_record: number;
  total_page: number;
  page: string;
  limit: string;
}

export interface ITaskListData {
  data: ITask[];
  meta: IPaginationMeta;
}

export interface ITaskListResponse {
  success: boolean;
  message: string;
  data: ITaskListData;
}
