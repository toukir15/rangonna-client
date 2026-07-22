import { toast, Id as ToastId } from "react-toastify";

export const ToastService = {
  success: (message: string): ToastId => toast.success(message || "Success"),
  error: (message: string): ToastId => toast.error(message || "Error"),
  info: (message: string): ToastId => toast.info(message || "Information!"),
  warning: (message: string): ToastId => toast.warning(message || "Warning!"),
};
