"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PaginationComponent from "@admin/components/core/Pazination/Pazination";
import useDebounce from "@admin/components/core/UseDebounece/UseDebouence";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import TableWrapper from "@admin/components/Table/TableWrapper";
import Button from "@admin/components/core/Button/Button";
import { ToastService } from "@admin/utils/toastr.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import { useGlobalContext } from "@admin/context/GlobalContext";
import PageSearch from "@admin/components/core/Search/PageSearch";
import { PurchasesReturnService } from "@admin/@services/apis/PurchasesService/PurchasesReturn.service";
import CreateReturnPaymentModal from "@admin/components/pages/Purchases/CreatesReturnPaymentModal";
import Link from "next/link";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { dueColor, paidColor } from "@admin/utils/constant";

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const router = useRouter();
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [productPerPage, setProductPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalProduct, setTotalProduct] = useState<number>(0);
  const totalPages = Math.ceil(totalProduct / productPerPage);
  const [purchasesData, setPurchasesData] = useState<any>();
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearchTerm = useDebounce<string>(searchTerm, 300);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<any>();
  const [modalMode, setModalMode] = useState<"Add" | "Edit" | "View">("View");

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

  const handleAddClick = () => {
    router.push("/admin/purchase/return/create-purchases");
  };

  const handleProductPerPageChange = (newProductPerPage: number) => {
    setProductPerPage(newProductPerPage);
    localStorage.setItem("productListPerPage", newProductPerPage.toString());
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const fetchPurchasesReturn = () => {
    setTableLoading(true);
    PurchasesReturnService.getPurchasesReturn({
      searchTerm: debouncedSearchTerm,
      page: currentPage,
      limit: productPerPage,
    })
      .then((res: any) => {
        if (res?.success) {
          setPurchasesData(res?.data.data);
          setTotalProduct(res.data.meta.total_record);
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
    fetchPurchasesReturn();
  }, [debouncedSearchTerm, currentPage, productPerPage]);

  const cancelRemove = () => {
    setIsAlertOpen(false);
    setRemove(null);
  };

  const confirmRemove = async () => {
    if (!remove) return;
    try {
      const res = await PurchasesReturnService.deletePurchasesReturn(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchPurchasesReturn();
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsAlertOpen(false);
      setRemove(null);
    }
  };

  const handleReturnShowPayments = (item: any) => {
    setModalMode("View");
    setModalOpen(true);
    setPaymentData(item);
  };

  const handleCreatePayment = (item: any) => {
    setModalMode("Add");
    setModalOpen(true);
    setPaymentData(item);
  };

  useTableRefreshRegister(fetchPurchasesReturn);


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
      <NoScrollLayout>
        <div className="sm:flex items-center justify-between 2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 md:pb-0 mb-2">
          <div className="sm:flex items-center gap-3">

            <div className="flex gap-3">
              <h2 className="2xl:text-2xl lg:text-xl text-lg font-semibold text-app">
                Purchases Return
              </h2>
              {permissionList.includes("purchase_return_create") && (
                <Button
                  className="btn-primary btn-primary-inline inline-flex items-center gap-2"
                  onClick={handleAddClick}
                >

                  Add Purchase Return
                </Button>
              )}
            </div>
            <div className="md:w-80 sm:w-72 w-full md:my-0 my-2">
              <PageSearch
                value={searchTerm}
                onChange={handleSearchChange}
                wrapperClass="w-full"
              />
            </div>
          </div>

        </div>
      </NoScrollLayout>

      <div className="min-h-[75vh] 2xl:px-4 px-3">
        <div className="xl:mt-3 mt-2">
          <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={purchasesData}
            isLoading={tableLoading}
            noDataViewCondition={
              purchasesData?.length < 1 ? "No data available" : null
            }
            colValue={12}
          >
            <Thead>
              <Tr className="dark:bg-gray-700 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-28 min-w-44">
                  <p>Date</p>
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-28 min-w-28">
                  <div className="flex items-center">
                    <div>
                      <p>Invoice</p>
                    </div>
                    <div className="mt-2">
                      {" "}
                      <div className="h-1.5">
                        <Icon
                          name={"arrow_drop_up"}
                          className="cursor-pointer"
                        />
                      </div>
                      <div className="">
                        <Icon
                          name={"arrow_drop_down"}
                          className="cursor-pointer"
                        />{" "}
                      </div>
                    </div>
                  </div>
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-32 lg:min-w-32 min-w-40">
                  Supplier
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-28 min-w-28">
                  Grand Total
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-24 min-w-28">
                  Shipping
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-20 min-w-20">
                  Discount
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-24 lg:min-w-24 min-w-20">
                  Paid
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-24 min-w-20">
                  Due
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-20 lg:min-w-20 min-w-28">
                  Status
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-20 min-w-20">
                  View
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-20 min-w-40">
                  Note
                </Th>
                <Th className="dark:text-gray-300 2xl:min-w-28 lg:min-w-20 min-w-32">
                  Action
                </Th>
              </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
              {purchasesData?.map((item: any, index: number) => {
                return (
                  <Tr className="h-14" key={index}>
                    <Td>
                      <p>{formatTimeAgo(item?.updatedAt)}</p>
                      <p>{formatTimeAgo(item?.createdAt)}</p>
                    </Td>
                    <Td>
                      <p>{item?.invoice}</p>
                      <p>{item?.date}</p>
                    </Td>
                    <Td className="text-base font-bold">
                      {item?.supplier?.name}
                    </Td>
                    <Td>{item?.grand_total}</Td>
                    <Td>{item?.shipping}</Td>
                    <Td>{item?.discount}</Td>
                    <Td >
                      <p className={`${paidColor}`}>{item?.paid}</p>
                    </Td>
                    <Td><p className={`${dueColor}`}>{item?.due}</p></Td>
                    <Td className="uppercase">{item?.status}</Td>
                    <Td>
                      <Link
                        href={`/admin/purchase/return/view/${item?._id}`}
                        className="data-table-view-btn"
                      >
                        View
                      </Link>
                    </Td>
                    <Td>
                      <p>Note: {item?.note}</p>
                      <p>Name: {item?.user?.name}</p>
                    </Td>
                    <Td className="">
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
                            className="absolute top-8 -right-2 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-44"
                          >
                            {permissionList.includes(
                              "purchase_return_edit"
                            ) && (
                                <>
                                  <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                    onClick={() =>
                                      router.push(
                                        `/admin/purchase/return/edit-purchases/${item?._id}`
                                      )
                                    }
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                                    onClick={() => handleCreatePayment(item)}
                                  >
                                    Create Payment
                                  </button>
                                </>
                              )}


                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleReturnShowPayments(item)}
                            >
                              Payment History
                            </button>
                          </div>
                        )}
                      </div>
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </TableWrapper>

          <CreateReturnPaymentModal
            isModalOpen={modalOpen}
            setIsModalOpen={setModalOpen}
            paymentData={paymentData}
            modalMode={modalMode}
            refreshData={fetchPurchasesReturn}
            setModalMode={setModalMode}
          />
          <PaginationComponent
            ordersPerPage={productPerPage}
            handleOrdersPerPageChange={handleProductPerPageChange}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            totalPages={totalPages}
            totalData={totalProduct}
          />
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
