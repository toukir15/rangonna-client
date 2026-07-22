"use client";

import { useState } from "react";
import { ChevronRight, CreditCard, Loader2 } from "lucide-react";
import { EmiDetailsModal } from "./EmiDetailsModal";
import { EMI_THRESHOLD, formatEmiPrice, getLowestMonthlyEmi } from "./emiData";
import { useEmiBanks } from "./useEmiBanks";

interface EmiFacilitiesProps {
  salePrice?: number;
}

export function EmiFacilities({ salePrice = 0 }: EmiFacilitiesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { banks, loading } = useEmiBanks();

  if (!salePrice || salePrice <= EMI_THRESHOLD || !banks.length) {
    return null;
  }

  const lowestMonthly = getLowestMonthlyEmi(salePrice, banks);

  return (
    <>
      <div className="mt-4 overflow-hidden rounded-2xl border border-primary-border bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex w-full cursor-pointer items-center justify-between gap-3 border-b border-primary-lighter px-4 py-3 text-left transition hover:bg-primary-light/60"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                EMI Available
              </h3>
              <p className="text-xs text-gray-600">
                Starting from{" "}
                <span className="font-semibold text-primary">
                  ৳{formatEmiPrice(lowestMonthly)}/month
                </span>
              </p>
            </div>
          </div>

          <div className="flex cursor-pointer items-center gap-1 text-sm font-semibold text-primary">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                View Details
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="w-full cursor-pointer border-t border-primary-lighter bg-primary-light/50 px-4 py-2.5 text-center text-xs font-medium text-gray-600 transition hover:bg-primary-light"
        >
          সব ব্যাংকের EMI plan দেখতে click করুন
        </button>
      </div>

      <EmiDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        salePrice={salePrice}
        banks={banks}
        loading={loading}
      />
    </>
  );
}
