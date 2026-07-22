"use client";

import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { useEffect, useRef, useState } from "react";
import { ToastService } from "@admin/utils/toastr.service";
import TableWrapper from "@admin/components/Table/TableWrapper";
import { Tbody, Td, Th, Thead, Tr } from "@admin/components/Table/Table";
import Icon from "@admin/components/core/Icon/Icon";
import PaymentModal from "@admin/components/pages/Settings/Payment/PaymentModal";
import { PaymentSettingService } from "@admin/@services/apis/SettingsService/PaymentSetting/Payment.service";
import Alert from "@admin/components/core/Aleart/Aleart";
import Button from "@admin/components/core/Button/Button";

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
        <div className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-gray-300">
            Payment Setting
          </h2>
          <div className="mt-2 lg:mt-0 flex justify-end">
            <Button
              className="flex items-center bg-blue-500 !px-4"
              onClick={handleAddClick}
            >
              <Icon name={"add"} />
              <span className="ml-1 text-nowrap">Add Payment</span>
            </Button>
          </div>
        </div>
      </NoScrollLayout>

      <div className="px-4 min-h-[85%]">
        <div className="bg-white dark:bg-gray-700 rounded-lg">
          <TableWrapper
            isSwitchOn={true}
            className="min-h-[650px]"
            data={paymentSettingData}
            isLoading={tableLoading}
            noDataViewCondition={
              paymentSettingData?.length < 1 ? "No data available" : null
            }
            colValue={10}
          >
            <Thead>
              <Tr className="dark:bg-gray-700 bg-blue-100 h-[50px] shadow-sm border-b dark:border-gray-700 border-gray-300 p-20">
                <Th className="dark:text-gray-300">Source</Th>
                <Th className="dark:text-gray-300">Title</Th>
                <Th className="dark:text-gray-300">Category</Th>
                <Th className="dark:text-gray-300">Account</Th>
                <Th className="dark:text-gray-300">Action</Th>
              </Tr>
            </Thead>
            <Tbody className="dark:bg-gray-800 bg-white">
              {paymentSettingData?.map((data: any, index: number) => {
                return (
                  <Tr className="h-14" key={index}>
                    <Td className="">{data?.source}</Td>
                    <Td className="">{data?.title}</Td>

                    <Td>{data?.deposit_category?.title}</Td>
                    <Td className="">{data?.account?.account_name}</Td>
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
                            className="absolute top-8 -left-14 bg-white dark:bg-gray-700 dark:border-gray-500 border shadow-md rounded-lg p-4 z-20 min-w-40"
                          >
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                              onClick={() => handleEditClick(data)}
                            >
                              Edit
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
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
