import * as yup from "yup";

export const teamSchema = yup.object({
  name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Full name is required")
    .min(1, "Full name must be at least 1 character")
    .max(60, "Full name must not exceed 60 characters"),

  first_name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("First name is required")
    .min(1, "First name must be at least 1 character")
    .max(60, "First name must not exceed 60 characters"),

  last_name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Last name is required")
    .min(1, "Last name must be at least 1 character")
    .max(60, "Last name must not exceed 60 characters"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^(\+)?\d+$/, "Invalid phone number format")
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits"),

  password: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null)),

  base_salary: yup.string().required("Salary is required"),
  holiday_salary: yup.string().required("Holiday is required"),

  email: yup
    .string()
    .nullable()
    .transform((value: string) => (value ? value : null))
    .required("Email is required")
    .email("Invalid Email format")
    .max(100, "Email must not exceed 100 characters")
    .matches(/^\S*$/, "Spaces are not allowed in the email"),

  permission: yup.string().required("Group is required"),
  role: yup.string().required("Role is required"),

  // ✅ warehouse তুমি object দিচ্ছো, তাই object schema লাগবে
  warehouse: yup
    .object({
      label: yup.string().required(),
      value: yup.string().required("Warehouse is required"),
    })
    .nullable()
    .required("Warehouse is required"),

  // status: yup.boolean().required("Status is required"),

  // ✅ form এ field নাম: profile
  // profile: yup.mixed().nullable(),
  // nid: yup.mixed().nullable(),
  // cv: yup.mixed().nullable(),
    date: yup.date().required("Date is required"),
});
