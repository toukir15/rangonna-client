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
import { ExpensesService } from "@admin/@services/apis/ExpensesCategory/Expense.service";
import { ToastService } from "@admin/utils/toastr.service";
import { ExpensesCategoryContext } from "@/app/admin/account/expense-category/page";
import MultiValueInput from "@admin/components/core/Select/MultiValueInput";

interface IDefault {
  title: string;
  note: string;
}

const defaultValue: IDefault = {
  title: "",
  note: "",
};

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
  note: yup.string().required("Note is required"),
});

const ExpensesCategoryModal = () => {
  const { modalMode, items, setIsModalOpen, getExpensesCategory, isModalOpen } =
    useContext(ExpensesCategoryContext);
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [tags, setTags] = useState<string[]>([]);

  const {
    handleSubmit,
    register,
    setValue,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      setValue("title", items?.title);
      setValue("note", items.note);
      if (items.sub_titles) {
        setTags(
          Array.isArray(items.sub_titles)
            ? items.sub_titles
            : [items.sub_titles]
        );
      } else {
        setTags([]);
      }
    } else {
      reset(defaultValue);
      setTags([]);
    }
  }, [modalMode, items, setValue, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);
    const payload = {
      ...formData,
      sub_titles: tags,
    };

    if (modalMode === "Edit") {
      ExpensesService.updateExpenses(items?._id, payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getExpensesCategory();
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
      ExpensesService.createExpenses(payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsModalOpen(false);
            getExpensesCategory();
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
              ? `Edit: ${items?.title}`
              : "Create Expenses Category"}
          </h3>
          <Icon
            name={"close"}
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>
        <Modal.Body>
          <div>
            <Input
              label={"Title"}
              registerProperty={register("title")}
              errorText={errors?.title?.message}
              type="text"
              isRequired
              placeholder="Enter your group name"
            />
            <div className="mt-2">
              <MultiValueInput
                onValuesChange={handleTagsValuesChange}
                initialValues={
                  modalMode === "Edit" && items
                    ? Array.isArray(items.sub_titles)
                      ? items.sub_titles
                      : [items.sub_titles]
                    : []
                }
                placeholder="Add your sub title"
                label="Sub Title"
              />
            </div>
            <Input
              label={"Note"}
              registerProperty={register("note")}
              errorText={errors?.note?.message}
              type="text"
              isRequired
              placeholder="Enter your note"
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
            {isSubmit ? <ButtonLoader /> : "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ExpensesCategoryModal;
