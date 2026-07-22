import { EmiBankWithRates } from "@/@interfaces/Emi/emi.interface";

export const EMI_THRESHOLD = 5000;

export const formatEmiPrice = (amount: number) =>
  Math.ceil(amount).toLocaleString("en-BD");

export const calculateEmiPlan = (
  salePrice: number,
  months: number,
  feePercent: number,
) => {
  const totalPayable = salePrice * (1 + feePercent / 100);
  const convenienceFee = totalPayable - salePrice;
  const monthlyAmount = totalPayable / months;

  return {
    totalPayable,
    convenienceFee,
    monthlyAmount,
  };
};

export const getLowestMonthlyEmi = (
  salePrice: number,
  banks: EmiBankWithRates[],
) => {
  let lowest = Infinity;

  banks.forEach((bank) => {
    bank.tenures.forEach((tenure) => {
      const { monthlyAmount } = calculateEmiPlan(
        salePrice,
        tenure.months,
        tenure.feePercent,
      );
      lowest = Math.min(lowest, monthlyAmount);
    });
  });

  return lowest === Infinity ? 0 : lowest;
};

export const getPreviewBank = (banks: EmiBankWithRates[]) =>
  banks.find((bank) => bank.id === "ab") ?? banks[0];
