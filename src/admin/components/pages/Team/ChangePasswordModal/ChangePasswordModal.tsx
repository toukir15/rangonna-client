"use client";
import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const defaultValue = {
  new_password: "",
  confirm_password: "",
};

export const changeSchema = yup.object({
  new_password: yup
    .string()
    .required("Please enter a new password")
    .min(6, "Password should be at least 6 characters long"),
  confirm_password: yup
    .string()
    .required("Please retype your password to confirm")
    .oneOf(
      [yup.ref("new_password")],
      "Passwords don't match - please try again"
    ),
});

const ChangePasswordModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const value = true;
  useEffect(() => {
    if (value) {
      openModal();
    } else {
      closeModal();
    }
  }, [value]);

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(changeSchema),
    defaultValues: defaultValue,
  });

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  if (!isModalOpen) return null;

  const formSubmit = async (data: any) => {
    console.log({ data });

    closeModal();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 dark:text-white">
          Set Your Password First
        </h2>
        <form onSubmit={handleSubmit(formSubmit)}>
          <div className="mb-4">
            <Input
              label={"New Password"}
              placeholder="New password"
              type="password"
              registerProperty={register("new_password")}
              errorText={errors?.new_password?.message}
              isRequired
            />
            <Input
              label={"Confirm New Password"}
              placeholder="Confirm new password"
              type="password"
              registerProperty={register("confirm_password")}
              errorText={errors?.confirm_password?.message}
              isRequired
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              //   disabled
            >
              Confirm
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
