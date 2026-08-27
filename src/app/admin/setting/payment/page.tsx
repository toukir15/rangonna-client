"use client";

import useTableRefreshRegister from "@admin/components/Table/useTableRefreshRegister";
import AuthLayout from "@admin/layouts/AuthLayout";
import { useEffect, useRef, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import PaymentModal from "@admin/components/pages/Settings/Payment/PaymentModal";
import { PaymentSettingService } from "@admin/@services/apis/SettingsService/PaymentSetting/Payment.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Button from "@admin/components/core/Button/Button";
import PageHeader from "@admin/components/layout/PageHeader";
import TableRefreshButton from "@admin/components/Table/TableRefreshButton";

const Page = () => {
  const [paymentSettingData, setPaymentSettingData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState<boolean>(true);
  const [popupIndex, setPopupIndex] = useState<number | null>(null);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Add");
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const [remove, setRemove] = useState<string | null>(null);

  const popupRef = useRef<HTMLDivElement | null>(null);
  const togglePopup = (index: number) => {
    setPopupIndex(popupIndex === index ? null : index);
  };
  const [items, setItems] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const fetchPaymentSetting = async () => {
    PaymentSettingService.getPaymentSetting()
      .then((res: any) => {
        if (res?.success) {
          setPaymentSettingData(res.data);
        }
      })
      .catch((err) => ToastService.error(err.message))
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    fetchPaymentSetting();
  }, []);

  const handleEditClick = (data: any) => {
    setItems(data);
    setModalMode("Edit");
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setModalMode("Add");
    setIsModalOpen(true);
  };

  const handleRemove = (source: string) => {
    setRemove(source);
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
      const res = await PaymentSettingService.deletePaymentSetting(remove);
      if (res?.success) {
        ToastService.success(res?.message);
        fetchPaymentSetting();
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

  useTableRefreshRegister(fetchPaymentSetting);

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
          title="Payment Setting"
          action={
            <Button
              className="btn-primary btn-primary-inline inline-flex items-center gap-2"
              onClick={handleAddClick}
            >
              <Icon name="add" variant="outlined" size={16} />
              Add Payment
            </Button>
          }
        />
        <div className="data-table-card glass-card rounded-2xl orders-table-shell">
          <div className="premium-table-toolbar">
            <p className="premium-table-toolbar-title">Payment records</p>
            <p className="premium-table-toolbar-meta">
              {paymentSettingData.length.toLocaleString()}{" "}
              {paymentSettingData.length === 1 ? "record" : "records"}
            </p>
          </div>
          <div className="data-table-toolbar">
            <div className="data-table-toolbar-start" />
            <div className="data-table-toolbar-end">
              <TableRefreshButton
                onRefresh={fetchPaymentSetting}
                isLoading={tableLoading}
                className="!h-9"
              />
            </div>
          </div>
          <TableWrapper
            showCheckbox={false}
            isSwitchOn={true}
            className="orders-table-nested !mt-0 min-h-[560px] !flex-1"
            data={paymentSettingData}
            isLoading={tableLoading}
            noDataViewCondition={
              paymentSettingData?.length < 1 ? "No data available" : null
            }
            colValue={10}
          >
            <Thead>
              <Tr>
                <Th>Source</Th>
                <Th>Title</Th>
                <Th>Category</Th>
                <Th>Account</Th>
                <Th className="is-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paymentSettingData?.map((data: any, index: number) => {
                return (
                  <Tr key={index}>
                    <Td>
                      <span className="data-table-primary">{data?.source}</span>
                    </Td>
                    <Td>
                      <span className="data-table-muted">{data?.title}</span>
                    </Td>
                    <Td>
                      <span className="data-table-muted">
                        {data?.deposit_category?.title}
                      </span>
                    </Td>
                    <Td>
                      <span className="data-table-muted">
                        {data?.account?.account_name}
                      </span>
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
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="block w-full rounded-lg px-3 py-2 text-left text-sm text-app hover:bg-[var(--bg-hover)]"
                              onClick={() => handleRemove(data?.source)}
                            >
                              Delete
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
        </div>
        <PaymentModal
          items={items}
          setIsModalOpen={setIsModalOpen}
          isModalOpen={isModalOpen}
          fetchPaymentSetting={fetchPaymentSetting}
          modalMode={modalMode}
        />
      </div>
    </AuthLayout>
  );
};

export default Page;
