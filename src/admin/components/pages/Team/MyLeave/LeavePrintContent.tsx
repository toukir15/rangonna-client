import React from "react";
import { formateDateWithMonth } from "@admin/utils";

export type LeaveApplicationRow = {
  _id?: string;
  user?: { name?: string; email?: string; phone?: string };
  leave_title?: string;
  leave_description?: string;
  total_days?: number | string;
  start_date?: string;
  end_date?: string;
  rejection_reason?: string;
  status?: string;
  createdAt?: string;
};

const safeValue = (value?: string | number | null) =>
  value !== undefined && value !== null && String(value).trim()
    ? String(value)
    : "—";

// const Field = ({ label, value }: { label: string; value?: string | null }) => (
//   <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
//     <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-slate-500">
//       {label}
//     </p>
//     <p className="mt-0.5 truncate text-[12px] font-bold text-slate-900">
//       {safeValue(value)}
//     </p>
//   </div>
// );

// const InfoBox = ({
//   label,
//   value,
//   strong,
// }: {
//   label: string;
//   value?: string | number | null;
//   strong?: boolean;
// }) => (
//   <div className="rounded-lg border border-slate-200 bg-gradient-to-b from-white to-slate-50 px-3 py-2 shadow-sm">
//     <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-slate-400">
//       {label}
//     </p>
//     <p
//       className={
//         strong
//           ? "mt-0.5 text-base font-black text-slate-950"
//           : "mt-0.5 text-[12px] font-extrabold text-slate-900"
//       }
//     >
//       {safeValue(value)}
//     </p>
//   </div>
// );

export const LeavePrintContent: React.FC<{ row: LeaveApplicationRow }> = ({
  row,
}) => {
  // const appliedOn = row.createdAt ? formateDateWithMonth(row.createdAt) : "—";

  return (
    <div
      className="mx-auto bg-white font-sans text-slate-900 print:shadow-none"
      style={{
        width: "210mm",
        height: "297mm",
        overflow: "hidden",
      }}
    >
      <div className="relative flex h-full flex-col overflow-hidden border border-slate-300 bg-white">
        {/* <header className="relative overflow-hidden bg-slate-950 px-8 py-5 text-white">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-slate-400 via-white to-slate-600" />

          <div className="relative z-10 flex items-start justify-between gap-5">
            <div>
              <p className="mb-1 text-[8px] font-bold uppercase tracking-[0.32em] text-slate-300">
                Employee Leave System
              </p>
              <h1 className="text-[25px] font-black tracking-tight">
                Leave Application
              </h1>
              <p className="mt-1 text-[10px] text-slate-300">
                Official employee leave request form
              </p>
            </div>
          </div>
        </header> */}

        <main className="flex-1 px-8 py-5">
          {/* <div className="mb-4 grid grid-cols-2 gap-3">
            <InfoBox label="Applied On" value={appliedOn} />
            <InfoBox label="Total Days" value={row.total_days} strong />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <Field label="Employee Name" value={row.user?.name} />
            <Field label="Employee Email" value={row.user?.email} />
          </div> */}

          <section className="rounded-2xl  bg-white p-5 mt-10">
            <div className="mb-4">
              <p className="text-[13px] font-bold text-slate-900">To,</p>
              <p className="mt-0.5 text-[13px] font-semibold">
                The HR / Manager
              </p>
              <p className="text-[12px] text-slate-600">
                Naviforce Watch Bangladesh
              </p>
            </div>

            <div className="mb-4 rounded-xl bg-slate-50 px-4 py-2">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                Subject
              </p>
              <p className="mt-0.5 text-[13px] font-bold text-slate-900">
                {safeValue(row.leave_title)}
              </p>
            </div>

            <div className="space-y-3 text-[12px] leading-6 text-slate-800">
              <p>Dear Sir/Madam,</p>

              <p>
                I am <strong>{safeValue(row.user?.name)}</strong>, would like to
                request leave from{" "}
                <strong>
                  {row.start_date ? formateDateWithMonth(row.start_date) : "—"}
                </strong>{" "}
                to{" "}
                <strong>
                  {row.end_date ? formateDateWithMonth(row.end_date) : "—"}
                </strong>
                , for a total of <strong>{safeValue(row.total_days)}</strong>{" "}
                day(s).
              </p>

              <div>
                <p className="mb-1 font-semibold text-slate-900">
                  Reason for Leave:
                </p>
                <div className="min-h-[85px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 whitespace-pre-wrap">
                  {row.leave_description?.trim() ? row.leave_description : "—"}
                </div>
              </div>

              <p>
                I kindly request you to approve my leave application. I will
                ensure that all responsibilities are properly managed before my
                leave period.
              </p>

              <p>Thank you for your consideration.</p>

              <div className="pt-2">
                <p>Sincerely,</p>
                <p className="mt-1 text-[13px] font-black text-slate-900">
                  {safeValue(row.user?.name)}
                </p>
                <p className="text-[12px] text-slate-700">
                  {safeValue(row.user?.email)}
                </p>
                <p className="text-[12px] text-slate-700">
                  {safeValue(row.user?.phone)}
                </p>
              </div>
            </div>

            {(row.rejection_reason?.trim() ||
              row.status?.toLowerCase() === "rejected") && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="mb-1 text-[9px] font-bold uppercase tracking-widest text-red-500">
                  Authority Remarks
                </p>
                <p className="text-[11px] leading-5 text-red-900 whitespace-pre-wrap">
                  {row.rejection_reason?.trim() ? row.rejection_reason : "—"}
                </p>
              </div>
            )}
          </section>
        </main>

        <div className="px-8 pb-5">
          <div className="ml-auto w-48 text-center">
            <div className="mb-2 h-9 border-b border-slate-900" />
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-900">
              Authorized Signatory
            </p>
            <p className="text-[9px] font-medium text-slate-500">
              HR / Manager
            </p>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-slate-100 px-8 py-2 text-center text-[8px] font-semibold text-slate-500">
          Generated from employee leave system · Printed{" "}
          {formateDateWithMonth(new Date().toISOString())}
        </footer>
      </div>
    </div>
  );
};
