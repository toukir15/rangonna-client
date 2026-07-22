"use client";
import React, { useContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { ToastService } from "@admin/utils/toastr.service";
import { ContentsContext } from "@/app/admin/contents/page";
import { ContentsService } from "@admin/@services/apis/Contents/Contents";
import RichTextEditor from "@admin/components/core/Editor/RichTextEditor";

export interface IContentsFormValues {
  title: string;
  sub_title?: string;
}

const defaultValue: IContentsFormValues = {
  title: "",
  sub_title: "",
};

const marketingSchema: yup.ObjectSchema<IContentsFormValues> = yup.object({
  title: yup.string().required("Title is required"),
  sub_title: yup.string(),
});

const ContentsModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, items, getContentsList } =
    useContext(ContentsContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [content, setContent] = useState("");

  const {
    handleSubmit,
    register,
    reset,

    formState: { errors },
  } = useForm<IContentsFormValues>({
    resolver: yupResolver(marketingSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        title: items.title?.toString() || "",
        sub_title: items.sub_title?.toString() || "",
      });

      setContent(items.description || "");
    } else {
      reset(defaultValue);
      setContent("");
    }
  }, [items, modalMode, reset]);

  // ✅ Handle form submit
  const formSubmit = async (formData: IContentsFormValues) => {
    setIsSubmit(true);

    // ✅ Format date as DD-MM-YYYY (no timezone shift)
    const payload = {
      ...formData,
      description: content,
    };

    try {
      let res;
      if (modalMode === "Edit" && items?._id) {
        res = await ContentsService.updateContents(items._id, payload);
      } else {
        res = await ContentsService.createContents(payload);
      }

      if (res?.success) {
        ToastService.success(res.message);
        getContentsList();
        setIsModalOpen(false);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message || "Something went wrong");
    } finally {
      setIsSubmit(false);
    }
  };

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
            {modalMode === "Edit" ? `Edit Contents` : "Create New Contents"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="">
            <Input
              label="Title"
              registerProperty={register("title")}
              errorText={errors.title?.message}
              type="text"
              isRequired
              placeholder="Enter title"
            />
            <Input
              label="Sub Title"
              registerProperty={register("sub_title")}
              errorText={errors.sub_title?.message}
              type="text"
              placeholder="Enter sub title"
            />

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
            type="button"
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

export default ContentsModal;
