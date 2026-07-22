"use client";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
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
  );
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
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
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={150}
            className="text-red-400"
          />
        </div>
      </Alert>
      <NoScrollLayout>
        <div className=" 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="sm:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300 text-nowrap">
                Task List
              </h2>
              <Button
                className="flex items-center !px-2 !bg-indigo-500 !py-1.5"
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                <Icon name={isFilterOpen ? "close" : "filter_alt"} size={20} />
              </Button>
              {permissionList.includes("task_create") && (
                <Button
                  className="!bg-green-200 !text-green-600 !py-1.5 !px-4 text-nowrap"
                  onClick={handleAddClick}
                >
                  Add Task
                </Button>
              )}

            </div>
            <div className="sm:w-80 w-full sm:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>
          {
            isFilterOpen && <div className="md:mt-0 -mt-4">
              <AllFilter
                isWebsiteFilter={true}
                isFilterOpen={isFilterOpen}
                websiteOptions={userOption}
                selectedWebsite={selectedUser}
                setSelectedWebsite={setSelectedUser}
                isStatusFilter={true}
                statusOption={priorityOption}
                selectedStatus={selectedPriority}
                setSelectedStatus={setSelectedPriority}
              />
            </div>
          }
          <div className="lg:mt-0 mt-3">
            <TaskTab
              filter={filter}
              handleFilterChange={handleFilterChange}
              IsSearch={false}
            />
          </div>
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
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
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
