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
import ProjectTable from "@admin/components/pages/TaskManager/Project/ProjectTable";
import ProjectModal from "@admin/components/pages/TaskManager/Project/ProjectModal";
import { ProjectService } from "@admin/@services/apis/TaskManager/Project/project.service";
import {
  IProject,
  IProjectListResponse,
  ProjectContextType,
} from "@admin/@interfaces/taskManager/taskManager.service";
import TaskTab from "@admin/components/pages/TaskManager/Task/TaskTab";

export const ProjectContext = createContext({} as ProjectContextType);

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [projectData, setProjectData] = useState<IProject[]>([]);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const totalPages = Math.ceil(totalExpenses / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [items, setItems] = useState<IProject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleEditClick = (data: IProject) => {
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

  const fetchProject = () => {
    setTableLoading(true);
    ProjectService.getProject({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
      status: filter,
    })
      .then((res: IProjectListResponse) => {
        if (res?.success) {
          setProjectData(res?.data?.data);
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
    const savedExpensesPerPage = localStorage.getItem("ProductCategoryPerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
    fetchProject();
  }, [filter, debouncedSearchTerm, currentPage, productPerPage]);

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;
    try {
      const res = await ProjectService.deleteProject(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchProject();
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

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };
  useTableRefreshRegister(fetchProject);


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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Project List"
          action={
            permissionList.includes("task_project_create") ? (
              <Button
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Project
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
            <p className="premium-table-toolbar-title">Project records</p>
            <p className="premium-table-toolbar-meta">
              {totalExpenses.toLocaleString()}{" "}
              {totalExpenses === 1 ? "project" : "projects"}
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
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchProject}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <ProjectContext.Provider
            value={{
              projectData,
              tableLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              isModalOpen,
              fetchProject,
            }}
          >
            <ProjectTable />
            <ProjectModal />
          </ProjectContext.Provider>

          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalExpenses}
            isShowText={true}
            onRefresh={fetchProject}
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
