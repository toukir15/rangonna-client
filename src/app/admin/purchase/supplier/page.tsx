"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";

import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useRef, useState, useEffect } from "react";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import ToggleSwitch from "@admin/components/core/SwitchButton/ToggleSwitch";
import Alert from "@admin/components/core/Aleart/Aleart";
import { IAccount } from "@admin/@interfaces/account/account-list/account-list.interface";
import SupplierModal from "@admin/components/pages/Team/Supplier/SupplierModal";
import { SupplierService } from "@admin/@services/apis/TeamService/SupplierService/supplier.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import PageSearch from "@admin/components/core/Search/PageSearch";

type IPriorityPayload = {
  _id: string;
  priority: number;
};

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [activeToggleLoading, setActiveToggleLoading] = useState<
    Record<string, boolean>
  >({});
  const [priorityUpdateLoading, setPriorityUpdateLoading] =
    useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [supplierListData, setSupplierListData] = useState<IAccount[]>([]);
  const [priorityListData, setPriorityListData] = useState<IAccount[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [items, setItems] = useState<IAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [isPriorityEditMode, setIsPriorityEditMode] = useState<boolean>(false);
  const tableData = isPriorityEditMode ? priorityListData : supplierListData;

  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setPopupIndex(null);
      }
    };

    if (popupIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [popupIndex]);

  useEffect(() => {
    if (!isPriorityEditMode) {
      getAllSupplier();
    }
  }, [debouncedSearchTerm, currentPage, productPerPage, isPriorityEditMode]);

  const handleEditClick = (data: IAccount) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
    setPopupIndex(null);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setItems(null);
    setIsModalOpen(true);
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("productListPerPage", newProductPerPage.toString());
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getAllSupplier = () => {
    setTableLoading(true);

    SupplierService.getAllSupplier({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          const list = res?.data?.data || [];
          setSupplierListData(list);
          setPriorityListData(list);
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

  const getAllSupplierForPriority = async () => {
    try {
      setTableLoading(true);

      const res = await SupplierService.getAllSupplier({
        searchTerm: "",
        page: 1,
        limit: totalProduct || 1000,
      });

      if (res?.success) {
        const list = res?.data?.data || [];
        setPriorityListData(list);
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


  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    setTableLoading(true);
    if (!remove) return;

    try {
      const res = await SupplierService.deleteSupplier(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        getAllSupplier();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
      setTableLoading(false);
    }
  };

  const toggleIsActive = (item: IAccount) => {
    setActiveToggleLoading((prev) => ({ ...prev, [item._id]: true }));

    SupplierService.updateSupplierToggle(item?._id, {
      is_active: !item.is_active,
    })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          setIsModalOpen(false);
          getAllSupplier();
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

  const handleTogglePriorityEditMode = async () => {
    if (isPriorityEditMode) {
      setIsPriorityEditMode(false);
      setPriorityListData(supplierListData);
      setDraggedIndex(null);
      getAllSupplier();
    } else {
      await getAllSupplierForPriority();
    }
  };

  const handleDragStart = (index: number) => {
    if (!isPriorityEditMode) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLTableRowElement>,
    hoverIndex: number
  ) => {
    e.preventDefault();

    if (
      !isPriorityEditMode ||
      draggedIndex === null ||
      draggedIndex === hoverIndex
    ) {
      return;
    }

    const updatedRows = [...priorityListData];
    const draggedRow = updatedRows[draggedIndex];

    updatedRows.splice(draggedIndex, 1);
    updatedRows.splice(hoverIndex, 0, draggedRow);

    setPriorityListData(updatedRows);
    setDraggedIndex(hoverIndex);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handlePriorityUpdate = async () => {
    const payload: IPriorityPayload[] = priorityListData.map((item, index) => ({
      _id: item._id,
      priority: index + 1,
    }));

    try {
      setPriorityUpdateLoading(true);

      const res = await SupplierService.updateSupplierPriority(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Priority updated successfully");
        setIsPriorityEditMode(false);
        setDraggedIndex(null);
        getAllSupplier();
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

  useTableRefreshRegister(getAllSupplier);


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
        <div className="md:flex gap-3 items-center  2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="flex items-center gap-3">
            <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
              Supplier
            </h2>
            <div className="flex  gap-2">
              {permissionList.includes("purchase_supplier_create") &&
                !isPriorityEditMode && (
                  <Button
                    className="flex items-center !bg-green-200 !text-green-600 !px-4 !py-1.5 text-nowrap"
                    onClick={handleAddClick}
                  >
                    Add Supplier
                  </Button>
                )}

              {permissionList.includes("setting_priority_edit") && (
                <Button
                  className={`flex items-center !px-3 !py-1.5 ${isPriorityEditMode ? "bg-orange-500 !py-1.5" : "bg-indigo-500 !py-1.5"
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
            <div className="md:w-80 w-full md:my-0 my-2">
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
          <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={tableData}
            isLoading={tableLoading}
            noDataViewCondition={
              tableData.length < 1 ? "No data available" : null
            }
            colValue={7}
          >
            <Thead>
              <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-16 min-w-20">
                  #
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  <div className="flex items-center ">
                    <div>
                      <p>Name</p>
                    </div>
                    {!isPriorityEditMode && (
                      <div className="mt-2">
                        <div className="h-1.5">
                          <Icon
                            name={"arrow_drop_up"}
                            className=" cursor-pointer"
                          />
                        </div>
                        <div className="">
                          <Icon
                            name={"arrow_drop_down"}
                            className=" cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  Company Name
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  Phone
                </Th>
                <Th className="dark:text-gray-300 min-w-44">Address</Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  Email
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  Active
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-40 lg:min-w-32 min-w-40">
                  Action
                </Th>
              </Tr>
            </Thead>

            <Tbody className="dark:bg-gray-800 bg-white">
              {tableData?.map((item: any, index: number) => {
                return (
                  <Tr
                    className={`h-14 transition ${isPriorityEditMode ? "cursor-move" : ""
                      } ${draggedIndex === index ? "opacity-50" : ""}`}
                    key={item._id || index}
                    draggable={isPriorityEditMode}
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <Td>
                      <div className="flex items-center gap-2">
                        {isPriorityEditMode && (
                          <Icon
                            name="drag_indicator"
                            className="text-gray-500 cursor-grab"
                          />
                        )}
                        <span>{index + 1}</span>
                      </div>
                    </Td>

                    <Td>{item?.name}</Td>
                    <Td className="text-base font-bold">
                      {item?.company_name}
                    </Td>
                    <Td>{item?.phone}</Td>
                    <Td>{item?.address}</Td>
                    <Td>{item?.email}</Td>

                    <Td>
                      {activeToggleLoading[item._id] ? (
                        <Icon
                          name="restart_alt"
                          size={28}
                          className="text-green-600 animate-spin ml-5"
                        />
                      ) : (
                        <ToggleSwitch
                          isChecked={item.is_active}
                          onToggle={() => {
                            toggleIsActive(item);
                          }}
                          disabled={
                            isPriorityEditMode ||
                            activeToggleLoading[item?._id] ||
                            !hasPermission(
                              permissionList,
                              "purchase_supplier_edit"
                            )
                          }
                        />
                      )}
                    </Td>

                    <Td>
                      {!isPriorityEditMode &&
                        hasPermission(
                          permissionList,
                          "purchase_supplier_edit"
                        ) && (
                          <div className="relative">
                            <Icon
                              name={"more_horiz"}
                              variant="outlined"
                              onClick={() => togglePopup(index)}
                              className="cursor-pointer"
                            />

                            {popupIndex === index && (
                              <div
                                ref={popupRef}
                                className="absolute top-8 right-0 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                              >
                                {hasPermission(
                                  permissionList,
                                  "purchase_supplier_edit"
                                ) && (
                                    <button
                                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                      onClick={() => handleEditClick(item)}
                                    >
                                      Edit
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

          <SupplierModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            modalMode={modalMode}
            items={items}
            getAllSupplier={getAllSupplier}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
