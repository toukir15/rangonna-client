"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import Icon from "@admin/components/core/Icon/Icon";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
// import Image from "next/image";
import { RefundListService } from "@admin/@services/apis/RefundList/RefundList.service";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission } from "@admin/utils";
import RefundViewSkeleton from "@admin/components/Skeleton/Refund/RefundViewSkeleton";
import RefundModal from "@admin/components/pages/RefundList/RefundModal";
import { RefundListContext } from "@/app/admin/orders/refund/page";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { formatTimeAgo } from "@admin/utils/hook.utils";
import RefunTrack from "@admin/components/pages/RefundList/RefunTrack";
import { reasonOptions } from "@admin/components/pages/Utilities/paymentData";

export interface IRefund {
  _id: string;
  trx_id: string;

  order: {
    _id: string;
    sysid: string;
    status: string;
    createdAt: string;
  };

  amount: number;
  reason: string;
  customer_account: string;
  status: "pending" | "processing" | "rejected" | "completed";
  payment_method: "bkash" | "nagad" | "bank" | string;

  is_partial: boolean;

  created_by: {
    _id: string;
    name: string;
    email: string;
  };

  paid_by: {
    _id: string;
    name: string;
    email?: string;
  } | null;

  approved_by: {
    _id: string;
    name: string;
    email?: string;
  } | null;

  notes: Note[];

  createdAt: string;
  updatedAt: string;

  __v: number;
}

export interface Note {
  _id: string;
  text: string;
  createdAt?: string;

  user: {
    _id: string;
    name: string;
  };
}

type RefundStatusKey = "pending" | "processing" | "completed" | "rejected";

const refundTrackerStatusList = [
  { label: "Pending", key: "pending", icon: "hourglass_empty" },
  { label: "Approved", key: "processing", icon: "sync" },
  { label: "Rejected", key: "rejected", icon: "close" },
  { label: "Completed", key: "completed", icon: "verified" },
];

const refundTrackerFlowMap: Record<string, string[]> = {
  pending: ["processing", "rejected"],
  processing: ["completed"],
  completed: ["rejected"],
  rejected: [],
};

const statusStyle: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
};

// const ItemCard = ({ item }: { item: RefundLineItem }) => {
//   const image = item?.product_id?.featured_image?.src;

//   return (
//     <div className="group rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
//       <div className="flex gap-3">
//         {image ? (
//           <Image
//             src={image}
//             alt={item?.product_id?.featured_image?.title || "Product"}
//             width={72}
//             height={72}
//             className="h-[72px] w-[72px] rounded-xl border border-gray-100 object-cover"
//             referrerPolicy="no-referrer"
//           />
//         ) : (
//           <div className="flex h-[72px] w-[72px] items-center justify-center rounded-xl bg-gray-100 text-gray-400">
//             <Icon name="image" variant="outlined" />
//           </div>
//         )}

//         <div className="min-w-0 flex-1">
//           <p className="truncate text-sm font-bold text-gray-800">
//             {item?.title || "--"}
//           </p>

//           <div className="mt-2 grid grid-cols-3 gap-2">
//             <div className="rounded-lg bg-gray-50 px-2 py-1">
//               <p className="text-[10px] font-semibold uppercase text-gray-400">
//                 Qty
//               </p>
//               <p className="text-xs font-bold text-gray-700">
//                 {item?.quantity || 0}
//               </p>
//             </div>

//             <div className="rounded-lg bg-gray-50 px-2 py-1">
//               <p className="text-[10px] font-semibold uppercase text-gray-400">
//                 Price
//               </p>
//               <p className="text-xs font-bold text-gray-700">
//                 ৳ {item?.price || 0}
//               </p>
//             </div>

//             <div className="rounded-lg bg-blue-50 px-2 py-1">
//               <p className="text-[10px] font-semibold uppercase text-blue-400">
//                 Total
//               </p>
//               <p className="text-xs font-bold text-blue-700">
//                 ৳ {item?.total || 0}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

