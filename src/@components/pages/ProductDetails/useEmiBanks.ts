"use client";

import { useEffect, useState } from "react";
import { EmiBankWithRates } from "@/@interfaces/Emi/emi.interface";
import { FALLBACK_EMI_BANKS } from "./emiBanks.fallback";
import { EmiService } from "@/@services/apis/Emi/Emi.service";

export function useEmiBanks() {
  const [banks, setBanks] = useState<EmiBankWithRates[]>(FALLBACK_EMI_BANKS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    EmiService.getEmiBanks()
      .then((data) => {
        if (isMounted) {
          setBanks(data);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { banks, loading };
}
