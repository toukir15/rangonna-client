/** CashFlow-style status pill classes for order/table badges */
export const getStatusStyle = (status?: string) => {
  const base = "table-role-badge";
  switch (status?.toLowerCase()) {
    case "all":
      return `${base} is-neutral`;
    case "pending":
      return `${base} is-pending`;
    case "waiting-payment":
      return `${base} is-warning`;
    case "processing":
    case "in progress":
    case "in-progress":
      return `${base} is-indigo`;
    case "recall":
      return `${base} is-info`;
    case "approved":
    case "delivery":
    case "complete":
    case "completed":
    case "solved":
    case "paid":
      return `${base} is-approved`;
    case "printed":
      return `${base} is-violet`;
    case "ready-for-box":
      return `${base} is-teal`;
    case "in-transit":
      return `${base} is-teal`;
    case "follow-up":
    case "on hold":
    case "on-hold":
    case "in review":
    case "in-review":
      return `${base} is-indigo`;
    case "partial-delivery":
    case "partial":
    case "issue":
      return `${base} is-info`;
    case "cancel":
    case "cancelled":
    case "canceled":
    case "rejected":
    case "damaged":
    case "failed":
    case "due":
    case "close":
      return `${base} is-rejected`;
    case "refunded":
      return `${base} is-fuchsia`;
    case "return":
    case "returned":
      return `${base} is-rose`;
    case "exchange":
    case "exchanged":
      return `${base} is-neutral`;
    case "received-product":
    case "received-from-supplier":
      return `${base} is-teal`;
    case "assign":
    case "product-sent-to-supplier":
      return `${base} is-info`;
    case "checking":
      return `${base} is-violet`;
    case "high":
      return `${base} is-rose`;
    case "medium":
      return `${base} is-violet`;
    case "low":
      return `${base} is-teal`;
    default:
      return `${base} is-neutral`;
  }
};

/** Per-status tone class for OrdersTab filter pills */
export const getStatusFilterTone = (status?: string) => {
  switch (status?.toLowerCase()) {
    case "all":
      return "is-all";
    case "pending":
      return "is-pending";
    case "waiting-payment":
      return "is-to-pay";
    case "processing":
    case "in-progress":
    case "in progress":
      return "is-follow-up";
    case "recall":
      return "is-recall";
    case "approved":
      return "is-approved";
    case "printed":
      return "is-printed";
    case "ready-for-box":
      return "is-rd";
    case "in-transit":
      return "is-transit";
    case "follow-up":
      return "is-follow-up";
    case "delivery":
      return "is-delivery";
    case "partial-delivery":
      return "is-pd";
    case "complete":
    case "completed":
    case "delivered":
      return "is-delivery";
    case "created":
    case "picked":
      return "is-pending";
    case "on-hold":
      return "is-follow-up";
    case "error":
    case "delivery-failed":
      return "is-cancel";
    case "returned":
    case "paid-return":
      return "is-return";
    case "exchanged":
      return "is-exchange";
    case "assigned-for-delivery":
      return "is-approved";
    case "cancel":
    case "cancelled":
    case "canceled":
      return "is-cancel";
    case "refunded":
      return "is-refunded";
    case "return":
      return "is-return";
    case "exchange":
      return "is-exchange";
    case "issue":
      return "is-to-pay";
    case "close":
      return "is-cancel";
    case "damaged":
    case "rejected":
      return "is-damaged";
    default:
      return "is-neutral";
  }
};

/** Display label for order status badges (CashFlow-style capitalize) */
export const getStatusLabel = (status?: string) => {
  if (!status) return "—";
  switch (status.toLowerCase()) {
    case "ready-for-box":
      return "R-D";
    case "waiting-payment":
      return "To be Paid";
    case "partial-delivery":
      return "PD";
    case "in-transit":
      return "Transit";
    case "follow-up":
      return "Follow Up";
    case "cancel":
    case "canceled":
    case "cancelled":
      return "Cancelled";
    default:
      return status
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
  }
};

export const priorityStyle = (priority?: string) => getStatusStyle(priority);

export const taskStatusStyle = (status?: string) => getStatusStyle(status);

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

export const ReportIssueStatusStyle = (status: string) => getStatusStyle(status);

export const getPaymentStatusStyle = (status: string) => getStatusStyle(status);
