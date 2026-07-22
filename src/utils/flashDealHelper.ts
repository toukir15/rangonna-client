import { FlashDealTime } from "@/@components/pages/FlashDeal/FlashDealTimer";

export const createFlashDealEndTime = (hours: number): Date => {
  const endTime = new Date();
  endTime.setTime(endTime.getTime() + hours * 60 * 60 * 1000);
  return endTime;
};

export const formatTime = (milliseconds: number | null): FlashDealTime => {
  if (!milliseconds || milliseconds <= 0) {
    return { hours: "00", minutes: "00", seconds: "00" };
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours: hours.toString().padStart(2, "0"),
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
  };
};

export const getStorageKey = (productId: string | number): string => {
  return `flashDeal_${productId}`;
};
