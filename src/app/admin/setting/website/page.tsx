"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, createContext } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import WebsiteTable from "@admin/components/pages/Settings/Website/WebsiteTable";
import WebsiteModal from "@admin/components/pages/Settings/Website/WebsiteModal";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { IWebsiteResponse } from "@admin/@interfaces/common.interface";
import { IWebsiteContext } from "@admin/@interfaces/website/website.interface";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

export const WebsiteContext = createContext<IWebsiteContext>(
  {} as IWebsiteContext
);

type IPriorityPayload = {
  _id: string;
  priority: number;
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();

  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);

  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [priorityUpdateLoading, setPriorityUpdateLoading] =
    useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);

  const [websiteData, setWebsiteData] = useState<IWebsiteResponse[]>([]);
  const [priorityWebsiteData, setPriorityWebsiteData] = useState<
    IWebsiteResponse[]
  >([]);

  const [items, setItems] = useState<IWebsiteResponse | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [isPriorityEditMode, setIsPriorityEditMode] = useState<boolean>(false);
  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});

  const handleEditClick = (data: IWebsiteResponse) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setItems(null);
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("reportIssuePerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  useEffect(() => {
    const savedExpensesPerPage = localStorage.getItem("reportIssuePerPage");
    if (savedExpensesPerPage) {
      setProductPerPage(Number(savedExpensesPerPage));
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const fetchWebsite = () => {
    setTableLoading(true);

    GlobalService.getWebsiteData({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          const list = res?.data?.data || [];
          setWebsiteData(list);
          setPriorityWebsiteData(list);
          setTotalProduct(Number(res?.data?.meta?.total_record) || 0);
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

  const fetchAllWebsiteForPriority = async () => {
    try {
      setTableLoading(true);

      const res = await GlobalService.getWebsiteData({
        searchTerm: "",
        page: 1,
        limit: totalProduct || 1000,
      });

      if (res?.success) {
        const list = res?.data?.data || [];
        setPriorityWebsiteData(list);
        setIsPriorityEditMode(true);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!isPriorityEditMode) {
      fetchWebsite();
    }
  }, [debouncedSearchTerm, currentPage, productPerPage, isPriorityEditMode]);

  const handleRemove = (id: string) => {
    setRemove(id);
    setIsAlertOpen(true);
  };

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;

    try {
      const res = await GlobalService.deleteWebsite(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchWebsite();
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

  const handleTogglePriorityEditMode = async () => {
    if (isPriorityEditMode) {
      setIsPriorityEditMode(false);
      setPriorityWebsiteData(websiteData);
      fetchWebsite();
    } else {
      await fetchAllWebsiteForPriority();
    }
  };

  const handlePriorityUpdate = async () => {
    const payload: IPriorityPayload[] = priorityWebsiteData.map(
      (item: any, index: number) => ({
        _id: item._id,
        priority: index + 1,
      })
    );

    try {
      setPriorityUpdateLoading(true);

      const res = await GlobalService.updateWebsitePriority(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Priority updated successfully");
        setIsPriorityEditMode(false);
        fetchWebsite();
      } else {
        ToastService.error(res?.message || "Failed to update priority");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        ToastService.error(err.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setPriorityUpdateLoading(false);
    }
  };

  const toggleIsActive = (item: any) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    GlobalService.updateWebsiteToggle(item?._id, {
      is_active: !item.is_active,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          fetchWebsite();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setActiveToggleLoading((prev) => ({ ...prev, [item._id]: false }));
      });
  };
  useTableRefreshRegister(fetchWebsite);


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
          title="Website"
          action={
            <div className="flex items-center gap-2 flex-wrap">
              {permissionList.includes("setting_website_create") &&
                !isPriorityEditMode && (
                  <Button
                    className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                    onClick={handleAddClick}
                  >
                    <Icon name="add" variant="outlined" size={16} />
                    Add Website
                  </Button>
                )}
              {permissionList.includes("setting_priority_edit") && (
                <Button
                  className={`flex items-center !px-3 !py-1.5 ${
                    isPriorityEditMode ? "bg-orange-500" : "bg-indigo-500"
                  }`}
                  onClick={handleTogglePriorityEditMode}
                >
                  <Icon name="filter_list" />
                  <span>{isPriorityEditMode ? "Cancel" : ""}</span>
                </Button>
              )}
              {isPriorityEditMode && (
                <Button
                  className="flex items-center bg-green-600 !px-4 !py-1.5"
                  onClick={handlePriorityUpdate}
                  disabled={priorityUpdateLoading}
                >
                  <Icon name="assignment_turned_in" className="me-1" />{" "}
                  {priorityUpdateLoading ? "Updating..." : "Update"}
                </Button>
              )}
            </div>
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Website records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "website" : "websites"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start">
              {!isPriorityEditMode && (
                <label className="data-table-search">
                  <Icon name="search" variant="outlined" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search..."
                  />
                </label>
              )}
            </div>
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchWebsite}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <WebsiteContext.Provider
            value={{
              websiteData: isPriorityEditMode
                ? priorityWebsiteData
                : websiteData,
              tableLoading,
              handleEditClick,
              handleRemove,
              modalMode,
              items,
              setIsModalOpen,
              fetchWebsite,
              isModalOpen,
              isPriorityEditMode,
              setPriorityWebsiteData,
              activeToggleLoading,
              toggleIsActive,
            }}
          >
            <WebsiteTable />
            <WebsiteModal />
          </WebsiteContext.Provider>

          {!isPriorityEditMode && (
            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalProduct}
              isShowText={true}
              onRefresh={fetchWebsite}
              isLoading={tableLoading}
              showRefresh={false}
              className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
