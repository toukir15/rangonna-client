import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { WebsiteContext } from "@/app/admin/setting/website/page";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";

const defaultValue: any = {
  web_url: "",
  web_name: "",
};

const webSchema = yup.object({
  web_url: yup.string().required("Web url is required"),
  web_name: yup.string().required("Web name is required"),
});

const WebsiteModal = () => {
  const { modalMode, items, setIsModalOpen, fetchWebsite, isModalOpen } =
    useContext(WebsiteContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        web_url: items.web_url || "",
        web_name: items.web_name || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (data: any) => {
    setIsSubmit(true);

    if (modalMode === "Edit" && items?._id) {
      GlobalService.updateWebsite(items?._id, data)
        .then((res) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchWebsite();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      GlobalService.createWebsite(data)
        .then((res) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            fetchWebsite();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          setIsSubmit(false);
          reset();
        });
    }
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
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            {modalMode === "Edit" ? `Edit website` : "Create Website"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <div className="">
              <Input
                label={"Web Name"}
                registerProperty={register("web_name")}
                errorText={errors?.web_name?.message}
                type="text"
                isRequired
                placeholder="Enter web name"
              />

              <Input
                label={"Website Url"}
                registerProperty={register("web_url")}
                errorText={errors?.web_url?.message}
                type="text"
                isRequired
                placeholder="Enter url"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            disabled={isSubmit}
          >
            {isSubmit ? (
              <ButtonLoader />
            ) : modalMode === "Edit" ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default WebsiteModal;
