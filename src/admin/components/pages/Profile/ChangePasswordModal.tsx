import Button from "@admin/components/core/Button/Button";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import type { Dispatch, SetStateAction } from "react";
import { TeamService } from "@admin/@services/apis/TeamService/Permission.service";
import { ToastService } from "@admin/utils/toastr.service";
import Cookies from "js-cookie";
import { useGlobalContext } from "@admin/context/GlobalContext";
import Icon from "@admin/components/core/Icon/Icon";

interface IPasswordChange {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

const defaultValue: IPasswordChange = {
  old_password: "",
  new_password: "",
  confirm_password: "",
};

interface UpdatePasswordModalProps {
  isModalOpen: boolean;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
}

const passwordSchema = yup.object({
  old_password: yup.string().required("Old password is required"),
  new_password: yup
    .string()
    .required("New password is required")
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(
      /[@$!%*?&#^()[\]{}<>~]/,
      "Must contain at least one special character"
    ),
  confirm_password: yup
    .string()
    .required("Confirm new password is required")
    .oneOf([yup.ref("new_password")], "Passwords must match"),
});

const ChangePasswordModal = ({
  isModalOpen,
  setIsModalOpen,
}: UpdatePasswordModalProps) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { setToken } = useGlobalContext();
  const {
    handleSubmit,
    register,
    // reset,
    formState: { errors },
  } = useForm<IPasswordChange>({
    resolver: yupResolver(passwordSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: IPasswordChange) => {
    setIsSubmit(true);

    TeamService.updatePassword(formData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(
            res?.message || "Password updated successfully!"
          );
          setIsModalOpen(false);
          localStorage.setItem("authInfo", JSON.stringify(res.data));
          Cookies.set("authToken", JSON.stringify(res.data.accessToken), {
            expires: 7,
            secure: true,
            sameSite: "Strict",
          });
          Cookies.set("refreshToken", JSON.stringify(res.data.refreshToken), {
            expires: 7,
            secure: true,
            sameSite: "Strict",
          });
          setToken(res.data);
          // reset();
        } else {
          ToastService.error(res?.message || "Something went wrong!");
        }
      })
      .catch((err: { message: string }) => ToastService.error(err.message))
      .finally(() => {
        setIsSubmit(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {}}
        width="w-full md:w-3/4"
        maxWidth="max-w-md"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Change Password
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <Input
              label="Old Password"
              registerProperty={register("old_password")}
              errorText={errors?.old_password?.message}
              type="password"
              isRequired
              placeholder="Enter your old password"
            />
            <Input
              label="New Password"
              registerProperty={register("new_password")}
              errorText={errors?.new_password?.message}
              type="password"
              isRequired
              placeholder="Enter your new password"
            />
            <Input
              label="Confirm New Password"
              registerProperty={register("confirm_password")}
              errorText={errors?.confirm_password?.message}
              type="password"
              isRequired
              placeholder="Confirm new password"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          {/* <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            type="button"
          >
            Cancel
          </Button> */}
          <Button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ChangePasswordModal;
