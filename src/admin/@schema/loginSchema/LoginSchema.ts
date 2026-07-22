import * as yup from "yup";
export const logInSchema = yup.object({
  email_phone: yup
    .string()
    .nullable()
    .required("Email or phone number is required")
    .transform((value: string) => (value ? value.trim() : null))
    .test(
      "emailOrPhone",
      "Must be a valid email or phone number",
      (value: string | null) =>
        value
          ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ||
            /^[0-9]{10,15}$/.test(value)
          : false
    )
    .max(100, "Input must not exceed 100 characters"),
  password: yup.string().required("Password is required"),
});

export const fraudSchema = yup.object({
  phone: yup
    .string()
    .required("Please enter a valid phone number")
    .matches(/^01[3-9]\d{8}$/, "Number must be 11 digits and start with 01"),
});

export const settingSchema = yup.object({
  url: yup.string().required("Url is required"),
  name: yup.string().required("Name is required"),
  password: yup.string().required("Password is required"),
});

export const shopSchema = yup.object({
  name: yup.string().required("Please enter your shop name"),
});
export const aboutSchema = yup.object({
  agreement: yup.string().required("Please select an option"),
});
