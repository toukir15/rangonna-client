/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { topProgress } from "./topProgressBar.service";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface Skeleton {
  startSkeleton: boolean;
  stopSkeleton: () => Promise<void>;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setStartSkeleton: (value: boolean) => void;
  onStartSkeleton: () => void;
}

export const useSkeleton = (loader: boolean = true): Skeleton => {
  const [startSkeleton, setStartSkeleton] = useState<boolean>(loader);
  const [isLoading, setIsLoading] = useState<boolean>(loader);

  useEffect(() => {
    if (startSkeleton) topProgress.show();
    else topProgress.hide();
  }, [startSkeleton]);

  const stopSkeleton = async () => {
    await sleep(200);
    setStartSkeleton(false);
  };
  const onStartSkeleton = () => setStartSkeleton(true);

  return {
    startSkeleton,
    stopSkeleton,
    isLoading,
    setIsLoading,
    setStartSkeleton,
    onStartSkeleton,
  };
};
