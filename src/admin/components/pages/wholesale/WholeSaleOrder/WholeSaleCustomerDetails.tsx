"use client";
import { wholesaleOrderService } from "@admin/@services/apis/OrdersService/wholesaleOrder.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Select from "@admin/components/core/Select/Select";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, maskPhone, noData } from "@admin/utils";
import { ToastService } from "@admin/utils/toastr.service";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface Customer {
  first: string;
  second: string;
  third?: string;
  copy: boolean;
  title?: string;
  is_verified?: boolean;
}

interface CustomerDetailsProps {
  customer: Customer;
  showToast?: any;
  orderDetails?: any;
  fetchOrdersDetails?: any;
  sysId?: any;
  is_verified?: any;
  verifyIcon?: boolean;
}

interface City {
  value: string;
  label: string;
}

interface Zone {
  value: string;
  label: string;
}

const copyToClipboard = async (
  text: string,
  showToast: (message: string) => void
) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Number copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const WholeSaleCustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  showToast,
  orderDetails,
  fetchOrdersDetails,
  is_verified,
  verifyIcon,
}) => {
  const { permissionList } = useGlobalContext();
  const { first, second, third, copy } = customer;
  const searchParams = useSearchParams();
  const isCampaign = searchParams.get("isCampaign");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [cityData, setCityData] = useState<any>();
  const [zoneData, setZoneData] = useState<any>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setFormLoading(true);
    e.preventDefault();
    const customerData = {
      city: {
        city_id: selectedCity?.value,
        city_name: selectedCity?.label,
      },
      zone: {
        zone_id: selectedZone?.value,
        zone_name: selectedZone?.label,
      },
    };

    wholesaleOrderService
      .updatePathaoBooking(orderDetails?._id, { customer: customerData })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          fetchOrdersDetails();
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setFormLoading(false);
      });
  };

  useEffect(() => {
    if (
      orderDetails?.customer?.city?.city_id &&
      orderDetails?.customer?.zone?.zone_id
    ) {
      setSelectedCity({
        label: orderDetails?.customer?.city?.city_name,
        value: orderDetails?.customer?.city?.city_id,
      });
      setSelectedZone({
        label: orderDetails?.customer?.zone?.zone_name,
        value: orderDetails?.customer?.zone?.zone_id,
      });
    }

    wholesaleOrderService
      .getPathaoCity()
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

  useEffect(() => {
    if (selectedCity?.value) {
      wholesaleOrderService
        .getPathaoZone(selectedCity.value)
        .then((res: any) => {
          if (res?.success) {
            setZoneData(res.data);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        });
    }
  }, [selectedCity?.value]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg md:w-1/2 px-5 py-3 md:mt-0 mt-4">
      <div className="flex items-center gap-1">
        <p className="font-bold dark:text-gray-400 ">{first || noData} </p>

        {verifyIcon && (
          <Icon
            className={`${
              is_verified === true ? "text-green-600" : "text-red-600"
            }`}
            size={18}
            name={is_verified === true ? "verified" : "verified_off"}
          />
        )}
      </div>
      <p className="font-bold flex items-center mt-1.5">
        {copy && second ? (
          <a
            href={`tel:${second}`}
            className="text-blue-500 dark:text-gray-400"
          >
            {isCampaign ? maskPhone(second) : second || noData}
          </a>
        ) : (
          <span className="dark:text-gray-400">{second || noData}</span>
        )}
        {copy && (
          <>
            <Icon
              size={16}
              name="content_copy"
              variant="outlined"
              className="ml-2 cursor-pointer dark:text-gray-400"
              onClick={() => copyToClipboard(second, showToast)}
            />
            <FontAwesomeIcon
              icon={faWhatsapp}
              className="ml-2 cursor-pointer text-green-500"
              onClick={() =>
                window.open(
                  `https://web.whatsapp.com/send?phone=88${second?.replace(
                    /\D/g,
                    ""
                  )}`,
                  "_blank"
                )
              }
            />
          </>
        )}
      </p>
      <p
        className={`font-bold mt-1.5 dark:text-gray-400 ${
          third?.toLowerCase().includes("bkash")
            ? "text-pink-500 dark:text-gray-300"
            : third?.toLowerCase().includes("card")
            ? "text-green-600 dark:text-gray-300"
            : ""
        }`}
      >
        {third}
      </p>

      {orderDetails && (
        <form
          onSubmit={handleSubmit}
          className="4xl:flex  w-full gap-4 flex-grow mt-4"
        >
          <div className="flex flex-col 2xl:flex-row gap-4 w-full">
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
                isDisabled={
                  !hasPermission(permissionList, "order_wholesale_edit")
                }
              />
            </div>

            <div className="min-w-64 flex-1">
              <Select
                isRequired
                options={zoneData?.map((city: any) => ({
                  value: city?.zone_id,
                  label: city?.zone_name,
                }))}
                value={selectedZone}
                onChange={(selectedOption: any) =>
                  setSelectedZone(selectedOption)
                }
                placeholder={` ${
                  !selectedCity
                    ? "Waiting For City Select..."
                    : "Now Select Zone"
                } `}
                className="w-full"
                isDisabled={
                  !selectedCity ||
                  !hasPermission(permissionList, "order_wholesale_edit")
                }
              />
            </div>
          </div>

          <div className="flex justify-end mt-2 4xl:mt-0">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 md:w-auto w-full mt-2 md:mt-0"
              disabled={
                !selectedZone ||
                !selectedZone ||
                !hasPermission(permissionList, "order_wholesale_edit")
              }
            >
              {formLoading ? <ButtonLoader /> : "Confirm"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default WholeSaleCustomerDetails;
