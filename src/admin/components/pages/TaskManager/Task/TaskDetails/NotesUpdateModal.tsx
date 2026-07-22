import React, { useState } from "react";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Input from "@admin/components/core/Input/Input";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";

const defaultValue = {
  text: "",
};

const schema = yup.object({
  text: yup.string().required("Description is required"),
});

const MyNotesUpdateModal = ({
  isModalOpen,
  setIsModalOpen,
  getSingleNote,
  items,
}: any) => {
  const [isSubmit, setIsSubmit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    try {
      let res = await TaskService.createNotes(items?._id, formData);
      if (res?.success) {
        ToastService.success(res.message);
        getSingleNote();
        setIsModalOpen(false);
        reset();
      } else {
        ToastService.error(res.message);
      }
    } catch (e: any) {
      ToastService.error(e.message);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-1/2"
        maxWidth="max-w-lg"
      >
        <Modal.Header>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {"Create Task"}
          </h3>
        </Modal.Header>

        <Modal.Body>
          <Input
            label="Notes"
            registerProperty={register("text")}
            errorText={errors?.text?.message}
            type="textarea"
            placeholder="Enter notes here"
          />
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button type="button" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isSubmit}
            className="bg-blue-500 text-white"
          >
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default MyNotesUpdateModal;
