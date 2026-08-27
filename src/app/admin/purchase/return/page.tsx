"use client";
import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import Icon from "@admin/components/core/Icon/Icon";
import AuthLayout from "@admin/layouts/AuthLayout";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";
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
import { PurchasesReturnService } from "@admin/@services/apis/PurchasesService/PurchasesReturn.service";
import CreateReturnPaymentModal from "@admin/components/pages/Purchases/CreatesReturnPaymentModal";
import Link from "next/link";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import { dueColor, paidColor } from "@admin/utils/constant";
import { noData } from "@admin/utils";

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
      <div className="2xl:px-4 px-3 2xl:pt-4 md:pt-3 pt-2 pb-4 relative w-full">
        <PageHeader
          title="Purchases Return"
          action={
            permissionList.includes("purchase_return_create") ? (
              <Button
                onClick={handleAddClick}
                className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              >
                <Icon name="add" variant="outlined" size={16} />
                Add Purchase Return
              </Button>
            ) : undefined
          }
        />

        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Return records</p>
            <p className="premium-table-toolbar-meta">
              {totalProduct.toLocaleString()}{" "}
              {totalProduct === 1 ? "return" : "returns"}
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
                onRefresh={fetchPurchasesReturn}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>

          <TableWrapper
            showCheckbox={false}
            isSwitchOn={true}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            data={purchasesData}
            isLoading={tableLoading}
            noDataViewCondition={
              purchasesData?.length < 1 ? "No data available" : null
            }
            colValue={12}
          >
            <Thead>
              <Tr>
                <Th className="2xl:min-w-20 lg:min-w-28 min-w-44">Date</Th>
                <Th className="2xl:min-w-28 lg:min-w-28 min-w-28">Invoice</Th>
                <Th className="2xl:min-w-32 lg:min-w-32 min-w-40">Supplier</Th>
                <Th className="2xl:min-w-28 lg:min-w-28 min-w-28">Grand Total</Th>
                <Th className="2xl:min-w-24 lg:min-w-24 min-w-28">Shipping</Th>
                <Th className="2xl:min-w-20 lg:min-w-20 min-w-20">Discount</Th>
                <Th className="2xl:min-w-24 lg:min-w-24 min-w-20">Paid</Th>
                <Th className="2xl:min-w-20 lg:min-w-24 min-w-20">Due</Th>
                <Th className="2xl:min-w-20 lg:min-w-20 min-w-28">Status</Th>
                <Th className="2xl:min-w-28 lg:min-w-20 min-w-20">View</Th>
                <Th className="2xl:min-w-28 lg:min-w-20 min-w-40">Note</Th>
                <Th className="is-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {purchasesData?.map((item: any, index: number) => {
                const status = String(item?.status || "").toLowerCase();
                const statusClass =
                  status === "paid" || status === "completed"
                    ? "is-approved"
                    : status === "due" ||
                        status === "unpaid" ||
                        status === "cancelled"
                      ? "is-rejected"
                      : status === "pending" || status === "partial"
                        ? "is-pending"
                        : "is-neutral";

                return (
                  <Tr key={index}>
                    <Td>
                      <span className="data-table-muted">
                        {formatTimeAgo(item?.updatedAt)}
                      </span>
                      <p className="data-table-muted">
                        {formatTimeAgo(item?.createdAt)}
                      </p>
                    </Td>
                    <Td>
                      <span className="data-table-primary">
                        {item?.invoice || noData}
                      </span>
                      <p className="data-table-muted">{item?.date || noData}</p>
                    </Td>
                    <Td>
                      <span className="data-table-primary">
                        {item?.supplier?.name || noData}
                      </span>
                    </Td>
                    <Td>
                      <span className="table-amount">{item?.grand_total}</span>
                    </Td>
                    <Td>
                      <span className="table-amount">{item?.shipping}</span>
                    </Td>
                    <Td>
                      <span className="table-amount">{item?.discount}</span>
                    </Td>
                    <Td>
                      <span className={`${paidColor} table-amount`}>
                        {item?.paid}
                      </span>
                    </Td>
                    <Td>
                      <span className={`${dueColor} table-amount`}>
                        {item?.due}
                      </span>
                    </Td>
                    <Td>
                      <span className={`table-role-badge ${statusClass}`}>
                        {item?.status || noData}
                      </span>
                    </Td>
                    <Td>
                      <Link
                        href={`/admin/purchase/return/view/${item?._id}`}
                        className="data-table-view-btn"
                      >
                        View
                      </Link>
                    </Td>
                    <Td>
                      <p className="data-table-muted">
                        Note: {item?.note || noData}
                      </p>
                      <p className="data-table-muted">
                        Name: {item?.user?.name || noData}
                      </p>
                    </Td>
                    <Td className="is-right">
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
                            {permissionList.includes("purchase_return_edit") && (
                              <>
                                <button
                                  type="button"
                                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                  onClick={() =>
                                    router.push(
                                      `/admin/purchase/return/edit-purchases/${item?._id}`,
                                    )
                                  }
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                                  onClick={() => handleCreatePayment(item)}
                                >
                                  Create Payment
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
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
            isShowText={true}
            onRefresh={fetchPurchasesReturn}
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
