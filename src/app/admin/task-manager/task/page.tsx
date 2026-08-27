"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import TaskTable from "@admin/components/pages/TaskManager/Task/TaskTable";
import dynamic from "next/dynamic";
const TaskModal = dynamic(
  () => import("@admin/components/pages/TaskManager/Task/TaskModal"),
  { ssr: false }
);
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import {
  ITask,
  ITaskListResponse,
  TaskContextType,
} from "@admin/@interfaces/taskManager/task/task.interface";
import TaskNoteModal from "@admin/components/pages/TaskManager/Task/NoteModal";
import TaskTab from "@admin/components/pages/TaskManager/Task/TaskTab";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { priorityOption } from "@admin/components/pages/Utilities/paymentData";
import AllFilter from "@admin/components/pages/AllFilter/AllFilter";

export const TaskContext = createContext({} as TaskContextType);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [taskData, setTaskData] = useState<ITask[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [items, setItems] = useState<ITask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Create" | "Edit" | "Duplicate">(
    "Create"
  );  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("task_filter") || "all";
    }
    return "all";
  });

  const [userOption, setUserOption] = useState<SelectOption[]>([]);

  const [selectedUser, setSelectedUser] = useState<SelectOption>({
    value: "all",
    label: "All User",
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>({
    value: "all",
    label: "All",
  });

  const handleAddClick = () => {
    setModalMode("Create");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: ITask) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleDuplicateClick = (task: ITask) => {
    setItems(task);
    setModalMode("Duplicate");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "ProductCategoryPerPage",
      newProductPerPage.toString()
    );
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchTask = () => {
    setTableLoading(true);
    TaskService.getTask({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
      status: filter,
      assign_employee: selectedUser.value,
      priority: selectedPriority.value,
    })
      .then((res: ITaskListResponse) => {
        if (res?.success) {
          setTaskData(res?.data?.data);
          setTotalExpenses(res?.data.meta.total_record);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("ProductBrandPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
    fetchTask();
  }, [
    selectedPriority,
    filter,
    debouncedSearchTerm,
    currentPage,
    productPerPage,
    selectedUser,
  ]);

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;
    try {
      const res = await TaskService.deleteTask(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchTask();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      }
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const handleUpdateNote = (data: any) => {
    setItems(data);
    setIsNoteModalOpen(true);
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
    localStorage.setItem("task_filter", newFilter);
  };

  useEffect(() => {
    TaskService.getAssignEmploySuggestion().then((res: any) => {
      if (res?.success) {
        setUserOption([
          {
            label: "All Users",
            value: "all",
          },
          ...res.data.map((u: any) => ({
            label: u.name,
            value: u._id,
          })),
        ]);
      }
    });
  }, []);
  useTableRefreshRegister(fetchTask);

  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
        isLoading={tableLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex flex-wrap items-center items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Task List"
          action={
            permissionList.includes("task_create") ? (
              <Button
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Task
              </Button>
            ) : undefined
          }
        />

        <div className="mb-3">
          <TaskTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            IsSearch={false}
          />
        </div>

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Task records</p>
            <p className="premium-table-toolbar-meta">
              {totalExpenses.toLocaleString()}{" "}
              {totalExpenses === 1 ? "task" : "tasks"}
            </p>
          </div>

          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              <label className="data-table-search">
                <Icon name="search" variant="outlined" size={18} />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search..."
                />
              </label>
              <AllFilter
                isStatusFilter={true}
                statusOption={userOption}
                selectedStatus={selectedUser}
                setSelectedStatus={setSelectedUser}
                isOrderStatusFilter={true}
                orderStatusOptions={priorityOption}
                selectedOrderStatus={selectedPriority}
                setSelectedOrderStatus={setSelectedPriority}
              />
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchTask}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TaskContext.Provider
            value={{
              taskData,
              tableLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              isModalOpen,
              fetchTask,
              handleUpdateNote,
              isNoteModalOpen,
              setIsNoteModalOpen,
              handleDuplicateClick,
            }}
          >
            <TaskTable />
            <TaskModal />
            <TaskNoteModal />
          </TaskContext.Provider>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalExpenses}
            isShowText={true}
            onRefresh={fetchTask}
            isLoading={tableLoading}
            showRefresh={false}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
