"use client";

import React, { useState } from "react";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import PageSearch from "@admin/components/core/Search/PageSearch";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ToastService } from "@admin/utils/toastr.service";
import { SslcommerzService } from "@admin/@services/apis/OrdersService/Sslcommerz.service";
import SslcommerzTransactionDetails from "@admin/components/pages/Sslcommerz/SslcommerzTransactionDetails";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { noPermission } from "@admin/utils/constant";
import { ISslcommerzTransaction } from "@admin/@interfaces/sslcommerz/sslcommerz.interface";

type SearchEvent =
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>
  | React.KeyboardEvent<HTMLInputElement>;

const Page: React.FC = () => {
  const { canFetchPageData } = useGlobalContext();
  const [trxId, setTrxId] = useState<string>("");
  const [transactionData, setTransactionData] =
    useState<ISslcommerzTransaction | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const fetchTransaction = async (searchTrxId: string) => {
    const trimmedTrxId = searchTrxId.trim();
    if (!trimmedTrxId) {
      ToastService.error("Please enter a transaction ID");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const res = await SslcommerzService.getTransaction(trimmedTrxId);

      if (res?.success && res?.data) {
        setTransactionData(res.data);

        const isValidated =
          res.data.status?.toUpperCase() === "VALIDATED" ||
          res.data.status?.toUpperCase() === "VALID";

        if (isValidated) {
          ToastService.success(res.message);
        } else {
          ToastService.error("Payment Failed");
        }
      } else {
        setTransactionData(null);
        ToastService.error(res?.message || "Transaction not found");
      }
    } catch (err: any) {
      setTransactionData(null);
      ToastService.error(err?.message || "Failed to fetch transaction");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: SearchEvent) => {
    e.preventDefault();
    fetchTransaction(trxId);
  };

  return (
    <AuthLayout>
      <NoScrollLayout>
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            SSLCommerz Transaction
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Search transaction details by Trx ID.
          </p>
        </div>
      </NoScrollLayout>

      <div className="px-4 py-6">
        <div className="mx-auto max-w-xl space-y-6">
          <form
            onSubmit={handleSearchSubmit}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <PageSearch
                value={trxId}
                onChange={(e) => setTrxId(e.target.value)}
                placeholder="Enter Trx ID"
                wrapperClass="flex-1 w-full"
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="!bg-indigo-500 whitespace-nowrap"
              >
                {isLoading ? <ButtonLoader /> : "Search"}
              </Button>
            </div>
          </form>

          {isLoading && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="h-24 animate-pulse bg-gradient-to-r from-indigo-200 to-cyan-200 dark:from-indigo-900 dark:to-cyan-900" />
              <div className="space-y-4 p-5">
                <div className="h-28 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                  <div className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            </div>
          )}

          {!isLoading && hasSearched && transactionData && (
            <SslcommerzTransactionDetails data={transactionData} />
          )}

          {!isLoading && hasSearched && !transactionData && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                No transaction data found for this Trx ID.
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Please check the ID and try again.
              </p>
            </div>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Page;
