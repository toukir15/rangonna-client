"use client";
import React, { useState, useEffect, useRef } from "react";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { hasPermission, noData } from "@admin/utils";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import Alert from "@admin/components/core/Aleart/Aleart";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";

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

      <NoScrollLayout>
        <div className="px-4 pt-4 sm:flex items-center gap-4 justify-between md:mb-4 mb-2">
          <div className="sm:flex items-center gap-3">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold dark:text-gray-300 text-nowrap">
                Group List
              </h1>
              {permissionList.includes("team_permission_create") && (
                <Button
                  className="!bg-green-200 !text-green-600 !py-1.5 flex items-center !px-3 text-nowrap"
                  onClick={handleAddClick}
                >
                  Add Group
                </Button>
              )}
            </div>
            <div className="md:w-80 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>

        </div>
      </NoScrollLayout>

      {/* Table to display permissions */}
      <div className="px-4 mb-10 min-h-[40vh]">
        <div className="">
          <TableWrapper
            showCheckbox={true}
            className="min-h-[700px]"
            colValue={5}
            printLabel="Label Print"
            data={permissionData}
            isLoading={isLoading}
            isSwitchOn
          >
            <Thead>
              <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="min-w-14 text-blue-900 dark:text-gray-200">
                  SL
                </Th>
                <Th className="min-w-48 text-blue-900 dark:text-gray-200">
                  Group Name
                </Th>
                <Th className="min-w-48 text-blue-900 dark:text-gray-200">
                  Total Member
                </Th>
                <Th className="min-w-36 text-blue-900 dark:text-gray-200">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
              {permissionData?.map((permission, index) => {
                return (
                  <Tr
                    className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    key={index}
                  >
                    <Td className="font-bold">{index + 1}</Td>
                    <Td className="font-bold">{permission?.name || noData}</Td>
                    <Td className="font-bold">{permission?.members_count}</Td>
                    <Td>
                      {hasPermission(
                        permissionList,
                        "team_permission_edit",
                        "team_permission_delete"
                      ) && (
                          <div className="relative max-w-32">
                            <Icon
                              name={"more_horiz"}
                              variant="outlined"
                              onClick={() => togglePopup(index)}
                              className="cursor-pointer"
                            />
                            {popupIndex === index && (
                              <div
                                ref={popupRef}
                                className="absolute top-8 right-0 bg-white border dark:bg-gray-700 dark:border-gray-500  shadow-md rounded-lg p-2 z-20 min-w-40"
                              >
                                {hasPermission(
                                  permissionList,
                                  "team_permission_edit"
                                ) && (
                                    <button
                                      onClick={() =>
                                        router.push(
                                          `/team/permission/edit-permission/${permission?._id}`
                                        )
                                      }

                                      className="block w-full text-left px-4 py-2 hover:bg-gray-100rounded-lg dark:hover:bg-gray-600"
                                    >
                                      Edit
                                    </button>
                                  )}

                                {hasPermission(
                                  permissionList,
                                  "team_permission_delete"
                                ) && (
                                    <button
                                      onClick={() =>
                                        handleRemoveProduct(permission?._id)
                                      }
                                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-600"
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
        </div>

        <PaginationComponent
          ordersPerPage={permissionPerPage}
          handleOrdersPerPageChange={handlePermissionPerPageChange}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={totalPages}
        />


      </div>
    </AuthLayout>
  );
};

export default Page;
