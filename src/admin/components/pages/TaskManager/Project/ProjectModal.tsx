import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ProjectContext } from "@/app/admin/task-manager/project/page";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { ProjectService } from "@admin/@services/apis/TaskManager/Project/project.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { formatDateRange } from "@admin/utils/hook.utils";
import { parse, isValid } from "date-fns";

interface IDefault {
  title: string;
  start_date: any;
  end_date: any;
  status: string;
  description: string;
}

const defaultValue: IDefault = {
  title: "",
  start_date: "",
  end_date: "",
  status: "",
  description: "",
};

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
  start_date: yup.date().required("Start date is required"),
  end_date: yup.date().required("End date is required"),
  status: yup.mixed().required("Status is required"),
  description: yup.string().required("Description is required"),
});

const ProjectModal = () => {
  const { modalMode, items, setIsModalOpen, isModalOpen, fetchProject } =
    useContext(ProjectContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  // ------------------------------
  // Load values correctly in Edit
  // ------------------------------
  useEffect(() => {
    if (modalMode === "Edit" && items) {
      const apiDateFormat = "dd-MM-yyyy";

      // Parse start_date
      let parsedStart = items.start_date
        ? parse(items.start_date, apiDateFormat, new Date())
        : null;

      if (!parsedStart || !isValid(parsedStart)) {
        parsedStart = null;
      }

      // Parse end_date
      let parsedEnd = items.end_date
        ? parse(items.end_date, apiDateFormat, new Date())
        : null;

      if (!parsedEnd || !isValid(parsedEnd)) {
        parsedEnd = null;
      }

      const selectedStatus = statusOptions?.find(
        (option: any) => option.value === items.status
      );
      reset({
        status: selectedStatus || "",
      });

      setValue("title", items.title || "");
      setValue("start_date", parsedStart);
      setValue("end_date", parsedEnd);
      setValue("description", items.description || "");
    } else {
      reset(defaultValue);
    }
  }, [modalMode, items]);

  // ------------------------------
  // Submit form
  // ------------------------------
  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    const payload = {
      title: formData.title,
      status: formData.status.value,
      start_date: formatDateRange(formData.start_date).trim(),
      end_date: formatDateRange(formData.end_date).trim(),
      description: formData.description,
    };

    if (modalMode === "Edit") {
      ProjectService.updateProject(items._id, payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            fetchProject();
            setIsModalOpen(false);
            reset();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: any) => ToastService.error(err.message))
        .finally(() => setIsSubmit(false));
    } else {
      ProjectService.createProject(payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            fetchProject();
            setIsModalOpen(false);
            reset();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: any) => ToastService.error(err.message))
        .finally(() => setIsSubmit(false));
    }
  };

  const statusOptions = [
    { label: "Pending", value: "pending" },
    { label: "In Progress", value: "in-progress" },
    { label: "Cancel", value: "cancel" },
    { label: "On Hold", value: "on-hold" },
    { label: "Complete", value: "complete" },
  ];

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {modalMode === "Edit"
              ? `Edit: ${items?.title || ""}`
              : "Create Project"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div>
            {/* Title */}
            <Input
              label="Title"
              registerProperty={register("title")}
              errorText={errors?.title?.message}
              type="text"
              isRequired
              placeholder="Enter your title"
            />

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Start Date<span className="text-red-400">*</span>
              </label>
              <Controller
                name="start_date"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    selectedDate={field.value}
                    onChange={field.onChange}
                    dateFormat="dd-MM-yy"
                    wrapperClassName="w-full"
                  />
                )}
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                End Date<span className="text-red-400">*</span>
              </label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <CustomDatePicker
                    selectedDate={field.value}
                    onChange={field.onChange}
                    dateFormat="dd-MM-yy"
                    wrapperClassName="w-full"
                  />
                )}
              />
            </div>

            {/* Status */}
            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Status<span className="text-red-400">*</span>
              </label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={statusOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Status"
                    isRequired
                  />
                )}
              />
            </div>

            {/* Description */}
            <Input
              label="Description"
              registerProperty={register("description")}
              errorText={errors?.description?.message}
              type="textarea"
              isRequired
              placeholder="Enter your description"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            type="button"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className="px-4 py-2 text-sm bg-blue-500 text-white rounded"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ProjectModal;
