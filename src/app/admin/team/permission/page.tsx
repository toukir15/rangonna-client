"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { hasPermission, noData } from "@admin/utils";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Alert from "@admin/components/core/Aleart/Aleart";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [permissionData, setPermissionData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [permissionPerPage, setPermissionPerPage] = useState<number>(20);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPermission, setTotalPermission] = useState<number>(0);

  const totalPages = Math.ceil(totalPermission / permissionPerPage);

  const handlePermissionPerPageChange = (newProductPerPage: number) => {
    setPermissionPerPage(newProductPerPage);
    localStorage.setItem("permissionListPerPage", newProductPerPage.toString());
  };

  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    handleGetPermission(debouncedSearchTerm);
  }, [permissionPerPage, debouncedSearchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleGetPermission = (searchTerm: string) => {
    setIsLoading(true);
    TeamService.getPermission({
      searchTerm: searchTerm,
      page: currentPage,
      limit: permissionPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setPermissionData(res.data);
          setTotalPermission(res?.data?.meta?.total_record || 1);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleAddClick = () => {
    router.push("/admin/team/permission/create-permission");
  };

  const cancelRemoveProduct = () => {
    setIsAlertOpen(false);
  };


  const confirmRemoveWebsite = () => {
    setIsLoading(true);
    TeamService.permissionDelete(itemToDelete)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsAlertOpen(false);
          handleGetPermission(debouncedSearchTerm);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Handle remove product
  const handleRemoveProduct = (index: number) => {
    setItemToDelete(index);
    setIsAlertOpen(true);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <AuthLayout>
      {/* Alert for delete confirmation */}
      <Alert
        isOpen={isAlertOpen}
        confirmLabel="Yes, Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoveWebsite}
        onCancel={cancelRemoveProduct}
        isLoading={isLoading}
      >
        <h3 className="text-2xl font-bold">Confirm Delete</h3>
        <h6 className="text-md my-4">
          Are you sure you want to remove this group?
        </h6>
        <div className="flex items-center justify-center my-8">
          <Icon
            name="delete"
            variant="outlined"
            size={110}
            className="text-red-400"
          />
        </div>
      </Alert>

      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Group List"
          action={
            permissionList.includes("team_permission_create") ? (
              <Button
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                onClick={handleAddClick}
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Group
              </Button>
            ) : undefined
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Group records</p>
            <p className="premium-table-toolbar-meta">
              {totalPermission.toLocaleString()} items
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
                onRefresh={() => handleGetPermission(debouncedSearchTerm)}
                isLoading={isLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TableWrapper
            showCheckbox={false}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            colValue={5}
            printLabel="Label Print"
            data={permissionData}
            isLoading={isLoading}
            isSwitchOn
          >
            <Thead>
              <Tr>
                <Th className="min-w-14">SL</Th>
                <Th className="min-w-48">Group Name</Th>
                <Th className="min-w-48">Total Member</Th>
                <Th className="is-right">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {permissionData?.map((permission, index) => {
                return (
                  <Tr key={index}>
                    <Td>
                      <span className="table-amount">{index + 1}</span>
                    </Td>
                    <Td>
                      <span className="data-table-primary">
                        {permission?.name || noData}
                      </span>
                    </Td>
                    <Td>
                      <span className="table-amount">
                        {permission?.members_count}
                      </span>
                    </Td>
                    <Td className="is-right">
                      {hasPermission(
                        permissionList,
                        "team_permission_edit",
                        "team_permission_delete"
                      ) && (
                          <div className="relative max-w-40">
                            <button
                              type="button"
                              className="data-table-action-btn"
                              aria-expanded={popupIndex === index}
                              onClick={() => togglePopup(index)}
                            >
                              <Icon name="more_vert" variant="outlined" size={18} />
                            </button>
                            {popupIndex === index && (
                              <div
                                ref={popupRef}
                                className="absolute top-9 right-0 z-20 min-w-40 rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-1.5 shadow-[var(--shadow-soft)]"
                              >
                                {hasPermission(
                                  permissionList,
                                  "team_permission_edit"
                                ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        router.push(
                                          `/admin/team/permission/edit-permission/${permission?._id}`
                                        )
                                      }
                                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                    >
                                      Edit
                                    </button>
                                  )}

                                {hasPermission(
                                  permissionList,
                                  "team_permission_delete"
                                ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveProduct(permission?._id)
                                      }
                                      className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                    >
                                      Delete
                                    </button>
                                  )}
                              </div>
                            )}
                          </div>
                        )}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableWrapper>

          <PaginationComponent
            ordersPerPage={permissionPerPage}
            handleOrdersPerPageChange={handlePermissionPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            showRefresh={false}
            isShowText={true}
            className="orders-table-pagination !mt-0 !rounded-none !border-x-0 !border-b-0 !shadow-none"
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
