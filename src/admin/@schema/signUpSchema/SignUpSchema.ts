import * as yup from "yup";

export const signUpSchema = yup.object({
  name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Full name is required")
    .min(1, "Full name  must be at least 1 digits")
    .max(60, "Full name must not exceed 60 digits"),
  phone: yup
    .string()
    .required("Phone number is required")
    .matches(/^(\+)?\d+$/, "Invalid phone number format")
    .min(7, "Phone number must be at least 7 digits")
    .max(15, `Phone number must not exceed 15 digits`),

  email: yup
    .string()
    .nullable()
    .required("Email is required")
    .transform((value: string) => (value ? value : null))
    .email("Invalid Email format")
    .max(100, "Email must not exceed 100 digits")
    .matches(/^\S*$/, "Spaces are not allowed in the email"),
  password: yup.string().required("Password is required"),
  terms: yup
    .boolean()
    .oneOf([true], "You must agree to the terms and conditions"),
});

export const addCourierSchema = yup.object({
  name: yup
    .string()
    .nullable()
    .transform((val) => (val ? val : null))
    .required("Full name is required")
    .min(1, "Full name  must be at least 1 digits")
    .max(60, "Full name must not exceed 60 digits"),
});
