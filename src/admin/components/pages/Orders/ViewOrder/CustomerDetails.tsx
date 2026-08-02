"use client";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { productService } from "@admin/@services/apis/ProductService/Product.service";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import Select from "@admin/components/core/Select/Select";
import { useGlobalContext } from "@admin/context/GlobalContext";
import { hasPermission, maskPhone, noData, trimString } from "@admin/utils";
import { ToastService } from "@admin/utils/toastr.service";
// import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import SendMessageModal from "./CouponModal/SendMessageModal";
import ApprovedCourierModal from "./ApprovedCourierModal";
import Button from "@admin/components/core/Button/Button";

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
  iSSms?: boolean;
  showUpdateCourier?: boolean;
  fetchPrintOrderDetails?: () => void;
}

interface City {
  value: string;
  label: string;
}

interface Zone {
  value: string;
  label: string;
}

const formatCourierType = (type?: string) => {
  if (!type) return "";

  const courierLabels: Record<string, string> = {
    pathao: "Pathao",
    steadfast: "SteadFast",
  };

  return courierLabels[type.toLowerCase()] || type;
};

const copyToClipboard = async (
  text: string,
  showToast: (message: string) => void,
) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Number copied to clipboard!");
  } catch (err) {
    console.error("Failed to copy: ", err);
  }
};

const CustomerDetails: React.FC<CustomerDetailsProps> = ({
  customer,
  showToast,
  orderDetails,
  fetchOrdersDetails,
  is_verified,
  verifyIcon,
  iSSms,
  showUpdateCourier = false,
  fetchPrintOrderDetails,
}) => {
  const { permissionList } = useGlobalContext();
  const { first, second, third, copy } = customer;
  const cityName = orderDetails?.customer?.city?.city_name;
  const zoneName = orderDetails?.customer?.zone?.zone_name;
  const courierType = orderDetails?.courier_type;
  const searchParams = useSearchParams();
  const isCampaign = searchParams.get("isCampaign");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [cityData, setCityData] = useState<any>();
  const [zoneData, setZoneData] = useState<any>();
  const [modalOpen, setModalOpen] = useState(false);
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [courierSubmitting, setCourierSubmitting] = useState(false);

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

    productService
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

  useEffect(() => {
    if (selectedCity?.value) {
      CourierService.getPathaoZone(selectedCity.value)
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

  const handleCourierConfirm = async (
    courier: "pathao" | "steadfast",
    city?: City | null,
    zone?: Zone | null,
  ) => {
    setCourierSubmitting(true);
    try {
      const payload: Record<string, any> = {
        courier_type: courier,
      };

      if (city && zone) {
        payload.customer = {
          city: { city_id: city.value, city_name: city.label },
          zone: { zone_id: zone.value, zone_name: zone.label },
        };
      }

      const res = await productService.updatePathaoBooking(
        orderDetails?._id,
        payload,
      );

      if (!res?.success) {
        ToastService.error(res?.message || "Failed to update courier");
        return;
      }

      ToastService.success(res?.message);
      fetchOrdersDetails?.();
      fetchPrintOrderDetails?.();
      setCourierModalOpen(false);
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to update courier");
    } finally {
      setCourierSubmitting(false);
    }
  };

  return (
    <div className="ov-detail-card md:w-1/2 md:mt-0 mt-4">
      {customer?.title ? (
        <p className="ov-detail-card__label">{customer.title}</p>
      ) : null}
      <div className="flex items-center gap-1">
        <p className="ov-detail-card__title">
          {trimString(first, 200) || noData}
          {showUpdateCourier && (zoneName || cityName) && (
            <span className="font-semibold text-[0.9em] opacity-70">
              {" ("}
              {[zoneName, cityName].filter(Boolean).join(", ")}
              {")"}
            </span>
          )}{" "}
        </p>

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
      <div className="ov-detail-card__row">
        <p className="font-bold flex items-center">
          {copy && second ? (
            <a href={`tel:${second}`} className="ov-detail-card__phone">
              {isCampaign ? maskPhone(second) : second || noData}
            </a>
          ) : (
            <span className="dark:text-gray-400 text-sm opacity-80">
              {second || noData}
            </span>
          )}
          {copy && (
            <>
              <Icon
                size={16}
                name="content_copy"
                variant="outlined"
                className="ml-2 cursor-pointer dark:text-gray-400 opacity-60"
                onClick={() => copyToClipboard(second, showToast)}
              />
            </>
          )}
        </p>
        <p>
          {iSSms ? (
            <Icon
              name="sms"
              className="text-[#b8922e] cursor-pointer"
              variant="outlined"
              onClick={() => setModalOpen(true)}
            />
          ) : null}
        </p>
      </div>

      {showUpdateCourier && (
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission(permissionList, "order_edit") && (
            <Button
              type="button"
              onClick={() => setCourierModalOpen(true)}
              className="ov-courier-btn"
            >
              <Icon name="local_shipping" variant="outlined" size={18} />
              Update Courier
            </Button>
          )}
          {courierType && (
            <span className="ov-courier-chip">
              {formatCourierType(courierType)}
            </span>
          )}
        </div>
      )}

      <p
        className={`font-bold mt-2 text-sm dark:text-gray-400 ${
          third?.toLowerCase().includes("bkash")
            ? "text-pink-500 dark:text-gray-300"
            : third?.toLowerCase().includes("card")
              ? "text-green-600 dark:text-gray-300"
              : "opacity-75"
        }`}
      >
        {third}
      </p>

      {/* City/Zone selection - temporarily disabled
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
                isDisabled={!hasPermission(permissionList, "order_edit")}
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
                placeholder={` ${!selectedCity
                  ? "Waiting For City Select..."
                  : "Now Select Zone"
                  } `}
                className="w-full"
                isDisabled={
                  !selectedCity || !hasPermission(permissionList, "order_edit")
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
                !hasPermission(permissionList, "order_edit")
              }
            >
              {formLoading ? <ButtonLoader /> : "Confirm"}
            </button>
          </div>
        </form>
      )}
      */}

      <SendMessageModal
        isModalOpen={modalOpen}
        setIsModalOpen={setModalOpen}
        orderDetail={customer}
      />

      <ApprovedCourierModal
        isOpen={courierModalOpen}
        onClose={() => setCourierModalOpen(false)}
        orderDetails={orderDetails}
        onConfirm={handleCourierConfirm}
        isSubmitting={courierSubmitting}
      />
    </div>
  );
};

export default CustomerDetails;
