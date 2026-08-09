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
      <div className="ov-panel">
        <div className="ov-panel__head">
          <h2 className="ov-panel__title">Notes</h2>
          {hasPermission(permissionList, "order_edit") && (
            <button
              onClick={() => setIsViewNoteModalOpen(true)}
              className="ov-panel__add"
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
              <div key={index} className="ov-note-chip">
                <p className="text-sm text-[var(--ov-ink)] dark:text-gray-200">
                  {note.text} - {note?.user?.name}
                </p>
                <span className="text-xs text-[var(--ov-muted)] text-nowrap">
                  {timeSince(new Date(note?.createdAt))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="ov-empty">
            <Image
              src={noData}
              alt="No notes found"
              width={56}
              height={56}
              className="h-14 w-auto opacity-70"
            />
            <p>No notes available</p>
          </div>
        )}
      </div>

      <div className="ov-panel">
        <OrderHistory ordersHistory={history} isLoading={historyLoading} />
      </div>

      {/* Customer Note Section */}
      <div className="ov-panel">
        <div className="ov-panel__head">
          <h2 className="ov-panel__title">Customer & Courier Note</h2>
          {hasPermission(permissionList, "order_edit") && (
            <button
              onClick={() => setIsAddNoteModalOpen(true)}
              className="ov-panel__add"
            >
              + Add Note
            </button>
          )}
        </div>

        {isLoading ? (
          <NoteSkeleton />
        ) : showCustomerNote?.customer_note?.text ? (
          <div className="mt-3 flex items-start gap-3">
            <div className="ov-timeline__dot mt-3.5" />
            <div className="ov-note-bubble">
              <p className="flex gap-2 items-center justify-between text-sm">
                <span>
                  {showCustomerNote?.customer_note?.text}-
                  {showCustomerNote?.customer_note?.user?.name}
                </span>
                <span className="ov-timeline__meta text-nowrap text-[var(--color-primary)]">
                  {timeSince(
                    new Date(showCustomerNote?.customer_note?.createdAt),
                  )}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className="ov-empty">
            <Image
              src={noData}
              alt="No customer note found"
              width={56}
              height={56}
              className="h-14 w-auto opacity-70"
            />
            <p>No customer note available</p>
          </div>
        )}
      </div>
    </>
  );
};

export default OrderNotes;
