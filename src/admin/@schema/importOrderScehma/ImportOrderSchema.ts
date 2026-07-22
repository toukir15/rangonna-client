import * as yup from "yup";

export const importOrderSchema = yup.object({
  woo_id: yup.mixed().required("Order quantity is required"),
  import_order_quantity: yup.string().required("Order quantity is required"),
});
