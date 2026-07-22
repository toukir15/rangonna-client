"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import SelectComponent from "@admin/components/core/Select/Select";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { getStatusStyle } from "@admin/utils/system.utils";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import Link from "next/link";

type LineItem = {
  _id?: string;
  title: string;
  total?: number;
  product_id?:
  | {
    _id?: string;
    featured_image?: { src?: string };
  }
  | string;
};

type SelectOption = {
  label: string;
  value: string;
};

type ReportIssueForm = {
  category: SelectOption | null;
  sub_category: SelectOption | null;
  description: string;
  amount: string;
  selected_items: string[];
};

type ReportIssueDataItem = {
  _id: string;
  order_sysid?: string;
  description?: string;
  issue_title?: string;
  issue_sub_title?: string;
  status?: string;
  name?: string;
  phone?: string;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  payment?: {
    amount?: number;
    due?: number;
    paid?: number;
    trx_id?: string;
    status?: string;
  };
  report_issue_line_items?: Array<{
    title?: string;
    image?: string;
  }>;
};

type ReportIssueResponse = {
  meta?: {
    total_record?: number;
    total_page?: number;
    page?: number;
    limit?: number;
  };
  data?: ReportIssueDataItem[];
};

const defaultValue: ReportIssueForm = {
  category: null,
  sub_category: null,
  description: "",
  amount: "",
  selected_items: [],
};

const webSchema = yup.object({
  category: yup.mixed().required("Category is required"),
  sub_category: yup.mixed().required("Sub category is required"),
  description: yup.string().required("Description is required"),
  amount: yup.string().required("Amount is required"),
  selected_items: yup
    .array()
    .of(yup.string().required())
    .min(1, "Select at least one product"),
});

const formatDateTime = (dateString?: string) => {
  if (!dateString) return "-";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
};

const ReportIssueModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  orderDetail,
}: any) => {
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [tableLoading, setTableLoading] = useState<boolean>(false);

  // full api response object
  const [reportData, setReportData] = useState<ReportIssueResponse | null>(null);

  // form / table toggle
  const [showForm, setShowForm] = useState<boolean>(true);

  const [reportCategories, setReportCategories] = useState<
    Array<{
      categories: { label: string; value: string };
      subCategory: Array<{ label: string; value: string }>;
    }>
  >([]);

  const [selectedSubCategories, setSelectedSubCategories] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const lineItems: LineItem[] = useMemo(
    () => orderDetail?.line_items ?? [],
    [orderDetail?.line_items]
  );

  const reportList = reportData?.data || [];
  const hasReportData = reportList.length > 0;

  const buildLineItemKey = (item: LineItem, index: number) => {
    const orderId = String(
      orderDetail?._id ?? orderDetail?.order_id ?? "order"
    );

    const idPart =
      (item?._id && String(item._id)) ||
      (typeof item?.product_id === "string" && item.product_id) ||
      (typeof item?.product_id === "object" && (item.product_id?._id || "")) ||
      (item?.title && item.title.trim().slice(0, 40).replace(/\s+/g, "-")) ||
      "noid";

    return `li-${orderId}-${idPart}-${index}`;
  };

  const lineItemIds = useMemo(
    () => lineItems.map((it, idx) => buildLineItemKey(it, idx)),
    [lineItems] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    resetField,
    setValue,
    watch,
    reset,
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  const selectedIds = watch("selected_items") || [];
  const allSelected =
    lineItemIds.length > 0 && selectedIds.length === lineItemIds.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setValue("selected_items", []);
    } else {
      setValue("selected_items", lineItemIds);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenForm = () => {
    reset(defaultValue);
    setSelectedSubCategories([]);
    setShowForm(true);
  };



  const formSubmit = async (formData: ReportIssueForm) => {
    const selectedSet = new Set(formData.selected_items);

    const report_issue_line_items = lineItems
      .map((item, idx) => ({ id: lineItemIds[idx], item }))
      .filter(({ id }) => selectedSet.has(id))
      .map(({ item }) => ({
        title: item.title,
        image:
          (typeof item.product_id === "object"
            ? item.product_id?.featured_image?.src
            : undefined) || "",
      }));

    const mainData = {
      name: orderDetail?.customer?.first_name,
      amount: formData.amount,
      phone: orderDetail?.customer?.phone,
      address: orderDetail?.customer?.address,
      order_sysid: orderDetail?.sysid,
      order: orderDetail?._id,
      description: formData.description,
      issue_title: formData.category?.value,
      issue_sub_title: formData.sub_category?.value,
      report_issue_line_items,
    };

    setIsSubmit(true);

    ReportIssueCategoryService.createOrderReportIssue(mainData)
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          reset(defaultValue);
          setSelectedSubCategories([]);
          fetchReportList(true);
        } else {
          ToastService.error(res?.message || "Failed to create report");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Something went wrong");
      })
      .finally(() => setIsSubmit(false));
  };

  const getReportCategory = () => {
    ReportIssueCategoryService.getReportIssueCategory()
      .then((res: any) => {
        if (res?.success) {
          const formattedData = res?.data?.data?.map((item: any) => {
            const formattedCategory = {
              label: item.issue_title
                .toLowerCase()
                .replace(/\b\w/g, (char: string) => char.toUpperCase()),
              value: item.issue_title,
            };

            const formattedSubCategory = item.issue_sub_title.map(
              (subTitle: string) => ({
                label: subTitle
                  .toLowerCase()
                  .replace(/\b\w/g, (char: string) => char.toUpperCase()),
                value: subTitle,
              })
            );

            return {
              categories: formattedCategory,
              subCategory: formattedSubCategory,
            };
          });

          setReportCategories(formattedData || []);
        } else {
          ToastService.error(res?.message || "Failed to get report categories");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(
          err.message || "An error occurred while fetching report categories"
        );
      });
  };

  const fetchReportList = async (afterCreate = false) => {
    if (!orderDetail?._id) return;

    setTableLoading(true);

    ReportIssueCategoryService.getReportIssueList(orderDetail?._id)
      .then((res: any) => {
        if (res?.success) {
          const formattedResponse: ReportIssueResponse = res?.data || null;
          const list = formattedResponse?.data || [];

          setReportData(formattedResponse);

          if (list.length > 0) {
            setShowForm(false);
          } else {
            setShowForm(true);
          }

          if (afterCreate && list.length > 0) {
            setShowForm(false);
          }
        } else {
          setReportData(null);
          setShowForm(true);
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        setReportData(null);
        setShowForm(true);
        ToastService.error(err.message);
      })
      .finally(() => setTableLoading(false));
  };

  useEffect(() => {
    if (isModalOpen) {
      getReportCategory();
      fetchReportList();
    } else {
      reset(defaultValue);
      setSelectedSubCategories([]);
      setReportData(null);
      setShowForm(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);


  return (
    <form onSubmit={handleSubmit(formSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        width="w-full md:w-3/4"
        maxWidth="max-w-5xl"
      >
        <Modal.Header className="flex items-center justify-between">

          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-300 ">
              Report Issue - {orderDetail?.sysid}
            </h3>
            {
              !showForm && <Button
                type="button"
                onClick={handleOpenForm}
                className="!px-4 !py-1 !text-sm bg-blue-500 text-white rounded "
              >
                Add New Issue
              </Button>
            }

          </div>
          <Icon
            name="close"
            onClick={handleCloseModal}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="w-full gap-5">


            {hasReportData && !showForm && !tableLoading && (
              <div className="mt-2">
                <div className="border dark:border-gray-500 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Issue Title
                          </th>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Sub Title
                          </th>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Amount
                          </th>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Status
                          </th>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Created At
                          </th>
                          <th className="text-left px-4 py-3 dark:text-gray-300">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {tableLoading ? (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center dark:text-gray-300"
                            >
                              Loading...
                            </td>
                          </tr>
                        ) : reportList.length > 0 ? (
                          reportList.map((item) => (
                            <tr
                              key={item._id}
                              className="border-t dark:border-gray-500"
                            >
                              <td className="px-4 py-3 align-top dark:text-gray-300">
                                {item?.issue_title || "-"}
                              </td>

                              <td className="px-4 py-3 align-top dark:text-gray-300">
                                {item?.issue_sub_title || "-"}
                              </td>


                              <td className="px-4 py-3 align-top dark:text-gray-300">
                                {item?.payment?.amount ?? "-"}
                              </td>

                              <td className="px-4 py-3 align-top">
                                <span
                                  className={`text-sm px-3 py-1 inline-block rounded ${getStatusStyle(
                                    item?.status
                                  )}`}
                                >
                                  {item?.status || "-"}
                                </span>
                              </td>

                              <td className="px-4 py-3 align-top dark:text-gray-300 whitespace-nowrap">
                                <p>Last Update: {formatDateTime(item?.updatedAt)}</p>
                                <p>Create: {formatDateTime(item?.createdAt)}</p>
                              </td>
                              <td className="px-4 py-3 align-top dark:text-gray-300 whitespace-nowrap">
                                <Link href={`/report-issue/view/${item?._id}`} target="_" className="bg-blue-500 text-white rounded-lg px-4 py-1">
                                  View</Link>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={7}
                              className="px-4 py-6 text-center dark:text-gray-300"
                            >
                              No report issue found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {
              tableLoading ? <div className="text-center h-40"><p className="mt-32">Loading....</p></div> : showForm && (
                <div className="mt-2">

                  <div className="pb-4">
                    <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Category
                      <span className="text-red-400 text-[12px] font-semibold ms-1">
                        *
                      </span>
                    </label>

                    <Controller
                      name="category"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectComponent
                          options={reportCategories?.map((c) => c.categories)}
                          value={field.value}
                          onChange={(selectedOption: any) => {
                            field.onChange(selectedOption);

                            const match = reportCategories.find(
                              (item) =>
                                item.categories.value === selectedOption?.value
                            );

                            setSelectedSubCategories(match?.subCategory || []);
                            resetField("sub_category");
                          }}
                          placeholder="Select Category"
                          isRequired
                        />
                      )}
                    />
                    {errors?.category?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {String(errors.category.message)}
                      </p>
                    )}
                  </div>

                  <div className="pb-2">
                    <label className="block font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                      Sub Category
                      <span className="text-red-400 text-[12px] font-semibold ms-1">
                        *
                      </span>
                    </label>

                    <Controller
                      name="sub_category"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <SelectComponent
                          options={selectedSubCategories}
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select Sub Category"
                          isRequired
                        />
                      )}
                    />
                    {errors?.sub_category?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {String(errors.sub_category.message)}
                      </p>
                    )}
                  </div>

                  <Input
                    label="Description"
                    registerProperty={register("description")}
                    errorText={errors?.description?.message}
                    type="textarea"
                    isRequired
                    placeholder="Enter your description"
                  />

                  <Input
                    label="Amount"
                    registerProperty={register("amount")}
                    errorText={errors?.amount?.message}
                    type="text"
                    isRequired
                    placeholder="Enter amount"
                  />

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold dark:text-gray-300">
                        Select products
                      </h4>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-sm underline dark:text-gray-300"
                      >
                        {allSelected ? "Clear all" : "Select all"}
                      </button>
                    </div>

                    <div className="space-y-2">
                      {lineItems?.map((item: LineItem, index: number) => {
                        const id = lineItemIds[index];
                        const imgSrc =
                          (typeof item.product_id === "object"
                            ? item.product_id?.featured_image?.src
                            : undefined) || "";

                        const isSelected = selectedIds.includes(id);

                        return (
                          <label
                            key={id}
                            className={`flex items-start gap-4 border dark:border-gray-500 p-2 rounded-lg cursor-pointer ${isSelected
                              ? "border-blue-500 bg-blue-50 dark:bg-gray-600"
                              : "border-gray-200"
                              }`}
                          >
                            <div className="flex items-center gap-4">
                              <input
                                type="checkbox"
                                value={id}
                                {...register("selected_items")}
                                className="mt-1"
                              />
                              <Image
                                src={imgSrc || "/placeholder.png"}
                                alt={item.title || "product"}
                                height={56}
                                width={56}
                                className="rounded"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="text-base dark:text-gray-300">
                                {item.title}
                              </p>
                              {item?.total !== undefined && (
                                <p className="text-sm pt-1 dark:text-gray-300">
                                  Total: {item.total}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {errors?.selected_items?.message && (
                      <p className="text-xs text-red-500 mt-2">
                        {String(errors.selected_items.message)}
                      </p>
                    )}
                  </div>
                </div>
              )
            }
          </div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button
            onClick={handleCloseModal}
            className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300"
            type="button"
          >
            Cancel
          </Button>

          {showForm && (
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
          )}
        </Modal.Footer>
      </Modal>
    </form>
  );
};

export default ReportIssueModal;