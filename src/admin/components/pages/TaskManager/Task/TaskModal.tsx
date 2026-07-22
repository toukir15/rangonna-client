"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { ProjectService } from "@admin/@services/apis/TaskManager/Project/project.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { formatDateRange } from "@admin/utils/hook.utils";
import { parse, isValid } from "date-fns";
import { TaskContext } from "@/app/admin/task-manager/task/page";
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

interface IDefault {
  title: string;
  start_date: any;
  end_date: any;
  project: any;
  assign_employee: any;
  priority: any;
  documents?: GalleryItem[];
}

const defaultValue: IDefault = {
  title: "",
  start_date: "",
  end_date: "",
  project: "",
  assign_employee: [],
  priority: "",
  documents: [],
};

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
  start_date: yup.date().required("Start date is required"),
  end_date: yup.date().required("End date is required"),
  priority: yup.mixed().required("Priority is required"),
  assign_employee: yup.array().default([]).required(),
  project: yup.mixed().required("Project is required"),
});

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const TaskModal = () => {
  const { modalMode, items, setIsModalOpen, isModalOpen, fetchTask } =
    useContext(TaskContext);

  const [isSubmit, setIsSubmit] = useState(false);
  const [projectOption, setProjectOption] = useState<SelectOption[]>([]);
  const [userOption, setUserOption] = useState<SelectOption[]>([]);
  const [content, setContent] = useState("");

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const handleCloseModal = () => {
    reset(defaultValue);
    setContent("");
    setIsModalOpen(false);
  };

  useEffect(() => {
    if ((modalMode === "Edit" || modalMode === "Duplicate") && items) {
      const tryParseDate = (dateStr: string) => {
        const formats = ["dd-MM-yyyy", "dd-MM-yy"];
        for (const f of formats) {
          const parsed = parse(dateStr, f, new Date());
          if (isValid(parsed)) return parsed;
        }
        return null;
      };

      const selectedPriority =
        priorityOptions.find((p) => p.value === items.priority) || null;

      const selectedProject =
        projectOption.find((p) => p.value === items?.project?._id) || null;

      const selectedUsers = items.assign_employee?.length
        ? userOption.filter((u) =>
          items.assign_employee.some((emp: any) => emp._id === u.value)
        )
        : [];

      const gallery: GalleryItem[] = (items.documents || []).map((im: any) => {
        const abs = toAbsolute(im?.src || im);
        return {
          isExisting: true,
          src: abs,
          previewUrl: abs,
          name: im?.title || abs.split("/").pop() || "",
        };
      });

      reset({
        title: modalMode === "Duplicate" ? `${items.title}` : items.title,
        start_date: tryParseDate(items.start_date),
        end_date: tryParseDate(items.end_date),
        project: selectedProject,
        assign_employee: selectedUsers,
        priority: selectedPriority,
        documents: gallery,
      });

      setContent(items.description || "");
    } else {
      reset(defaultValue);
      setContent("");
    }
  }, [modalMode, items, projectOption, userOption, reset]);

  useEffect(() => {
    if (!isModalOpen) {
      reset(defaultValue);
      setContent("");
    }
  }, [isModalOpen, reset]);

  const formSubmit = async (fromData: any) => {
    setIsSubmit(true);

    const data: any = {
      title: fromData.title,
      start_date: formatDateRange(fromData.start_date),
      end_date: formatDateRange(fromData.end_date),
      project: fromData.project.value,
      assign_employee: Array.isArray(fromData.assign_employee)
        ? fromData.assign_employee.map((u: any) => u.value)
        : [],
      status: "pending",
      priority: fromData.priority.value,
      description: content,
    };

    const formData = new FormData();

    (fromData.documents || []).forEach((it: GalleryItem) => {
      if (!it.isExisting && (it as any).file instanceof File) {
        formData.append("documents", (it as any).file);
      }
    });

    if (modalMode === "Edit") {
      const existing = (fromData.documents || [])
        .filter((d: any) => d.isExisting)
        .map((d: any) => toAbsolute(d.src));

      const prev =
        (items?.documents || []).map((im: any) => toAbsolute(im?.src || im)) ||
        [];

      data.remove_documents = prev.filter(
        (src: string) => !existing.includes(src)
      );
    }

    formData.append("data", JSON.stringify(data));

    try {
      let res;
      if (modalMode === "Edit") {
        res = await TaskService.updateTask(items._id, formData);
      } else {
        res = await TaskService.createTask(formData);
      }

      if (res?.success) {
        ToastService.success(res.message);
        fetchTask();
        handleCloseModal();
      } else {
        ToastService.error(res.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  useEffect(() => {
    ProjectService.getProject({ limit: 50 }).then(
      (res: IProjectListResponse) => {
        if (res?.success) {
          setProjectOption(
            res.data.data.map((p: IProject) => ({
              label: p.title,
              value: p._id,
            }))
          );
        }
      }
    );

    TaskService.getAssignEmploySuggestion().then((res: any) => {
      if (res?.success) {
        setUserOption(
          res.data.map((u: any) => ({
            label: u.name,
            value: u._id,
          }))
        );
      }
    });
  }, []);

  const handleEditorChange = (value: any) => {
    setContent(value);
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        width="w-full md:w-3/4"
        maxWidth="max-w-4xl"
      >
        <Modal.Header className="flex justify-between">
          <h3 className="text-lg font-medium">
            {modalMode === "Edit"
              ? "Edit Task"
              : modalMode === "Duplicate"
                ? "Duplicate Task"
                : "Create Task"}
          </h3>
          <Icon name="close" onClick={handleCloseModal} />
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
                render={({ field }) => (
                  <SelectComponent
                    options={userOption}
                    value={field.value}
                    onChange={(val: any) => field.onChange(val || [])}
                    placeholder="Select Assign Employee"
                    isMulti
                  />
                )}
              />
              {errors?.assign_employee && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.assign_employee.message as string}
                </p>
              )}
            </div>

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

            <p className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
              Description
            </p>
            <RichTextEditor
              key={`${modalMode}-${items?._id || "new"}-${isModalOpen ? "open" : "closed"}`}
              content={content}
              onChange={handleEditorChange}
              placeholder="Start writing your content here..."
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <Button type="button" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmit}>
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default TaskModal;