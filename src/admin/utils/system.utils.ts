export const getStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "all": // Neutral → Slate
      return "bg-slate-200 text-slate-800 py-1.5 rounded-lg font-semibold uppercase";
    case "pending": // 🟡 Yellow (hold state, neutral waiting)
      return "bg-yellow-200 text-yellow-800 py-1.5 rounded-lg font-semibold uppercase";
    case "waiting-payment": // 🟠 Orange (money-related, urgent)
      return "bg-orange-200 text-orange-800 py-1.5 rounded-lg font-semibold uppercase";
    case "recall": // 🔷 Sky (callback / restore)
      return "bg-sky-200 text-sky-800 py-1.5 rounded-lg font-semibold uppercase";
    case "approved": // 🟢 Green
      return "bg-green-200 text-green-800 py-1.5 rounded-lg font-semibold uppercase";
    case "printed": // 🟣 Violet (clearer than purple)
      return "bg-violet-200 text-violet-800 py-1.5 rounded-lg font-semibold uppercase";
    case "ready-for-box": // ⚫ Dark Gray
      return "bg-gray-800 text-white py-1.5 rounded-lg font-semibold uppercase";
    case "in-transit": // 🟦 Teal
      return "bg-teal-200 text-teal-800 py-1.5 rounded-lg font-semibold uppercase";
    case "follow-up": // 🔵 Indigo
      return "bg-indigo-200 text-indigo-800 py-1.5 rounded-lg font-semibold uppercase";
    case "delivery": // 🟤 Rose
      return "bg-emerald-200 text-emerald-800 py-1.5 rounded-lg font-semibold uppercase";
    case "cancel": // 🔴 Red
      return "bg-red-200 text-red-800 py-1.5 rounded-lg font-semibold uppercase";
    case "rejected": // 🔴 Red
      return "bg-red-200 text-red-800 py-1.5 rounded-lg font-semibold uppercase";
    case "refunded": // 🌸 Fuchsia
      return "bg-fuchsia-200 text-fuchsia-800 py-1.5 rounded-lg font-semibold uppercase";
    case "return": // 🟩 Emerald (distinct from green)
      return "bg-rose-200 text-rose-800 py-1.5 rounded-lg font-semibold uppercase";
    case "exchange": // ⚪ Zinc (light gray, different from slate)
      return "bg-zinc-200 text-zinc-800 py-1.5 rounded-lg font-semibold uppercase";
    default:
      return "bg-slate-200 text-slate-800 py-1.5 rounded-lg font-semibold uppercase";
  }
};

export const priorityStyle = (priority?: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      // 🔥 Deep rose / danger but premium
      return "bg-rose-100 text-rose-700 font-semibold";

    case "medium":
      // 🟣 Royal violet – unique & professional
      return "bg-violet-100 text-violet-700 font-semibold";

    case "low":
      // 🟢 Mint / teal – calm & modern
      return "bg-teal-100 text-teal-700 font-semibold";

    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const taskStatusStyle = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      // 🟡 Waiting / not started
      return "bg-yellow-100 text-yellow-800 py-1.5 rounded-lg font-semibold uppercase";

    case "in progress":
    case "in-progress":
      // 🔵 Actively working
      return "bg-blue-100 text-blue-800 py-1.5 rounded-lg font-semibold uppercase";

    case "on hold":
    case "on-hold":
      // 🟠 Paused / blocked
      return "bg-orange-200 text-orange-800 py-1.5 rounded-lg font-semibold uppercase";

    case "in review":
    case "in-review":
      // 🟣 Under review / QA / approval
      return "bg-violet-100 text-violet-800 py-1.5 rounded-lg font-semibold uppercase";

    case "complete":
    case "completed":
      // 🟢 Finished successfully
      return "bg-green-100 text-green-800 py-1.5 rounded-lg font-semibold uppercase";

    case "cancel":
    case "canceled":
    case "cancelled":
      // 🔴 Stopped / failed
      return "bg-red-100 text-red-800 py-1.5 rounded-lg font-semibold uppercase";

    default:
      // ⚪ Neutral fallback
      return "bg-slate-100 text-slate-800 py-1.5 rounded-lg font-semibold uppercase";
  }
};

