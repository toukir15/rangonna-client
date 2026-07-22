import Image from "next/image";
import React, { useEffect, useState } from "react";
import noData from "@admin/assets/images/noDataFound.png";
import { ToastService } from "@admin/utils/toastr.service";
import { OrdersService } from "@admin/@services/apis/OrdersService/Orders.service";
import NoteModal from "@admin/components/core/Modal/ModalNote";
import NoteSkeleton from "@admin/components/Skeleton/Orders/ViewOrder/NoteSkeleton";
import OrderHistory from "./OrderHistory";
import timeSince from "@admin/utils/hook.utils";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";

interface OrderNotesProps {
  orderId: any;
  showCustomerNote: any;
  fetchOrdersDetail: () => void;
  isLoading: boolean;
  setIsLoading: any;
  syncedNotes?: any[];
}

const OrderNotes: React.FC<OrderNotesProps> = ({
  orderId,
  showCustomerNote,
  fetchOrdersDetail,
  isLoading,
  setIsLoading,
  syncedNotes,
}) => {
  const { permissionList } = useGlobalContext();
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isViewNoteModalOpen, setIsViewNoteModalOpen] = useState(false);
  const [customerNote, setCustomerNote] = useState("");
  const [orderNoteText, setOrderNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isNoteLading, setIsNoteLoading] = useState<boolean>(true);
  const [noteData, setNotesData] = useState<any>();
  const [historyLoading, setHistoryLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<any>();

  const handleSubmitCustomerNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await OrdersService.updateCustomerNote(orderId, {
        customer_note: customerNote,
      });

      if (res?.success) {
        ToastService.success(res?.message);
        fetchOrdersDetail();
        setIsAddNoteModalOpen(false);
        setCustomerNote("");
        setIsLoading(true);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleSubmitOrderNote = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    OrdersService.noteUpdate(orderId, { text: orderNoteText })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrdersDetail();
          if (res?.notes) {
            setNotesData(res.notes);
          } else {
            handleGetNotes();
          }
          setIsViewNoteModalOpen(false);
          setIsLoading(true);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmitting(false);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    handleGetNotes();
    fetchOrderHistory();
  }, []);

  useEffect(() => {
    if (syncedNotes) {
      setNotesData(syncedNotes);
      setIsNoteLoading(false);
    }
  }, [syncedNotes]);

  const handleGetNotes = async () => {
    OrdersService.getOrdersNotes(orderId)
      .then((res: any) => {
        if (res?.success) {
          setNotesData(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsNoteLoading(false);
      });
  };
  const fetchOrderHistory = async () => {
    setHistoryLoading(true);
    OrdersService.getOrdersHistory(orderId)
      .then((res: any) => {
        if (res?.success) {
          setHistory(res.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setHistoryLoading(false);
      });
  };

  return (
    <>
      <NoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        title="Add Customer Note"
        onSubmit={handleSubmitCustomerNote}
        noteValue={customerNote}
        onNoteChange={setCustomerNote}
        isSubmitting={isSubmitting}
        submitButtonText="Save Customer Note"
      />

      <NoteModal
        isOpen={isViewNoteModalOpen}
        onClose={() => setIsViewNoteModalOpen(false)}
        title="Add Order Note"
        onSubmit={handleSubmitOrderNote}
        noteValue={orderNoteText}
        onNoteChange={setOrderNoteText}
        isSubmitting={isSubmitting}
        submitButtonText="Save Order Note"
      />

      {/* Order Notes Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-gray-400">Notes</h2>
          {hasPermission(permissionList, "order_edit") && (
            <button
              onClick={() => setIsViewNoteModalOpen(true)}
              className="text-blue-500 bg-blue-100 px-2 py-0.5  rounded-lg hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              + Add Note
            </button>
          )}
        </div>

        {isNoteLading ? (
          <NoteSkeleton />
        ) : noteData?.length > 0 ? (
          <div className="mt-3 space-y-2">
            {noteData.slice(0, 3).map((note: any, index: any) => (
              <div
                key={index}
                className="flex gap-2 items-center justify-between bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded-lg border border-green-100 dark:border-green-900"
              >
                <p className="text-sm text-green-700 dark:text-green-200">
                  {note.text} - {note?.user?.name}
                </p>
                <span className="text-xs text-green-600 dark:text-green-300 text-nowrap">
                  {timeSince(new Date(note?.createdAt))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Image
              src={noData}
              alt="No notes found"
              width={56}
              height={56}
              className="h-14 w-auto opacity-70"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No notes available
            </p>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3">
        <OrderHistory ordersHistory={history} isLoading={historyLoading} />
      </div>

      {/* Customer Note Section */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-gray-400">
            Customer & Courier Note
          </h2>
          {hasPermission(permissionList, "order_edit") && (
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="text-blue-500 bg-blue-100 px-2 py-0.5 rounded-lg hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              + Add Note
            </button>
          )}
        </div>

        {isLoading ? (
          <NoteSkeleton />
        ) : showCustomerNote?.customer_note?.text ? (
          <div className="mt-3 flex items-start">
            <div className="flex flex-col items-center mr-3">
              <div className="w-3 h-3 bg-green-500 rounded-full mt-3.5" />
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2 flex-1 ">
              <p className="text-gray-800 dark:text-gray-200 flex gap-2 items-center justify-between">
                {showCustomerNote?.customer_note?.text}-
                {showCustomerNote?.customer_note?.user?.name}
                <span className="text-xs text-green-600 dark:text-green-300 text-nowrap">
                  {timeSince(
                    new Date(showCustomerNote?.customer_note?.createdAt)
                  )}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <Image
              src={noData}
              alt="No customer note found"
              width={56}
              height={56}
              className="h-14 w-auto opacity-70"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              No customer note available
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderNotes;
