"use client";
import React, { useEffect, useState } from "react";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { ReportIssueCategoryService } from "@admin/@services/apis/ReportIssueService/ReportIssue.service";
import Input from "@admin/components/core/Input/Input";
import Select from "@admin/components/core/Select/Select";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import SelectComponent from "@admin/components/core/Select/Select";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";

type ReportIssueForm = {
  first_name: string;
  phone: string;
  address: string;
  city: { label: string; value: number } | null;
  zone: { label: string; value: number } | null;
  cod: number | null;
  domain: any
};

const defaultValue: ReportIssueForm = {
  first_name: "",
  phone: "",
  address: "",
  city: null,
  zone: null,
  cod: null,
  domain: null,
};

const webSchema = yup.object({
  first_name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  address: yup.string().required("Address is required"),
  city: yup.mixed(),
  zone: yup.mixed(),
  domain: yup.mixed(),
  cod: yup.number().required("COD amount is required"),
});

const ViewReportIssueModal = ({
  isModalOpen,
  setIsModalOpen,
  modalMode,
  orderDetail,
}: any) => {
  const [isSubmit, setIsSubmit] = useState(false);
  const [cityData, setCityData] = useState<any[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<any | null>(null);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [websiteOption, setWebsiteOption] = useState<any[]>([]);
  const websiteOptions = websiteOption?.map((item) => ({
    label: item.web_name,
    value: item.web_url,
  }));

  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    control
  } = useForm<any>({
    resolver: yupResolver(webSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    fetchWebsite();
  }, []);


  const fetchWebsite = () => {
    GlobalService.getWebsiteList()
      .then((res: any) => {
        if (res?.success) {
          setWebsiteOption(res?.data);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  };


  // ✅ Load cities
  useEffect(() => {
    CourierService.getPathaoCity()
      .then((res: any) => {
        if (res?.success) {
          setCityData(res.data);
        } else {
          ToastService.error(res?.message || "Failed to load cities");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Failed to load cities");
      });
  }, []);

  // ✅ Load zones when city changes
  useEffect(() => {
    if (selectedCity?.value) {
      CourierService.getPathaoZone(selectedCity.value)
        .then((res: any) => {
          if (res?.success) {
            setZoneData(res?.data);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        });
    } else {
      setZoneData([]);
      setSelectedZone(null);
    }
  }, [selectedCity?.value]);

  // ✅ Reset form when orderDetail changes
  useEffect(() => {
    if (!orderDetail) return;

    // const order = orderDetail?.order;
    // const customer = order?.customer || {};

    // const city = customer.city
    //   ? {
    //     label: customer.city.city_name,
    //     value: customer.city.city_id,
    //   }
    //   : null;

    // const zone = customer.zone
    //   ? {
    //     label: customer.zone.zone_name,
    //     value: customer.zone.zone_id,
    //   }
    //   : null;

    // setSelectedCity(city);
    // setSelectedZone(zone);

    reset({
      first_name: orderDetail?.name || "",
      phone: orderDetail?.phone || "",
      address: orderDetail?.address || "",
      city: selectedCity?.value,
      zone: selectedZone?.value,
      cod: orderDetail?.payment?.due,

    });
  }, [orderDetail, reset]);

  const formSubmit = async (formData: ReportIssueForm) => {
    setIsSubmit(true);

    try {
      const payload = {
        ...formData,
        city: selectedCity?.value,
        zone: selectedZone?.value,
        orderId: `issue-${orderDetail?.order_sysid}`,
        domain: formData?.domain?.value
      };


      const res = await ReportIssueCategoryService.createReportIssuePathao(
        payload
      );

      if (res?.success) {
        ToastService.success(res?.message);
        setIsModalOpen(false);
        // reset(defaultValue);
      } else {
        ToastService.error(res?.message || "Failed to create report");
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
        <Modal.Header className="flex items-center justify-between ">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">
            Pathao Booking
            <span className="font-bold text-blue-900 dark:text-gray-300 ps-2">
              #{orderDetail?.order_sysid}
            </span>
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div>
            <label className="block font-semibold mb-2 text-gray-600">

              Select Website    <span className="text-red-400 font-inter text-[12px] font-semibold">
                *
              </span>
            </label>
            <Controller
              name="domain"
              control={control}
              render={({ field }) => (
                <SelectComponent
                  options={websiteOptions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select Website"
                  isRequired
                />
              )}
            />
            <Input
              label="Name"
              registerProperty={register("first_name")}
              errorText={errors?.first_name?.message}
              type="text"
              isRequired
              placeholder="Enter your name"
            />
            <Input
              label="Phone No"
              registerProperty={register("phone")}
              errorText={errors?.phone?.message}
              type="text"
              isRequired
              placeholder="Enter your phone"
            />
            <Input
              label="Address"
              registerProperty={register("address")}
              errorText={errors?.address?.message}
              type="textarea"
              isRequired
              placeholder="Enter your address"
            />

            <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 ">
              City <span className="text-red-400">*</span>
            </p>
            <div className="min-w-60 flex-1">
              <Select
                isRequired
                options={cityData?.map((city: any) => ({
                  value: city?.city_id,
                  label: city?.city_name,
                }))}
                value={selectedCity}
                onChange={(selectedOption: any) => {
                  setSelectedCity(selectedOption);
                }}
                placeholder="Select City First"
                className="w-full"
              />
            </div>

            <p className="font-inter text-sm font-semibold text-neutral-600 dark:text-gray-300 mt-4">
              Zone <span className="text-red-400">*</span>
            </p>
            <div className="min-w-60 flex-1">
              <Select
                isRequired
                options={zoneData?.map((zone: any) => ({
                  value: zone?.zone_id,
                  label: zone?.zone_name,
                }))}
                value={selectedZone}
                onChange={(selectedOption: any) =>
                  setSelectedZone(selectedOption)
                }
                placeholder={
                  !selectedCity
                    ? "Waiting For City Select..."
                    : "Now Select Zone"
                }
                className="w-full"
                isDisabled={!selectedCity}
              />
            </div>

            <Input
              label="Amount to Collect"
              registerProperty={register("cod")}
              errorText={errors?.cod?.message}
              type="number"
              isRequired
              placeholder="Enter COD amount"
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

export default ViewReportIssueModal;
