import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Icon from "@admin/components/core/Icon/Icon";
import React, { useEffect } from "react";
import Select from "react-select";

const ModalX = ({
  isModalOpen,
  modalType,
  setIsModalOpen,
  handleSubmitAdvanced,
  handleSubmitCancel,
  formData,
  setFormData,
  labels,
  selectedLabels,
  setSelectedLabels,
  handleCityChange,
  note,
  setNote,
  orderDetails,
  isSubmitting,
}: any) => {
  useEffect(() => {
    if (orderDetails && labels) {
      const matchingItems = labels
        .filter((item: any) => orderDetails.includes(item?.id))
        .map((item: any) => ({
          label: item.labelName,
          value: item.id,
        }));
      setSelectedLabels(matchingItems);
    }
  }, [orderDetails, labels, setSelectedLabels]);

  useEffect(() => {
    const handleEscape = (event: any) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setFormData((prevData: any) => ({
          ...prevData,
          city: "",
          zone: "",
        }));
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsModalOpen, setFormData]);

  useEffect(() => {
    if (
      isModalOpen &&
      modalType === "pathao" &&
      formData.address &&
      !formData.city
    ) {
      fetch(
        `https://api.searchit.com.bd/fetch_city.php?address=${encodeURIComponent(
          formData.address
        )}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.success && data.city) {
            const selectedCity = {
              value: data.city.city_id,
              label: data.city.name,
            };
            setFormData((prevData: any) => ({
              ...prevData,
              city: selectedCity.value,
              zone: data.zone ? data.zone.zone_id : "",
            }));
            handleCityChange(selectedCity);
          }
        })
        .catch((error) => {
          console.error("Error fetching city:", error);
        });
    }
  }, [
    isModalOpen,
    modalType,
    formData.address,
    formData.city,
    handleCityChange,
    setFormData,
  ]);

  useEffect(() => {
    if (!isModalOpen) {
      setFormData(({ prevData }: any) => ({
        ...prevData,
        city: "",
        zone: "",
      }));
    }
  }, [isModalOpen, setFormData]);

  const paymentOptions = [
    { label: "Bkash", value: "bkash" },
    { label: "SSL Commerz", value: "sslcommerz" },
    { label: "Card", value: "card" },
    { label: "Cash", value: "cash" },
  ];

  const renderAdvancedForm = () => (
    <>
      <h2 className="text-2xl font-bold mb-4 dark:text-gray-300">
        Advance Amount
      </h2>
      <form onSubmit={handleSubmitAdvanced}>
        <select
          value={formData.payment_method || ""}
          onChange={(e) =>
            setFormData({ ...formData, payment_method: e.target.value })
          }
          required
          className="w-full p-2 mb-4 border border-gray-300 dark:bg-gray-700 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="">Select Payment Method</option>
          {paymentOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Enter advanced amount"
          value={formData.advancedAmount || ""}
          onChange={(e) =>
            setFormData({ ...formData, advancedAmount: e.target.value })
          }
          required
          className="w-full p-2 border border-gray-300 dark:bg-gray-700 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Enter TrxID"
          value={formData.trx_id || ""}
          onChange={(e) => setFormData({ ...formData, trx_id: e.target.value })}
          required
          className="w-full p-2 border dark:bg-gray-700 dark:border-gray-700 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none mt-4"
        />
        <Button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200 mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? <ButtonLoader /> : "Submit"}
        </Button>
      </form>
    </>
  );

  const renderCancelForm = () => (
    <>
      <h2 className="text-2xl font-bold mb-4">Cancel Order</h2>
      <form onSubmit={handleSubmitCancel}>
        <label className="block mb-4">
          <Select
            options={labels.map((label: any) => ({
              value: label.id,
              label: label.labelName,
            }))}
            value={selectedLabels}
            onChange={(selectedOptions) =>
              setSelectedLabels(selectedOptions ? selectedOptions : [])
            }
            isMulti
            placeholder="Select Labels"
            className="w-full"
          />
        </label>

        <textarea
          placeholder="Enter reason for cancellation"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="w-full bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition duration-200"
        >
          Submit
        </button>
      </form>
    </>
  );

  const renderModalContent = () => {
    switch (modalType) {
      case "cancelled":
        return renderCancelForm();
      case "advanced":
        return renderAdvancedForm();
      default:
      // return renderAddNoteForm();
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 md:p-0 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full p-6 relative">
            <Icon
              aria-label="Close modal"
              name="close"
              onClick={() => {
                setIsModalOpen(false);
                setFormData((prevData: any) => ({
                  ...prevData,
                  city: "",
                  zone: "",
                }));
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 cursor-pointer"
              variant="outlined"
            />
            {renderModalContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default ModalX;
