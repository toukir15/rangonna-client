import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useEffect } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";

interface IDefault {
  trxID: string;
  amount: string;
}

const defaultValue: IDefault = {
  trxID: "",
  amount: "",
};

const webSchema = yup.object({
  trxID: yup.string().required("TrxID is required"),
  amount: yup.string().required("Amount is required"),
});

const WholeSaleAdvanceModal = ({
  wholeSaleData,
  setIsModalOpen,
  isModalOpen,
  fetchOrdersList,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (isModalOpen && wholeSaleData) {
      reset({
        trxID: wholeSaleData?.payment?.transaction_id
          ? wholeSaleData.payment.transaction_id
          : "",
        amount: wholeSaleData?.paid ? String(wholeSaleData.paid) : "",
      });
    }
  }, [isModalOpen, wholeSaleData, reset]);

  const formSubmit = async (formData: any) => {
    setIsSubmit(true);

    wholesaleOrderService
      .updateAdvance(wholeSaleData?._id, {
        transaction_id: formData?.trxID,
        paid: formData?.amount,
      })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrdersList();
          setIsModalOpen(false);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
        reset();
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
            Advance
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
              label={"TrxID"}
              registerProperty={register("trxID")}
              errorText={errors?.trxID?.message}
              type="text"
              isRequired
              placeholder="Enter your trxID"
            />
            <Input
              label={"Amount"}
              registerProperty={register("amount")}
              errorText={errors?.amount?.message}
              type="text"
              isRequired
              placeholder="Enter your amount"
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

export default WholeSaleAdvanceModal;
