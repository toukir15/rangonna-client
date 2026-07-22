"use client";

import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import ContentModal from "@/@components/core/Modal/ContentModal";
import { EmiBankWithRates } from "@/@interfaces/Emi/emi.interface";
import { calculateEmiPlan, formatEmiPrice } from "./emiData";

interface EmiDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  salePrice: number;
  banks: EmiBankWithRates[];
  loading?: boolean;
}

export function EmiDetailsModal({
  isOpen,
  onClose,
  salePrice,
  banks,
  loading = false,
}: EmiDetailsModalProps) {
  const [selectedBankId, setSelectedBankId] = useState("");

  useEffect(() => {
    if (!banks.length) return;

    setSelectedBankId((current) =>
      banks.some((bank) => bank.id === current) ? current : banks[0].id,
    );
  }, [banks]);

  const selectedBank =
    banks.find((bank) => bank.id === selectedBankId) ?? banks[0];
  const tenure = selectedBank?.tenures[0];
  const emiPlan = tenure
    ? calculateEmiPlan(salePrice, tenure.months, tenure.feePercent)
    : null;

  return (
    <ContentModal
      isOpen={isOpen}
      onClose={onClose}
      width="w-[96%]"
      maxWidth="max-w-3xl"
      className="max-h-[90vh] overflow-hidden"
    >
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-gray-900">EMI Details</h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-primary hover:text-primary-dark"
          >
            T&amp;C
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100"
            aria-label="Close EMI details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="border-b border-gray-200 px-5 py-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Product Price</span>
          <span className="text-base font-bold text-gray-900">
            ৳{formatEmiPrice(salePrice)}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[420px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex max-h-[60vh] min-h-[420px] flex-col md:flex-row">
          <div className="max-h-48 overflow-y-auto border-b border-gray-200 md:max-h-none md:w-[42%] md:border-b-0 md:border-r">
            {banks.map((bank) => {
              const isSelected = bank.id === selectedBankId;

              return (
                <button
                  key={bank.id}
                  type="button"
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`flex w-full items-center gap-3 border-l-4 px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary-light"
                      : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                    {bank.initials}
                  </div>
                  <span
                    className={`text-sm ${
                      isSelected
                        ? "font-semibold text-gray-900"
                        : "text-gray-700"
                    }`}
                  >
                    {bank.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="border-b border-gray-100 px-5 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-gray-900">
                {selectedBank?.name}
              </h3>
            </div>

            {tenure && emiPlan && (
              <div className="px-5 py-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <span className="text-sm font-medium text-gray-800">
                    12 Months
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ৳{formatEmiPrice(emiPlan.monthlyAmount)}/m
                    </p>
                    <p className="text-xs text-gray-500">
                      EMI Interest ({tenure.feePercent}%)
                    </p>
                  </div>
                </div>

                <div className="space-y-2 pt-4 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Product Price</span>
                    <span>৳{formatEmiPrice(salePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>EMI Interest</span>
                    <span>৳{formatEmiPrice(emiPlan.convenienceFee)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-gray-900">
                    <span>Total Payable</span>
                    <span>৳{formatEmiPrice(emiPlan.totalPayable)}</span>
                  </div>
                  <div className="flex items-center justify-between font-semibold text-primary">
                    <span>Monthly Installment</span>
                    <span>৳{formatEmiPrice(emiPlan.monthlyAmount)}/m</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ContentModal>
  );
}
