import { apiIns } from "@/@config/api.config";
import {
  EmiBankApiRecord,
  EmiBankWithRates,
  EmiBanksApiResponse,
  EmiTenure,
  EmiTenureApiRecord,
} from "@/@interfaces/Emi/emi.interface";
import { FALLBACK_EMI_BANKS, EMI_TENURE_MONTHS } from "@/@components/pages/ProductDetails/emiBanks.fallback";

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "BK";

const normalizeTenures = (tenures?: EmiTenureApiRecord[]): EmiTenure[] => {
  if (!Array.isArray(tenures)) return [];

  return tenures
    .map((tenure) => {
      const months = Number(tenure.months);
      const feePercent = Number(tenure.fee_percent ?? tenure.feePercent);

      if (!months || Number.isNaN(feePercent)) return null;

      return {
        months,
        label: tenure.label?.trim() || `${months} Months`,
        feePercent,
      };
    })
    .filter((tenure): tenure is EmiTenure => Boolean(tenure))
    .filter((tenure) => tenure.months === EMI_TENURE_MONTHS)
    .sort((a, b) => a.months - b.months);
};

export const normalizeEmiBanks = (records: unknown): EmiBankWithRates[] => {
  if (!Array.isArray(records)) return [];

  const banks: EmiBankWithRates[] = [];

  records.forEach((record) => {
    const bank = record as EmiBankApiRecord;
    const name = String(bank.name ?? "").trim();
    if (!name) return;

    const tenures = normalizeTenures(
      bank.tenures ?? bank.emi_tenures ?? bank.rates,
    );
    if (!tenures.length) return;
    if ((bank.is_active ?? bank.isActive ?? true) === false) return;

    banks.push({
      id: String(bank.slug ?? bank.id ?? bank._id ?? slugify(name)),
      name,
      initials: String(bank.initials ?? getInitials(name)),
      tenures,
      isActive: bank.is_active ?? bank.isActive ?? true,
    });
  });

  return banks;
};

export const EmiService = {
  getEmiBanks: async (): Promise<EmiBankWithRates[]> => {
    try {
      const response = (await apiIns.get("/emi-bank")) as EmiBanksApiResponse;
      const banks = normalizeEmiBanks(response?.data);

      return banks.length ? banks : FALLBACK_EMI_BANKS;
    } catch {
      return FALLBACK_EMI_BANKS;
    }
  },
};