export const getStatusBgStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "all":
      return "bg-slate-600 border border-slate-500";
    case "pending":
      return "bg-yellow-600 border border-yellow-500";
    case "waiting-payment":
      return "bg-orange-500 border border-orange-400";
    case "recall":
      return "bg-sky-600 border border-sky-500";
    case "approved":
      return "bg-green-600 border border-green-500";
    case "printed":
      return "bg-violet-600 border border-violet-500";
    case "ready-for-box":
      return "bg-gray-600 border border-gray-500";
    case "in-transit":
      return "bg-teal-600 border border-teal-500";
    case "follow-up":
      return "bg-indigo-600 border border-indigo-500";
    case "delivery":
      return "bg-rose-600 border border-rose-500";
    case "cancel":
      return "bg-red-600 border border-red-500";
    case "refunded":
      return "bg-fuchsia-600 border border-fuchsia-500";
    case "return":
      return "bg-emerald-600 border border-emerald-500";
    case "exchange":
      return "bg-zinc-600 border border-zinc-500";
    default:
      return "bg-slate-200";
  }
};

export const getStatusTextStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "all":
      return "text-slate-600";
    case "pending":
      return "text-yellow-600";
    case "waiting-payment":
      return "text-orange-600";
    case "recall":
      return "text-sky-600";
    case "approved":
      return "text-green-600";
    case "printed":
      return "text-violet-600";
    case "ready-for-box":
      return "text-gray-600";
    case "in-transit":
      return "text-teal-600";
    case "follow-up":
      return "text-indigo-600";
    case "delivery":
      return "text-rose-600";
    case "cancel":
      return "text-red-600";
    case "refunded":
      return "text-fuchsia-600";
    case "return":
      return "text-emerald-600";
    case "exchange":
      return "text-zinc-600";
    default:
      return "text-slate-600";
  }
};

export const ReportIssueStatusStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 py-1.5 rounded-lg font-semibold uppercase";
    case "received-product":
      return "bg-green-100 text-green-700 py-1.5 rounded-lg font-semibold uppercase";
    case "assign":
      return "bg-blue-100 text-blue-700 py-1.5 rounded-lg font-semibold uppercase";
    case "product-sent-to-supplier":
      return "bg-indigo-100 text-indigo-700 py-1.5 rounded-lg font-semibold uppercase";
    case "received-from-supplier":
      return "bg-teal-100 text-teal-700 py-1.5 rounded-lg font-semibold uppercase";
    case "checking":
      return "bg-purple-100 text-purple-700 py-1.5 rounded-lg font-semibold uppercase";
    case "solved":
      return "bg-emerald-100 text-emerald-700 py-1.5 rounded-lg font-semibold uppercase";
    case "delivery":
      return "bg-cyan-100 text-cyan-700 py-1.5 rounded-lg font-semibold uppercase";
    case "close":
      return "bg-red-100 text-red-700 py-1.5 rounded-lg font-semibold uppercase";
    default:
      return "bg-slate-100 text-slate-700 py-1.5 rounded-lg font-semibold uppercase";
  }
};

export const getPaymentStatusStyle = (status: string) => {
  switch (status) {
    case "paid":
      return "text-green-600 bg-green-100 px-4 py-0.5 rounded-md uppercase font-semibold text-center w-20 mt-1 text-sm";
    case "due":
      return "text-red-600 bg-red-100 px-4 py-0.5 rounded-md uppercase font-semibold text-center w-20 mt-1 text-sm";
    case "partial":
      return "text-yellow-600 bg-yellow-100 px-4 py-0.5 rounded-md uppercase font-semibold text-center w-20 mt-1 text-sm";
    default:
      return "text-gray-600 bg-gray-100 px-4 py-0.5 rounded-md uppercase font-semibold text-center w-20 mt-1 text-sm";
  }
};
