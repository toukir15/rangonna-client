import React, { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import Icon from "@/@components/core/Icon/Icon";
import Modal from "@/@components/core/Modal/ModalFrom";
import Input from "@/@components/core/Input/Input";
import Button from "@/@components/core/Button/Button";
import ButtonLoader from "@/@components/core/Button/ButtonLoader";
import { ToastService } from "@/utils/toaster.service";
import { ProductService } from "@/@services/apis/Product/Product.service";

type UserFormValues = {
  first_name: string;
  last_name: string;
  postcode: string;
  company_name: string;
  email: string;
  address: string;
};

const defaultValue: UserFormValues = {
  first_name: "",
  last_name: "",
  postcode: "",
  company_name: "",
  email: "",
  address: "",
};

const webSchema = yup.object({
  first_name: yup.string().required("First name is required"),
  last_name: yup.string(),
  postcode: yup.string(),
  company_name: yup.string(),
  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),
  address: yup.string().required("Address is required"),
});

const UpdateProfileModal = ({
  isModalOpen,
  setIsModalOpen,
  userInfo,
  fetchUserInfo,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  React.useEffect(() => {
    if (userInfo) {
      reset({
        first_name: userInfo.first_name || "",
        last_name: userInfo.last_name || "",
        postcode: userInfo.postcode || "",
        company_name: userInfo.company_name || "",
        email: userInfo.email || "",
        address: userInfo.address || "",
      });
    }
  }, [userInfo, reset]);

  const formSubmit = async (formData: UserFormValues) => {
    setIsSubmit(true);

    const res = await ProductService.updateProfile(formData);

    if (res?.success) {
      ToastService.success(res?.message);
      setIsModalOpen(false);
      fetchUserInfo();
    } else {
      ToastService.error(res?.message);
    }
    setIsSubmit(false);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-bold leading-6 text-gray-900 ">
            {`Update Profile: ${userInfo?.first_name || ""}`}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="">
            <Input
              label="First Name"
              registerProperty={register("first_name")}
              errorText={errors?.first_name?.message}
              type="text"
              isRequired
              placeholder="Enter first name"
            />
            <Input
              label="Last Name"
              registerProperty={register("last_name")}
              errorText={errors?.last_name?.message}
              type="text"
              placeholder="Enter last name"
            />
            <Input
              label="Address"
              registerProperty={register("address")}
              errorText={errors?.address?.message}
              type="textarea"
              isRequired
              placeholder="Enter address"
            />
            <Input
              label="Postcode"
              registerProperty={register("postcode")}
              errorText={errors?.postcode?.message}
              type="text"
              placeholder="Enter postcode"
            />
            <Input
              label="Company Name"
              registerProperty={register("company_name")}
              errorText={errors?.company_name?.message}
              type="text"
              placeholder="Enter company name"
            />
            <Input
              label="Email"
              registerProperty={register("email")}
              errorText={errors?.email?.message}
              type="email"
              placeholder="Enter email"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700  cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded cursor-pointer"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default UpdateProfileModal;
