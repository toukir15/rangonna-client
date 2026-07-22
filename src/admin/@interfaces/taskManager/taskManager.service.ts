export interface ProjectContextType {
  projectData: IProject[];
  tableLoading: boolean;
  handleEditClick: (item: any) => void;
  handleRemove: (id: any) => void;
  modalMode: "create" | "edit" | string;
  items: IProject | any;
  setIsModalOpen: (isOpen: boolean) => void;
  fetchProject: () => void;
  isModalOpen: boolean;
}
export interface IProject {
  _id: string;
  title: string;
  start_date: string; // ISO date string: "2025-02-10"
  end_date: string; // ISO date string: "2025-02-15"
  status: string; // "pending" | "in-progress" | ...
  description: string;
  createdAt: string; // ISO datetime string
  updatedAt: string; // ISO datetime string
}

export interface IProjectListMeta {
  total_record: number;
  total_page: number;
  page: string; // comes as string in your JSON
  limit: string; // comes as string in your JSON
}

export interface IProjectListData {
  data: IProject[];
  meta: IProjectListMeta;
}

export interface IProjectListResponse {
  success: boolean;
  message: string;
  data: IProjectListData;
}
