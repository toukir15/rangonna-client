import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { AllExpensesService } from "@admin/@services/apis/Account/AllExpenses/AllExpenses.service";
import { useRouter } from "next/navigation";

const defaultValue: any = {
  purchases_reference: "",
};

const webSchema = yup.object({
  purchases_reference: yup.string().required("Purchases reference is required"),
});

const PurchasesReturnModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  items,
  getAllExpenses,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const router = useRouter();

  const {
    handleSubmit,
    register,

    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const formSubmit = async (formData: any) => {
    if (formData?.purchases_reference)
      router.push(`/admin/purchase/return/create-purchases/${formData?.purchases_reference}`);

    return;
    setIsSubmit(true);

    AllExpensesService.createAllExpenses({})
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          getAllExpenses();
          setIsModalOpen(false);
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
              ? `Edit All Expenses: ${items?.warehouse?.title}`
              : "Add Sale Return"}
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
                label={"Purchases Reference"}
                registerProperty={register("purchases_reference")}
                errorText={errors?.purchases_reference?.message}
                type="text"
                isRequired
                placeholder="Enter sale reference no"
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
            className="btn-primary"
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

export default PurchasesReturnModal;
