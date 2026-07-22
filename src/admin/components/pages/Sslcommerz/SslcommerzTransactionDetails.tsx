"use client";

import React from "react";
import Icon from "@admin/components/core/Icon/Icon";
import { ISslcommerzTransaction } from "@admin/@interfaces/sslcommerz/sslcommerz.interface";

interface SslcommerzTransactionDetailsProps {
  data: ISslcommerzTransaction;
}

const isPaymentSuccess = (status?: string) => {
  const normalized = status?.toUpperCase();
  return normalized === "VALIDATED" || normalized === "VALID";
};

const formatAmount = (amount?: string | number) => {
  if (amount === null || amount === undefined || amount === "") return "0";

  const numericAmount =
    typeof amount === "number" ? amount : Number.parseFloat(amount);

  if (Number.isNaN(numericAmount)) return String(amount);

  return numericAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatTranDate = (date?: string) => {
  if (!date) return "N/A";

  const parsedDate = new Date(date.replace(" ", "T"));

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const PaymentFailedView = () => (
  <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm dark:border-red-900/40 dark:bg-gray-900">
    <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-5 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm">
          <Icon name="cancel" className="text-white" size={36} />
        </div>
        <h2 className="text-xl font-bold text-white">Payment Failed</h2>
        <p className="mt-2 max-w-sm text-sm text-white/80">
          This transaction was not completed successfully. Please verify the
          Tran ID or request a new payment.
        </p>
      </div>
    </div>
  </div>
);

const SslcommerzTransactionDetails: React.FC<
  SslcommerzTransactionDetailsProps
> = ({ data }) => {
  if (!data) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        No transaction data found.
      </p>
    );
  }

  if (!isPaymentSuccess(data.status)) {
    return <PaymentFailedView />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Icon name="check_circle" className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white/90">
                SSLCommerz Transaction
              </p>
              <p className="text-xs text-white/75">Payment Successful</p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
            {data.status}
          </span>
        </div>
      </div>

      <div className="px-5 py-6">
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/70 px-4 py-5 text-center dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Transaction Amount
          </p>
          <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">
            ৳ {formatAmount(data.amount)}
          </p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
            <div className="mb-2 flex items-center gap-2">
              <Icon
                name="receipt_long"
                size={18}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tran ID
              </p>
            </div>
            <p className="break-all text-sm font-semibold text-gray-900 dark:text-gray-100">
              {data.tran_id || "N/A"}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/80">
            <div className="mb-2 flex items-center gap-2">
              <Icon
                name="schedule"
                size={18}
                className="text-emerald-500 dark:text-emerald-400"
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Tran Date
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {formatTranDate(data.tran_date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SslcommerzTransactionDetails;
