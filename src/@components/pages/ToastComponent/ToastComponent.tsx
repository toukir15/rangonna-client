"use client";
import Icon from "@/@components/core/Icon/Icon";
import { ToastContainer } from "react-toastify";

export const ToastComponent = () => {
  return (
    <ToastContainer
      toastClassName="font-inter text-sm font-medium px-3 mt-10 !py-0"
      className="flex items-start"
      icon={({ type }) => {
        if (type === "success")
          return (
            <Icon
              name="check_circle"
              className="text-[22px]"
              variant="outlined"
            />
          );
        if (type === "info")
          return (
            <Icon name="info" className="text-[22px]" variant="outlined" />
          );
        if (type === "warning")
          return <Icon name="warning_amber" className="text-[22px]" />;
        if (type === "error")
          return <Icon name="error_outline" className="text-[22px]" />;
        else return "ℹ️";
      }}
      position="top-right"
      autoClose={3000}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="colored"
      // closeButton={CloseButton}
    />
  );
};
