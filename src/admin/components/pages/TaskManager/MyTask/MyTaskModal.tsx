"use client";
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
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { ProjectService } from "@admin/@services/apis/TaskManager/Project/project.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { formatDateRange } from "@admin/utils/hook.utils";
import { parse, isValid } from "date-fns";
import {
  IProject,
  IProjectListResponse,
} from "@admin/@interfaces/taskManager/taskManager.service";
import { SelectOption } from "@admin/@interfaces/common.interface";
import { TaskService } from "@admin/@services/apis/TaskManager/Task/task.service";
import MultipleImageUpload, {
  GalleryItem,
} from "@admin/components/core/Input/ImageUpload";
import { toAbsolute } from "@/app/admin/product/products/edit/[eId]/page";
import RichTextEditor from "@admin/components/core/Editor/RichTextEditor";
import { MyTaskContext } from "@/app/admin/task-manager/my-task/page";

interface IDefault {
  title: string;
  start_date: any;
  end_date: any;
  // status: any;
  project: any;
  // description: string;
  assign_employee: any;
  priority: any;
  documents?: GalleryItem[];
}
// const statusOptions = [
//   { label: "Pending", value: "pending" },
//   { label: "In Progress", value: "in-progress" },
//   { label: "Cancel", value: "cancel" },
//   { label: "On Hold", value: "on-hold" },
//   { label: "Complete", value: "complete" },
// ];

