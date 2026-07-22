"use client";
import React, { useContext, useState, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import CustomDatePicker from "@admin/components/core/Calendar/DatePicker";
import { ToastService } from "@admin/utils/toastr.service";
import { MarketingContext } from "@/app/admin/marketing/monthly-cost/page";
import { marketingReportService } from "@admin/@services/apis/Marketing/MarketingReport.service";

export interface IMarketingFormValues {
  date: Date | null;
  marketing_cost_bdt: string;
  marketing_cost_usd: string;
}

const defaultValue: IMarketingFormValues = {
  marketing_cost_bdt: "",
  marketing_cost_usd: "",
  date: null,
};

const marketingSchema: yup.ObjectSchema<IMarketingFormValues> = yup.object({
  date: yup.date().required("Date is required"),
  marketing_cost_bdt: yup.string().required("BDT cost is required"),
  marketing_cost_usd: yup.string().required("USD cost is required"),
});

export const formatDateToDDMMYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2); // last 2 digits only
  return `${day}-${month}-${year}`;
};
const MarketingListModal: React.FC = () => {
  const { isModalOpen, setIsModalOpen, modalMode, items, getMarketingList } =
    useContext(MarketingContext);

  const [isSubmit, setIsSubmit] = useState<boolean>(false);

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { errors },
  } = useForm<IMarketingFormValues>({
    resolver: yupResolver(marketingSchema),
    defaultValues: defaultValue,
  });

  // 🧩 Set form values when editing
  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        date: items.date ? new Date(items.date) : null,
        marketing_cost_bdt: items.marketing_cost_bdt?.toString() || "",
        marketing_cost_usd: items.marketing_cost_usd?.toString() || "",
      });
    } else {
      reset(defaultValue);
    }
  }, [items, modalMode, reset]);

  // ✅ Handle form submit
  const formSubmit = async (formData: IMarketingFormValues) => {
    setIsSubmit(true);

    // ✅ Format date as DD-MM-YYYY (no timezone shift)
    const payload = {
      ...formData,
      date: formData.date
        ? formatDateToDDMMYY(
            new Date(formData.date.getFullYear(), formData.date.getMonth(), 1)
          )
        : null,
    };

    try {
      let res;
      if (modalMode === "Edit" && items?._id) {
        res = await marketingReportService.updateMarketing(items._id, payload);
      } else {
        res = await marketingReportService.createMarketing(payload);
      }

      if (res?.success) {
        ToastService.success(res.message);
        getMarketingList();
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
              ? `Edit Marketing Entry`
              : "Create New Marketing Entry"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="flex flex-col gap-4">
            {/* 📅 Date */}
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <CustomDatePicker
                  selectedDate={field.value}
                  onChange={(date) => field.onChange(date)}
                  label="Month"
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select month"
                  wrapperClassName="w-full"
                />
              )}
            />
            {errors.date && (
              <p className="text-red-500 text-sm">{errors.date.message}</p>
            )}

            {/* 💰 BDT */}
            <Input
              label="Marketing Cost (BDT)"
              registerProperty={register("marketing_cost_bdt")}
              errorText={errors.marketing_cost_bdt?.message}
              type="text"
              isRequired
              placeholder="Enter amount in BDT"
            />

            {/* 💵 USD */}
            <Input
              label="Marketing Cost (USD)"
              registerProperty={register("marketing_cost_usd")}
              errorText={errors.marketing_cost_usd?.message}
              type="text"
              isRequired
              placeholder="Enter amount in USD"
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

export default MarketingListModal;
