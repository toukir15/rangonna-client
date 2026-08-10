"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useState, useEffect, JSX } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import { AccountListService } from "@admin/@services/apis/Account/AccountList/AccountList.service";
import AccountListModal from "@admin/components/pages/AccountsLists/AccountListModal";
import {
  IAccount,
  IAccountResponse,
  IAccountUpdateResponse,
} from "@admin/@interfaces/account/account-list/account-list.interface";
import AccountListTable from "@admin/components/pages/AccountsLists/AccountListTable";
import { AccountListContext } from "@admin/context/AccountListContext";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";

type IPriorityPayload = {
  _id: string;
  priority: number;
};

const Page = (): JSX.Element => {
  const { permissionList } = useGlobalContext();
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});
  const [defaultToggleLoading, setDefaultToggleLoading] = useState<
    Record<string, boolean>
  >({});
  const [priorityUpdateLoading, setPriorityUpdateLoading] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [accountListData, setAccountListData] = useState<IAccount[]>([]);
  const [priorityListData, setPriorityListData] = useState<IAccount[]>([]);
  const [items, setItems] = useState<IAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [hasMounted, setHasMounted] = useState<boolean>(false);
  const [isPriorityEditMode, setIsPriorityEditMode] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const savedPerPage = localStorage.getItem("AccountCategoryPerPage");
    if (savedPerPage) {
      const parsedValue = parseInt(savedPerPage, 10);
      if (!isNaN(parsedValue)) {
        setProductPerPage(parsedValue);
      }
    }
  }, []);

  useEffect(() => {
    if (hasMounted && !isPriorityEditMode) {
      getAccountList();
    }
  }, [
    debouncedSearchTerm,
    currentPage,
    productPerPage,
    hasMounted,
    isPriorityEditMode,
  ]);

  const handleEditClick = () => {
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setItems(null);
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem(
      "AccountCategoryPerPage",
      newProductPerPage.toString()
    );
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getAccountList = () => {
    setTableLoading(true);

    AccountListService.getAccountList({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: IAccountResponse) => {
        if (res?.success) {
          const list = res?.data?.data || [];
          setAccountListData(list);
          setPriorityListData(list);
          setTotalProduct(Number(res?.data?.meta?.total_record) || 0);
        } else {
          ToastService.error(res?.message || "Failed to fetch account list");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err?.message || "Failed to fetch account list");
      })
      .finally(() => {
        setTableLoading(false);
      });
  };

  const getAllAccountListForPriority = async () => {
    try {
      setTableLoading(true);

      const res = await AccountListService.getAccountList({
        searchTerm: "",
        page: 1,
        limit: totalProduct || 1000,
      });

      if (res?.success) {
        const list = res?.data?.data || [];
        setPriorityListData(list);
        setIsPriorityEditMode(true);
      } else {
        ToastService.error(res?.message || "Failed to fetch all account list");
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



  const toggleIsActive = (item: IAccount) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    AccountListService.updateAccountList(item._id, {
      is_active: !item.is_active,
    })
      .then((res: IAccountUpdateResponse) => {
        if (res?.success) {
          ToastService.success(res?.message || "Status updated successfully");
          getAccountList();
        } else {
          ToastService.error(res?.message || "Failed to update status");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err?.message || "Failed to update status");
      })
      .finally(() => {
        setActiveToggleLoading((prev) => ({ ...prev, [item._id]: false }));
      });
  };

  const toggleIsADefault = (item: IAccount) => {
    setDefaultToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    AccountListService.updateAccountList(item._id, {
      is_default: !item.is_default,
    })
      .then((res: IAccountResponse) => {
        if (res?.success) {
          ToastService.success(res?.message || "Default updated successfully");
          getAccountList();
        } else {
          ToastService.error(res?.message || "Failed to update default");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err?.message || "Failed to update default");
      })
      .finally(() => {
        setDefaultToggleLoading((prev) => ({ ...prev, [item._id]: false }));
      });
  };

  const handleTogglePriorityEditMode = async () => {
    if (isPriorityEditMode) {
      setIsPriorityEditMode(false);
      getAccountList();
    } else {
      await getAllAccountListForPriority();
    }
  };

  const handlePriorityUpdate = async () => {
    const payload: IPriorityPayload[] = priorityListData.map((item, index) => ({
      _id: item._id,
      priority: index + 1,
    }));

    try {
      setPriorityUpdateLoading(true);

      const res = await AccountListService.updateAccountPriority(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Priority updated successfully");
        setIsPriorityEditMode(false);
        getAccountList();
      } else {
        ToastService.error(res?.message || "Failed to update priority");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        ToastService.error(error.message);
      } else {
        ToastService.error("Unexpected error occurred");
      }
    } finally {
      setPriorityUpdateLoading(false);
    }
  };
  useTableRefreshRegister(getAccountList);


  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="sm:flex items-center  2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2 gap-3">
          <div className="flex items-center gap-4">
            <h2 className="2xl:text-2xl lg:text-xl text-lg font-semibold text-app text-nowrap">
              Account Lists
            </h2>

            <div className=" flex justify-end gap-2 ">
              {permissionList.includes("account_create") &&
                !isPriorityEditMode && (
                  <Button
                    className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                    onClick={handleAddClick}
                  >

                    <span className="ml-1 text-nowrap">Add Lists</span>
                  </Button>
                )}
              {permissionList.includes("setting_priority_edit") && (
                <Button
                  className={`flex items-center !py-1.5 !px-4 ${isPriorityEditMode ? "bg-orange-500" : "bg-indigo-500"
                    }`}
                  onClick={handleTogglePriorityEditMode}
                >
                  <Icon name="filter_list" />
                  <span className="">{isPriorityEditMode ? "Cancel" : ""}</span>
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

          </div>

          {!isPriorityEditMode && (
            <div className="md:w-80 w-full sm:mt-0 mt-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          )}
        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <AccountListContext.Provider
            value={{
              accountListData: isPriorityEditMode
                ? priorityListData
                : accountListData,
              tableLoading,
              activeToggleLoading,
              defaultToggleLoading,
              toggleIsActive,
              toggleIsADefault,
              handleEditClick,
              isModalOpen,
              setIsModalOpen,
              modalMode,
              items,
              getAccountList,
              setItems,
              isPriorityEditMode,
              setPriorityListData,
            }}
          >
            <AccountListTable />
            <AccountListModal />
          </AccountListContext.Provider>

          {!isPriorityEditMode && (
            <PaginationComponent
              ordersPerPage={productPerPage}
              handleOrdersPerPageChange={handleProductPerPageChange}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalData={totalProduct}
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
