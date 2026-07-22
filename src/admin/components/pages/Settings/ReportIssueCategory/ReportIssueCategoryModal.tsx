"use client";
import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useState, useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { InferType } from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import MultiValueInput from "@admin/components/core/Select/MultiValueInput";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import { ReportIssueCategoryContext } from "@/app/admin/setting/report-issue-category/page";

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
});

type ReportIssueCategoryFormData = InferType<typeof webSchema>;

export interface IReportIssueCategory {
  _id: string;
  issue_title: string;
  issue_sub_title: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ReportIssueCategoryContextType {
  modalMode: "Add" | "Edit";
  items: IReportIssueCategory | null;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  getReportCategory: () => void;
  isModalOpen: boolean;
}

interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

const ReportIssueCategoryModal: React.FC = () => {
  const { modalMode, items, setIsModalOpen, getReportCategory, isModalOpen } =
    useContext(ReportIssueCategoryContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<ReportIssueCategoryFormData>({
    resolver: yupResolver(webSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        title: items.issue_title || "",
      });

      if (items.issue_sub_title) {
        setTags(
          Array.isArray(items.issue_sub_title)
            ? items.issue_sub_title
            : [items.issue_sub_title]
        );
      } else {
        setTags([]);
      }
    } else {
      reset({ title: "" });
      setTags([]);
    }
  }, [items, modalMode, reset]);

  const formSubmit = async (data: ReportIssueCategoryFormData) => {
    setIsSubmit(true);

    const formData = {
      issue_title: data.title,
      issue_sub_title: tags,
    };

    if (modalMode === "Edit" && items?._id) {
      ReportIssueCategoryService.updateReportIssue(items._id, formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getReportCategory();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            ToastService.error(err.message);
          } else {
            ToastService.error("Unexpected error");
          }
        })
        .finally(() => {
          setIsSubmit(false);
        });
    } else {
      ReportIssueCategoryService.createReportIssue(formData)
        .then((res: IApiResponse) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getReportCategory();
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: unknown) => {
          if (err instanceof Error) {
            ToastService.error(err.message);
          } else {
            ToastService.error("Unexpected error");
          }
        })
        .finally(() => {
          setIsSubmit(false);
          reset();
        });
    }
  };

  const handleTagsValuesChange = (values: string[]) => {
    setTags(values);
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
            {modalMode === "Edit"
              ? `Edit Report Issue: ${items?.issue_title}`
              : "Create Report Issue"}
          </h3>

          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5">
            <div>
              <Input
                label="Title"
                registerProperty={register("title")}
                errorText={errors?.title?.message}
                type="text"
                isRequired
                placeholder="Enter your title"
              />

              <div className="mt-2">
                <MultiValueInput
                  onValuesChange={handleTagsValuesChange}
                  initialValues={
                    modalMode === "Edit" && items
                      ? Array.isArray(items.issue_sub_title)
                        ? items.issue_sub_title
                        : [items.issue_sub_title]
                      : []
                  }
                  placeholder="Add your sub title"
                  label="Sub Title"
                />
              </div>
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

export default ReportIssueCategoryModal;