const InfoBlock = ({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | number;
  icon?: string;
}) => (
  <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md">
    <div className="flex items-start gap-3">
      {icon && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon name={icon} variant="outlined" />
        </div>
      )}

      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-bold text-gray-800">
          {value || "--"}
        </p>
      </div>
    </div>
  </div>
);

const noteSchema = yup.object({
  note: yup.string().trim().required("Note required"),
});
type NoteForm = yup.InferType<typeof noteSchema>;

const Page: React.FC = () => {
  const { permissionList } = useGlobalContext();
  const { sysId } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [refund, setRefund] = useState<IRefund | null>();
  const [currentStatus, setCurrentStatus] = useState<string>("");
  const [statusLoading, setStatusLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"Add" | "Edit">("Edit");
  const [selectedRefund, setSelectedRefund] = useState<IRefund | null>(null);
  const [statusUpdateOnly, setStatusUpdateOnly] = useState(false);

  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteSubmitLoading, setNoteSubmitLoading] = useState(false);
  const [pendingStatusAfterNote, setPendingStatusAfterNote] = useState<
    "rejected" | null
  >(null);

  const {
    handleSubmit: handleNoteSubmit,
    register: registerNote,
    reset: resetNoteForm,
    formState: { errors: noteErrors },
  } = useForm<NoteForm>({
    resolver: yupResolver(noteSchema),
    defaultValues: { note: "" },
  });

  const canUpdateStatus = hasPermission(permissionList, "order_refund_edit");

  const createdAt = useMemo(() => {
    if (!refund?.createdAt) return "--";
    return new Date(refund.createdAt).toLocaleString();
  }, [refund?.createdAt]);

  const updatedAt = useMemo(() => {
    if (!refund?.updatedAt) return "--";
    return new Date(refund.updatedAt).toLocaleString();
  }, [refund?.updatedAt]);

  const fetchSingleRefund = async () => {
    if (!sysId) return;

    setIsLoading(true);

    try {
      const res = await RefundListService.getSingleRefund(sysId);

      if (res?.success) {
        setRefund(res?.data || null);
        setCurrentStatus((res?.data?.status || "pending").toLowerCase());
      } else {
        ToastService.error(res?.message || "Failed to fetch refund");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch refund";
      ToastService.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSingleRefund();
  }, [sysId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!refund?._id) return;
    if (!["pending", "processing", "completed", "rejected"].includes(newStatus))
      return;
    if (newStatus === currentStatus) return;
    if (newStatus === "completed") {
      setModalMode("Edit");
      setStatusUpdateOnly(true);
      setSelectedRefund(refund);
      setIsModalOpen(true);

      return;
    }
    if (newStatus === "rejected") {
      setPendingStatusAfterNote("rejected");
      openNoteModal();
      return;
    }

    try {
      setStatusLoading(true);

      const res = await RefundListService.updateStatusRefund(refund._id, {
        status: newStatus as RefundStatusKey,
      });

      if (res?.success) {
        ToastService.success(res?.message || "Status updated");
        setCurrentStatus(newStatus);
        fetchSingleRefund();
      } else {
        ToastService.error(res?.message || "Failed to update status");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      ToastService.error(message);
    } finally {
      setStatusLoading(false);
    }
  };

  const openNoteModal = () => {
    resetNoteForm({ note: "" });
    setIsNoteModalOpen(true);
  };

  const closeNoteModal = () => {
    setIsNoteModalOpen(false);
    setPendingStatusAfterNote(null);
    resetNoteForm({ note: "" });
  };

  const submitNote = async (data: NoteForm) => {
    if (!refund?._id) return;

    try {
      setNoteSubmitLoading(true);

      // 1. First create note
      const noteRes = await RefundListService.createNote(refund._id, {
        text: data.note,
      });

      if (!noteRes?.success) {
        ToastService.error(noteRes?.message || "Failed to update note");
        return;
      }

      // 2. If rejected, then update status
      if (pendingStatusAfterNote === "rejected") {
        const statusRes = await RefundListService.updateStatusRefund(
          refund._id,
          {
            status: "rejected",
          },
        );

        if (!statusRes?.success) {
          ToastService.error(statusRes?.message || "Failed to reject refund");
          return;
        }

        setCurrentStatus("rejected");
        ToastService.success(
          statusRes?.message || "Refund rejected successfully",
        );
      } else {
        ToastService.success(noteRes?.message || "Note updated successfully");
      }

      closeNoteModal();
      fetchSingleRefund();
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setNoteSubmitLoading(false);
    }
  };

  const reasonLabel =
    reasonOptions.find((item) => item.value === refund?.reason)?.label || "--";

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="flex flex-wrap items-center  gap-3 px-3 pb-3 pt-3 2xl:px-4 2xl:pt-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-blue-950 dark:text-gray-200 lg:text-xl 2xl:text-2xl">
                Refund View
              </h2>
              <p className="text-xs font-medium text-gray-500">
                View and manage refund details
              </p>
            </div>
          </div>

          {canUpdateStatus && refund?.status !== "completed" && (
            <Button
              type="button"
              className="!rounded-lg !bg-blue-200 !px-5 !py-2 !text-sm !font-bold !text-blue-600 shadow-sm transition hover:!bg-blue-700"
              onClick={() => {
                if (!refund?._id) return;
                setModalMode("Edit");
                setStatusUpdateOnly(false);
                setSelectedRefund(refund);
                setIsModalOpen(true);
              }}
              disabled={!refund?._id || isLoading}
            >
              Update Refund
            </Button>
          )}
        </div>
      </NoScrollLayout>
      {/* bg-slate-50 */}
      <div className="min-h-[72vh]  px-3 pb-5 pt-3 2xl:px-4">
        {isLoading ? (
          <RefundViewSkeleton />
        ) : !refund?._id ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
            <p className="text-sm font-semibold text-red-600">
              Refund data not found.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm">
              <div className="relative  p-5">
                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-4 border-b border-blue-100 pb-4">
                  <div className="">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-400">
                      Refund Order
                    </p>

                    <h1 className="mt-1 text-2xl font-black text-blue-900">
                      #{refund?.order?.sysid || "--"}
                    </h1>

                    <p className="mt-2 text-sm font-medium text-blue-500">
                      TRX ID: {refund?.trx_id || "--"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black capitalize ${
                        statusStyle[currentStatus] ||
                        "border-gray-200 bg-gray-100 text-gray-700"
                      }`}
                    >
                      {currentStatus || "--"}
                    </span>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-black ${
                        refund?.is_partial
                          ? "border-orange-200 bg-orange-100 text-orange-700"
                          : "border-emerald-200 bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {refund?.is_partial ? "Partial Refund" : "Full Refund"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
                <InfoBlock
                  label="Refund Amount"
                  value={`৳ ${refund?.amount || 0}`}
                  icon="account_balance_wallet"
                />
                <InfoBlock
                  label="Payment Method"
                  value={refund?.payment_method}
                  icon="payments"
                />
                <InfoBlock
                  label="Customer Account"
                  value={refund?.customer_account}
                  icon="person"
                />
                <InfoBlock label="Created At" value={createdAt} icon="event" />
                <InfoBlock label="Updated At" value={updatedAt} icon="update" />
                <InfoBlock
                  label="Created By"
                  value={refund?.created_by?.name}
                  icon="badge"
                />
                {/* <InfoBlock
                  label="Created By Email"
                  value={refund?.created_by?.email}
                  icon="mail"
                /> */}
                <InfoBlock
                  label="Approved By"
                  value={refund?.approved_by?.name}
                  icon="verified_user"
                />
                <InfoBlock
                  label="Paid By"
                  value={refund?.paid_by?.name}
                  icon="verified_user"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Icon name="description" variant="outlined" />
                  </div>
                  <h3 className="text-sm font-black text-gray-800">Reason</h3>
                </div>

                <p className="min-h-[70px] whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-700">
                  {reasonLabel || "--"}
                </p>
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Icon name="notes" variant="outlined" />
                    </div>
                    <h3 className="text-sm font-black text-gray-800">Note</h3>
                  </div>

                  {canUpdateStatus && (
                    <Button
                      type="button"
                      className="!px-3 !py-1.5 !text-xs !bg-blue-500"
                      onClick={openNoteModal}
                      disabled={!refund?._id}
                    >
                      {"Add Note"}
                    </Button>
                  )}
                </div>

                <div className="min-h-[70px] whitespace-pre-wrap rounded-2xl bg-gray-50 p-4 text-sm font-medium leading-6 text-gray-700 h-44 overflow-y-auto">
                  {refund?.notes.map((note: any) => (
                    <div
                      key={note._id}
                      className="flex items-center justify-between bg-green-100 border border-green-400 rounded-lg p-2 mb-2"
                    >
                      <p>
                        {note.text} - {note.user?.name || "Unknown"}
                      </p>
                      <small>
                        {note?.createdAt
                          ? formatTimeAgo(note?.createdAt)
                          : "No date"}
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon name="inventory_2" variant="outlined" />
                  </div>
                  <h3 className="text-sm font-black text-gray-800">
                    Order Items
                  </h3>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {refund?.order?.line_items?.length || 0} Items
                </span>
              </div>

              {refund?.order?.line_items?.length ? (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {refund.order.line_items.map((item, index) => (
                    <ItemCard
                      key={`${item?.title || "item"}-${index}`}
                      item={item}
                    />
                  ))}
                </div>
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-500">
                  No order item found
                </p>
              )}
            </div> */}

            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon name="timeline" variant="outlined" />
                </div>
                <h3 className="text-sm font-black text-gray-800">
                  Track Refund
                </h3>
              </div>

              {canUpdateStatus ? (
                <RefunTrack
                  currentStep={currentStatus}
                  updateOrderStatus={handleStatusUpdate}
                  statusLoading={statusLoading}
                  requiredPermission="order_refund_edit"
                  statusList={refundTrackerStatusList}
                  flowMap={refundTrackerFlowMap}
                  lockedStatuses={["completed", "rejected"]}
                />
              ) : (
                <p className="rounded-2xl bg-gray-50 p-4 text-sm font-medium text-gray-500">
                  You do not have permission to update status.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <RefundListContext.Provider
        value={{
          modalMode,
          setModalMode,
          isModalOpen,
          setIsModalOpen,
          fetchReturnList: fetchSingleRefund,
          selectedRefund,
          setSelectedRefund,
          statusUpdateOnly,
          setStatusUpdateOnly,
        }}
      >
        <RefundModal />
      </RefundListContext.Provider>

      <form onSubmit={handleNoteSubmit(submitNote)}>
        <Modal isOpen={isNoteModalOpen} onClose={closeNoteModal}>
          <Modal.Header className="flex justify-between">
            <h3 className="text-lg font-medium">Note</h3>
            <Icon name="close" onClick={closeNoteModal} />
          </Modal.Header>
          <Modal.Body>
            <Input
              label="Note"
              placeholder="Write note"
              type="textarea"
              registerProperty={registerNote("note")}
              errorText={noteErrors?.note?.message}
              isRequired
              noMargin
            />
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                className="!bg-gray-200 !text-gray-800"
                onClick={closeNoteModal}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={noteSubmitLoading}>
                {noteSubmitLoading ? <ButtonLoader /> : "Save"}
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      </form>
    </AuthLayout>
  );
};

export default Page;
