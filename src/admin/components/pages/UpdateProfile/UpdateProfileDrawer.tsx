import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const updateProfileSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup
    .string()
    .nullable()
    .required("Email is required")
    .transform((value: string) => (value ? value : null))
    .email("Invalid Email format")
    .max(100, "Email must not exceed 100 digits")
    .matches(/^\S*$/, "Spaces are not allowed in the email"),
  password: yup.string(),
  // .required("Please enter a new password")
  // .min(6, "Password should be at least 6 characters long"),
  new_password: yup.string(),
  // .required("Please enter a new password")
  // .min(6, "Password should be at least 6 characters long"),
  confirm_password: yup
    .string()
    // .required("Please retype your password to confirm")
    .oneOf(
      [yup.ref("new_password")],
      "Passwords don't match - please try again"
    ),
});

const UpdateProfileDrawer: React.FC<any> = ({
  openDrawer,
  setOpenDrawer,
  user,
}) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  // const [isLoading, setIsLoading] = useState(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: yupResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name,
      email: user?.email,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user?.name,
        email: user?.email,
      });
    }
  }, [user, reset]);

  const formSubmit = async (updateData: any) => {
    // setIsLoading(true);
    console.log(updateData);

    setIsSubmit(true);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)} className="">
      <Modal
        isOpen={openDrawer}
        onClose={() => setOpenDrawer(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="pr-2 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-gray-300">
            Update Profile
          </h3>
          <Icon
            onClick={() => setOpenDrawer(false)}
            className=" text-gray-600 hover:text-gray-800 cursor-pointer me-5"
            name={"close"}
          />
        </Modal.Header>
        <Modal.Body className="mt-2 mb-5 ">
          <Input
            label="Name"
            placeholder="Enter your name"
            registerProperty={register("name")}
            errorText={errors?.name?.message}
            type="text"
            isRequired
            classNames="mb-6"
          />
          <Input
            label="Email"
            placeholder="Enter your email"
            registerProperty={register("email")}
            errorText={errors?.email?.message}
            type="text"
            isRequired
            classNames="mb-6"
          />
          <Input
            label="Password"
            placeholder="Enter your password"
            registerProperty={register("password")}
            errorText={errors?.password?.message}
            type="password"
            // isRequired
            classNames="mb-6"
          />
          <Input
            label={"New Password"}
            placeholder="New password"
            type="password"
            registerProperty={register("new_password")}
            errorText={errors?.new_password?.message}
            // isRequired
          />
          <Input
            label={"Confirm New Password"}
            placeholder="Confirm new password"
            type="password"
            registerProperty={register("confirm_password")}
            errorText={errors?.confirm_password?.message}
            // isRequired
          />
        </Modal.Body>
        <Modal.Footer className=" flex items-end justify-end">
          <div className="flex  gap-3">
            <Button
              className="btn-secondary"
              onClick={() => setOpenDrawer(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="btn-primary"
              disabled={isSubmit}
            >
              {isSubmit ? <ButtonLoader className="w-12" /> : "Update"}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </form>
  );
};
export default UpdateProfileDrawer;
