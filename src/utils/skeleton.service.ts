import { useEffect, useState } from "react";

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

interface Skeleton {
  startSkeleton: boolean;
  stopSkeleton: Function;
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
  setStartSkeleton: (value: boolean) => void;
  onStartSkeleton: () => void;
}

export const useSkeleton = (loader: boolean = true): Skeleton => {
  const [startSkeleton, setStartSkeleton] = useState<boolean>(loader);
  const [isLoading, setIsLoading] = useState<boolean>(loader);

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
