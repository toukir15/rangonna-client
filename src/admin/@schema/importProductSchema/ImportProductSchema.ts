import * as yup from "yup";

export const ImportProductSchema = yup.object({
  woo_id: yup.mixed().required("Product quantity is required"),
  import_product_quantity: yup
    .string()
    .required("Product quantity is required"),
});
