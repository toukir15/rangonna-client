"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { ProductCategoryService } from "@admin/@services/apis/ProductService/ProductCategory.service";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import {
  ITask,
  ITaskListResponse,
  MyTaskContextType,
} from "@admin/@interfaces/taskManager/task/task.interface";

import dynamic from "next/dynamic";
const MyTaskModal = dynamic(
  () => import("@admin/components/pages/TaskManager/MyTask/MyTaskModal"),
  { ssr: false }
);

import Button from "@admin/components/core/Button/Button";
import MyTaskTab from "@admin/components/pages/TaskManager/MyTask/MyTaskTab";
import MyNoteModal from "@admin/components/pages/TaskManager/MyTask/MyNoteModal";
import MyTaskTable from "@admin/components/pages/TaskManager/MyTask/MyTaskTable";
import { useGlobalContext } from "@admin/context/GlobalContext";
import SelectComponent from "@admin/components/core/Select/Select";
import { priorityOption } from "@admin/components/pages/Utilities/paymentData";
import { SelectOption } from "@admin/@interfaces/orders/order.interface";

export const MyTaskContext = createContext({} as MyTaskContextType);

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
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  // const [filter, setFilter] = useState<string>("pending");
  const [filter, setFilter] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("myTask_filter") || "pending";
    }
    return "pending";
  });
  const [selectedPriority, setSelectedPriority] = useState<SelectOption>({
    value: "all",
    label: "All",
  });

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: ITask) => {
    setItems(data);
    setModalMode("Edit");
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
    TaskService.getMyTask({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
      status: filter,
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
  ]);

  const confirmRemove = async () => {
    if (!remove) return;
    try {
      const res = await ProductCategoryService.deleteProductCategory(remove);
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
    localStorage.setItem("myTask_filter", newFilter);
  };
  useTableRefreshRegister(fetchTask);


  return (
    <AuthLayout>
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="My Task List"
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
          <MyTaskTab
            filter={filter}
            handleFilterChange={handleFilterChange}
            IsSearch={false}
          />
        </div>

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">My task records</p>
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
              <SelectComponent
                options={priorityOption}
                value={selectedPriority}
                onChange={setSelectedPriority}
                placeholder="All"
                className="md:w-64 w-full"
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

          <MyTaskContext.Provider
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
            }}
          >
            <MyTaskTable />
            <MyTaskModal />
            <MyNoteModal />
          </MyTaskContext.Provider>

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
