import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { DashboardShowroomContext } from "@/app/admin/dashboard/showroom/page";
import { DashboardShowroomService } from "@admin/@services/apis/DashboardService/DashboardShowroom.service";

interface IDefault {
  title: string;
  note: string;
  amount: number | null;
}

const defaultValue: IDefault = {
  title: "",
  note: "",
  amount: null,
};

const webSchema = yup.object({
  title: yup.string().required("Title is required"),
  note: yup.string(),
  amount: yup
    .number()
    .typeError("Amount is required")
    .required("Amount is required"),
});

const DashboardExpenseModal = () => {
  const {
    modalMode,
    items,
    setIsExModalOpen,
    isExModalOpen,
    fetchExpensesReportList,
  } = useContext(DashboardShowroomContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

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
      setValue("title", items?.title || "");
      setValue("note", items?.note || "");
      setValue("amount", items?.amount || 0);
    } else {
      reset(defaultValue);
    }
  }, [modalMode, items, setValue, reset]);

  const formSubmit = async (formData: IDefault) => {
    setIsSubmit(true);

    const payload = {
      title: formData.title,
      note: formData.note,
      amount: Number(formData.amount),
    };

    if (modalMode === "Edit") {
      DashboardShowroomService.updateExpenses(items._id, payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsExModalOpen(false);
            fetchExpensesReportList();
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
      DashboardShowroomService.createExpenses(payload)
        .then((res: any) => {
          if (res?.success) {
            ToastService.success(res?.message);
            setIsExModalOpen(false);
            fetchExpensesReportList();
            reset(defaultValue);
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
    }
  };

  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isExModalOpen}
        onClose={() => setIsExModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {modalMode === "Edit" ? `Edit: ${items?.title}` : "Create Expenses"}
          </h3>

          <Icon
            name="close"
            onClick={() => setIsExModalOpen(false)}
            className="text-gray-600 cursor-pointer"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="space-y-4">
            <Input
              label="Title"
              registerProperty={register("title")}
              errorText={errors?.title?.message}
              type="text"
              isRequired
              placeholder="Enter title"
            />

            <Input
              label="Amount"
              registerProperty={register("amount")}
              errorText={errors?.amount?.message}
              type="number"
              isRequired
              placeholder="Enter amount"
            />
            <Input
              label="Note"
              registerProperty={register("note")}
              errorText={errors?.note?.message}
              type="text"
              placeholder="Enter note"
            />
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={() => setIsExModalOpen(false)}
            className="px-4 py-2 text-sm text-gray-700"
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

export default DashboardExpenseModal;
