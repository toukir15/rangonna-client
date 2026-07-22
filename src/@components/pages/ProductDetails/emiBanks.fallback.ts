import { EmiBankWithRates, EmiTenure } from "@/@interfaces/Emi/emi.interface";

export const EMI_TENURE_MONTHS = 12;

const build12MonthTenure = (interestRate: number): EmiTenure[] => [
  {
    months: EMI_TENURE_MONTHS,
    label: "12 Months",
    feePercent: interestRate,
  },
];

const EMI_12_MONTH_RATE = 9.29;

const createBank = (
  id: string,
  name: string,
  initials: string,
  twelveMonthRate = EMI_12_MONTH_RATE,
): EmiBankWithRates => ({
  id,
  name,
  initials,
  tenures: build12MonthTenure(twelveMonthRate),
});

export const FALLBACK_EMI_BANKS: EmiBankWithRates[] = [
  createBank("standard-chartered", "Standard Chartered Bank (SCB)", "SC", 11.73),
  createBank("city", "City Bank", "CT"),
  createBank("brac", "BRAC Bank", "BR"),
  createBank("ebl", "Eastern Bank (EBL)", "EB"),
  createBank("dbbl", "Dutch-Bangla Bank (DBBL)", "DB"),
  createBank("prime", "Prime Bank", "PB"),
  createBank("mtb", "Mutual Trust Bank (MTB)", "MT"),
  createBank("dhaka", "Dhaka Bank", "DH"),
  createBank("ucb", "UCB", "UC"),
  createBank("bank-asia", "Bank Asia", "BA"),
  createBank("one-bank", "One Bank", "OB"),
  createBank("trust-bank", "Trust Bank", "TB"),
  createBank("jamuna", "Jamuna Bank", "JB"),
  createBank("ab", "AB Bank", "AB"),
  createBank("ncc", "NCC Bank", "NC"),
  createBank("premier", "Premier Bank", "PR"),
  createBank("southeast", "Southeast Bank", "SE"),
  createBank("mercantile", "Mercantile Bank", "MB"),
  createBank("shahjalal-islami", "Shahjalal Islami Bank", "SI"),
  createBank("al-arafah", "Al-Arafah Islami Bank", "AL"),
  createBank("exim", "EXIM Bank", "EX"),
  createBank("nrb", "NRB Bank", "NR"),
  createBank("nrbc", "NRBC Bank", "NB"),
  createBank("standard-bank", "Standard Bank", "SB"),
  createBank("lankabangla", "LankaBangla Finance", "LF"),
];
