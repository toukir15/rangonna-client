// Project (populated)
export interface ITaskProject {
  _id: string;
  title: string;
}

// Assigned Employee (populated)
export interface IAssignedEmployee {
  _id: string;
  name: string;
  role: any;
}

export interface Project {
  _id: string;
  title: string;
}

export interface AssignEmployee {
  _id: string;
  name: string;
  role: string;
}

// Main Task interface
export interface ITask {
  _id: string;
  title: string;
  task_no: string;
  start_date: string;
  end_date: string;
  project: Project;
  assign_employee: AssignEmployee[];
  description: string;
  documents: string[];
  priority: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// API Response
export interface ITaskResponse {
  success: boolean;
  message: string;
  data: ITask;
}

export interface TaskNotesResponse {
  success: boolean;
  message: string;
  data: TaskNotesData;
}

export interface TaskNotesData {
  _id: string;
  notes: TaskNote[];
}

export interface TaskNoteUser {
  _id: string;
  name: string;
  role?: string;
  email?: string;
}

export interface TaskNote {
  user: TaskNoteUser | null;
  text: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface TaskStatusResponse {
  success: boolean;
  message: string;
  data: TaskStatusData;
}

export interface TaskStatusData {
  _id: string;
  status: TaskStatus;
}

export type TaskStatus = "pending" | "in-progress" | "on-hold" | "completed";
