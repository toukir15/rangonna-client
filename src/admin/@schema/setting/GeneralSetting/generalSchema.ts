import * as yup from "yup";

export const generalSchema = yup.object({
  shop_name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Shop name is required")
    .min(1, "Shop name  must be at least 1 digits")
    .max(60, "Shop name must not exceed 60 digits"),
  shop_address: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Shop name is required"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^(\+)?\d+$/, "Invalid phone number format")
    .min(7, "Phone number must be at least 7 digits")
    .max(15, `Phone number must not exceed 15 digits`),

  logo: yup.string().required("Image url is required"),
  website_id: yup.string(),
});
