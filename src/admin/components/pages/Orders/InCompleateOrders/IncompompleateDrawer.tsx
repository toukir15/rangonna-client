import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { IncompleteOrdersService } from "@admin/@services/apis/OrdersService/Incompleate.service";

interface IncompleteNoteFormValues {
  title: string;
}

interface ApiSuccessResponse {
  success: true;
  message: string;
}

interface ApiErrorResponse {
  success: false;
  message: string;
}

type ApiResponse = ApiSuccessResponse | ApiErrorResponse;

interface IncompleteNoteProps {
  itemsId?: string;
  // eslint-disable-next-line no-unused-vars
  setIsModalOpen: (value: boolean) => void;
  getReportCategory: () => void;
  isModalOpen: boolean;
}

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
});

const defaultValue: IncompleteNoteFormValues = {
  title: "",
};

const IncompleteNote: React.FC<IncompleteNoteProps> = ({
  itemsId,
  setIsModalOpen,
  getReportCategory,
  isModalOpen,
}) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
  } = useForm<IncompleteNoteFormValues>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (data: IncompleteNoteFormValues) => {
    setIsSubmit(true);
    IncompleteOrdersService.createIncompompleateNote(itemsId, {
      text: data.title,
    })
      .then((res: ApiResponse) => {
        if (res?.success) {
          ToastService.success(res.message);
          setIsModalOpen(false);
          getReportCategory();
          reset();
        } else {
          ToastService.error(res.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
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
            Create Note
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>
        <Modal.Body>
          <div className="w-full gap-5">
            <Input
              label="Title"
              registerProperty={register("title")}
              errorText={errors?.title?.message}
              type="textarea"
              isRequired
              placeholder="Enter your title"
            />
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
            {isSubmit ? <ButtonLoader /> : "Create"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default IncompleteNote;
