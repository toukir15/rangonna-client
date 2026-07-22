"use client";

import { useEffect } from "react";

const isChunkLoadError = (error: Error) => {
  const message = error?.message || "";
  return (
    error?.name === "ChunkLoadError" ||
    message.includes("Loading chunk") ||
    message.includes("ChunkLoadError")
  );
};

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App Error:", error);

    if (isChunkLoadError(error)) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>

      <p className="text-gray-600 mt-2">Please try again or contact support.</p>

      <button
        onClick={() => {
          if (isChunkLoadError(error)) {
            window.location.reload();
            return;
          }
          reset();
        }}
        className="mt-4 px-4 py-2 bg-black text-white rounded"
      >
        Try Again
      </button>
    </div>
  );
}
