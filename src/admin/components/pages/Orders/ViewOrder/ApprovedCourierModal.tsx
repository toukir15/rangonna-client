"use client";
import React, { useEffect, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Select from "@admin/components/core/Select/Select";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { ToastService } from "@admin/utils/toastr.service";
import Image from "next/image";
import pathaoLogo from "@admin/assets/images/pathao.png";
import steadfastLogo from "@admin/assets/images/steadfast.jpg";

type CourierTab = "pathao" | "steadfast";

interface CityOption {
  value: string;
  label: string;
}

interface ApprovedCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderDetails?: any;
  onConfirm: (
    courier: CourierTab,
    city?: CityOption | null,
    zone?: CityOption | null,
  ) => Promise<void>;
  isSubmitting?: boolean;
}

const courierCards = [
  { key: "pathao" as CourierTab, label: "Pathao", logo: pathaoLogo },
  { key: "steadfast" as CourierTab, label: "SteadFast", logo: steadfastLogo },
];

const getCourierFromType = (courierType?: string): CourierTab | null => {
  const normalized = courierType?.toLowerCase();

  if (normalized === "pathao") return "pathao";
  if (normalized === "steadfast") return "steadfast";

  return null;
};

const ApprovedCourierModal: React.FC<ApprovedCourierModalProps> = ({
  isOpen,
  onClose,
  orderDetails,
  onConfirm,
  isSubmitting = false,
}) => {
  const [activeTab, setActiveTab] = useState<CourierTab | null>(null);
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null);
  const [selectedZone, setSelectedZone] = useState<CityOption | null>(null);
  const [cityData, setCityData] = useState<any[]>([]);
  const [zoneData, setZoneData] = useState<any[]>([]);

  const applyCustomerLocation = () => {
    const city = orderDetails?.customer?.city;
    const zone = orderDetails?.customer?.zone;

    if (city?.city_id) {
      setSelectedCity({
        label: city.city_name,
        value: city.city_id,
      });
    } else {
      setSelectedCity(null);
    }

    if (zone?.zone_id) {
      setSelectedZone({
        label: zone.zone_name,
        value: zone.zone_id,
      });
    } else {
      setSelectedZone(null);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setActiveTab(null);
      setSelectedCity(null);
      setSelectedZone(null);
      setZoneData([]);
      return;
    }

    const initialCourier = getCourierFromType(orderDetails?.courier_type);
    setActiveTab(initialCourier);
    setZoneData([]);

    if (initialCourier) {
      applyCustomerLocation();
    } else {
      setSelectedCity(null);
      setSelectedZone(null);
    }

    CourierService.getPathaoCity()
      .then((res: any) => {
        if (res?.success) {
          setCityData(res.data || []);
        } else {
          ToastService.error(res?.message || "Failed to load cities");
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message || "Failed to load cities");
      });
  }, [isOpen, orderDetails]);

  const handleCourierSelect = (courier: CourierTab) => {
    setActiveTab(courier);
    applyCustomerLocation();
  };

  useEffect(() => {
    if (!selectedCity?.value) {
      setZoneData([]);
      return;
    }

    CourierService.getPathaoZone(selectedCity.value)
      .then((res: any) => {
        if (res?.success) {
          setZoneData(res.data || []);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: { message: string }) => {
        ToastService.error(err.message);
      });
  }, [selectedCity?.value]);

  const handleConfirm = async () => {
    if (!activeTab) {
      ToastService.warning("Please select a courier");
      return;
    }

    if (!selectedCity?.value || !selectedZone?.value) {
      ToastService.warning("Please select city and zone");
      return;
    }

    await onConfirm(activeTab, selectedCity, selectedZone);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      width="w-full md:w-3/4"
      maxWidth="max-w-2xl"
    >
      <Modal.Header className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select Courier
        </h3>
        <Icon
          name="close"
          onClick={onClose}
          className="text-gray-600 cursor-pointer dark:text-gray-300"
        />
      </Modal.Header>

      <Modal.Body>
        <div className="mb-6 flex items-center justify-between gap-4">
          {courierCards.map((card) => (
            <div
              key={card.key}
              className={`flex-1 cursor-pointer p-4 border rounded-lg shadow-sm flex flex-col items-center space-y-2 transition-all ${
                activeTab === card.key
                  ? "bg-blue-200 border-blue-500"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
              onClick={() => handleCourierSelect(card.key)}
            >
              <Image
                src={card.logo}
                alt={card.label}
                className="w-20 h-14 object-contain rounded-lg"
              />
              <p className="text-sm font-semibold dark:text-gray-200">
                {card.label}
              </p>
            </div>
          ))}
        </div>

        {(activeTab === "pathao" || activeTab === "steadfast") && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
                City <span className="text-red-400">*</span>
              </label>
              <Select
                isRequired
                options={cityData.map((city: any) => ({
                  value: city.city_id,
                  label: city.city_name,
                }))}
                value={selectedCity}
                onChange={(option: CityOption | null) => {
                  setSelectedCity(option);
                  setSelectedZone(null);
                }}
                placeholder="Select City"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 dark:text-gray-300">
                Zone <span className="text-red-400">*</span>
              </label>
              <Select
                isRequired
                options={zoneData.map((zone: any) => ({
                  value: zone.zone_id,
                  label: zone.zone_name,
                }))}
                value={selectedZone}
                onChange={(option: CityOption | null) =>
                  setSelectedZone(option)
                }
                placeholder={selectedCity ? "Select Zone" : "Select city first"}
                className="w-full"
                isDisabled={!selectedCity}
              />
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="flex justify-end space-x-2">
        <Button onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={
            isSubmitting || !activeTab || !selectedCity || !selectedZone
          }
          className="bg-blue-500 text-white px-4 rounded"
        >
          {isSubmitting ? <ButtonLoader /> : "Confirm"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ApprovedCourierModal;
