"use client";
import React, { useEffect, useState } from "react";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Image from "next/image";
import pathaoLogo from "@admin/assets/images/pathao.png";
import steadfastLogo from "@admin/assets/images/steadfast.jpg";

export type RDCourierType = "all" | "pathao" | "steadfast";

interface RDPrintCourierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (courierType: RDCourierType) => Promise<void>;
  isLoading?: boolean;
}

const courierOptions: {
  key: RDCourierType;
  label: string;
  logo?: typeof pathaoLogo;
}[] = [
  { key: "all", label: "All" },
  { key: "pathao", label: "Pathao", logo: pathaoLogo },
  { key: "steadfast", label: "SteadFast", logo: steadfastLogo },
];

const RDPrintCourierModal: React.FC<RDPrintCourierModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedCourier, setSelectedCourier] = useState<RDCourierType | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedCourier(null);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!selectedCourier) return;
    await onConfirm(selectedCourier);
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
          Select Courier for R-D Print
        </h3>
        <Icon
          name="close"
          onClick={onClose}
          className="text-gray-600 cursor-pointer dark:text-gray-300"
        />
      </Modal.Header>

      <Modal.Body>
        <div className="mb-2 flex items-center justify-between gap-4">
          {courierOptions.map((option) => (
            <div
              key={option.key}
              className={`flex-1 cursor-pointer p-4 border rounded-lg shadow-sm flex flex-col items-center space-y-2 transition-all ${
                selectedCourier === option.key
                  ? "bg-blue-200 border-blue-500"
                  : "bg-gray-100 hover:bg-gray-200 border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
              }`}
              onClick={() => setSelectedCourier(option.key)}
            >
              {option.logo ? (
                <Image
                  src={option.logo}
                  alt={option.label}
                  className="w-20 h-14 object-contain rounded-lg"
                />
              ) : (
                <div className="w-20 h-14 flex items-center justify-center">
                  <Icon
                    name="inventory_2"
                    size={48}
                    className="text-gray-600 dark:text-gray-300"
                  />
                </div>
              )}
              <p className="text-sm font-semibold dark:text-gray-200">
                {option.label}
              </p>
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer className="flex justify-end space-x-2">
        <Button onClick={onClose} type="button">
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={isLoading || !selectedCourier}
          className="bg-green-500 text-white px-4 rounded"
        >
          {isLoading ? <ButtonLoader /> : "Print"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RDPrintCourierModal;