const defaultValue: IDefault = {
  title: "",
  start_date: "",
  end_date: "",
  // status: statusOptions[0],
  project: "",
  assign_employee: [],
  priority: "",
  // description: "",
  documents: [],
};

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
  start_date: yup.date().required("Start date is required"),
  end_date: yup.date().required("End date is required"),
  // status: yup.mixed().required("Status is required"),
  // description: yup.string().required("Description is required"),
  priority: yup.mixed().required("Priority is required"),
  assign_employee: yup.array().default([]).required(),
  project: yup.mixed().required("Project is required"),
});

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const MyTaskModal = () => {
  const { modalMode, items, setIsModalOpen, isModalOpen, fetchTask } =
    useContext(MyTaskContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [projectOption, setProjectOption] = useState<SelectOption[]>([]);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const [content, setContent] = useState("");

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      const apiDateFormats = ["dd-MM-yyyy", "dd-MM-yy"];

      const tryParseDate = (dateStr: string) => {
        if (!dateStr) return null;
        for (const f of apiDateFormats) {
          const parsed = parse(dateStr, f, new Date());
          if (isValid(parsed)) return parsed;
        }
        return null;
      };

      const parsedStart = items.start_date
        ? tryParseDate(items.start_date)
        : null;
      const parsedEnd = items.end_date ? tryParseDate(items.end_date) : null;

      // const selectedStatus =
      //   statusOptions.find((opt) => opt.value === items.status) || null;

      const selectedPriority =
        priorityOptions.find((opt) => opt.value === items.priority) || null;

      const selectedProject =
        projectOption.find((opt) => opt.value === items?.project?._id) || null;

      // const selectedUser = items.assign_employee?.length
      //   ? userOption.find(
      //       (opt) => opt.value === items.assign_employee[0]?._id
      //     ) || null
      //   : null;

      const selectedUser = items.assign_employee?.length
        ? userOption.filter((opt) =>
            items.assign_employee.some((emp: any) => emp._id === opt.value)
          )
        : [];
      const gallery: GalleryItem[] = (items?.documents || []).map((im: any) => {
        const abs = toAbsolute(im?.src || im);
        return {
          isExisting: true,
          src: abs,
          previewUrl: abs,
          name: im?.title || abs.split("/").pop() || "",
        };
      });

      reset({
        title: items.title || "",
        start_date: parsedStart,
        end_date: parsedEnd,
        // status: selectedStatus,
        project: selectedProject,
        assign_employee: selectedUser,
        priority: selectedPriority,
        // description: items.description || "",
        documents: gallery,
      });
      setContent(items.description || "");
    } else {
      reset(defaultValue);
      setContent("");
    }
  }, [modalMode, items, projectOption, userOption, reset]);

  const formSubmit = async (fromData: any) => {
    setIsSubmit(true);

    const data: any = {
      title: fromData.title,
      start_date: formatDateRange(fromData.start_date).trim(),
      end_date: formatDateRange(fromData.end_date).trim(),
      project: fromData.project.value,
      assign_employee: Array.isArray(fromData.assign_employee)
        ? fromData.assign_employee.map((sync: any) => sync.value)
        : [],
      // status: fromData.status.value,
      status: "pending",
      priority: fromData.priority.value,
      // description: fromData.description,
      description: content,
    };

    const formData = new FormData();

    const itemsList: GalleryItem[] = fromData.documents || [];
    itemsList.forEach((it) => {
      if (!it.isExisting) {
        const f = (it as any).file;
        if (f instanceof File) {
          formData.append("documents", f);
        }
      }
    });

    const existingSrc = itemsList
      .filter((it: any) => it.isExisting)
      .map((it: any) => toAbsolute(it.src));
    const prevImages =
      (items?.documents || []).map((im: any) => toAbsolute(im?.src || im)) ||
      [];

    data.remove_documents = prevImages.filter(
      (src: string) => !existingSrc.includes(src)
    );

    formData.append("data", JSON.stringify(data));

    try {
      let res;
      if (modalMode === "Edit" && items?._id) {
        res = await TaskService.updateTask(items._id, formData);
      } else {
        res = await TaskService.createTask(formData);
      }

      if (res?.success) {
        ToastService.success(res.message);
        setIsModalOpen(false);
        fetchTask();
        reset();
      } else {
        ToastService.error(res.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  const fetchProject = () => {
    ProjectService.getProject({
      limit: 50,
    })
      .then((res: IProjectListResponse) => {
        if (res?.success) {
          const projectOptions = res.data.data.map((item: IProject) => ({
            label: item.title,
            value: item._id,
          }));
          setProjectOption(projectOptions);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  const fetchUser = () => {
    TaskService.getAssignEmploySuggestion()
      .then((res: any) => {
        if (res?.success) {
          const userOptions = res.data.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
          setUserOption(userOptions);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };

  useEffect(() => {
    fetchProject();
    fetchUser();
  }, []);

  const handleEditorChange = (value: any) => {
    setContent(value);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-4xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {modalMode === "Edit"
              ? `Edit: ${items?.title || ""}`
              : "Create Task"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div>
            <Input
              label="Title"
              registerProperty={register("title")}
              errorText={errors?.title?.message}
              type="text"
              isRequired
              placeholder="Enter your title"
            />

            <div>
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Start Date <span className="text-red-400">*</span>
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
              {errors?.start_date && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.start_date.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                End Date <span className="text-red-400">*</span>
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
              {errors?.end_date && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.end_date.message as string}
                </p>
              )}
            </div>

            {/* <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Status <span className="text-red-400">*</span>
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
              {errors?.status && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.status.message as string}
                </p>
              )}
            </div> */}

            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Project <span className="text-red-400">*</span>
              </label>
              <Controller
                name="project"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={projectOption}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Project"
                    isRequired
                  />
                )}
              />
              {errors?.project && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.project.message as string}
                </p>
              )}
            </div>

            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Assign Employee
              </label>

              <Controller
                name="assign_employee"
                control={control}
                defaultValue={null}
                render={({ field }) => (
                  <SelectComponent
                    options={userOption}
                    value={field.value}
                    onChange={(val: any) => field.onChange(val || [])}
                    placeholder="Select Assign Employee"
                    isMulti
                    // isRequired
                  />
                )}
              />
              {errors?.assign_employee && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.assign_employee.message as string}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="pb-2">
              <label className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Priority <span className="text-red-400">*</span>
              </label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <SelectComponent
                    options={priorityOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select Priority"
                    isRequired
                  />
                )}
              />
              {errors?.priority && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.priority.message as string}
                </p>
              )}
            </div>

            <div className="pb-2">
              <Controller
                control={control}
                name="documents"
                render={({ field: { onChange, value } }) => (
                  <MultipleImageUpload
                    value={(value as GalleryItem[]) || []}
                    onChange={onChange}
                    label="Documents"
                    maxImages={4}
                    height="h-40"
                  />
                )}
              />
            </div>

            {/* <Input
              label="Description"
              registerProperty={register("description")}
              errorText={errors?.description?.message}
              type="textarea"
              isRequired
              placeholder="Enter your description"
            /> */}
            <p className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
              Description
            </p>
            <RichTextEditor
              content={content}
              onChange={handleEditorChange}
              placeholder="Start writing your content here..."
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
            className="btn-primary"
            disabled={isSubmit}
          >
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default MyTaskModal;
