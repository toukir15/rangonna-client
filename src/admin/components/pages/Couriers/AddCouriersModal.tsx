import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import React, { useContext, useEffect, useState } from "react";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import { ToastService } from "@admin/utils/toastr.service";
import SelectComponent from "@admin/components/core/Select/Select";
import patho from "@admin/assets/images/pathao.png";
import steadfast from "@admin/assets/images/steadfast.jpg";
import redx from "@admin/assets/images/redx.png";
import Image from "next/image";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { CourierService } from "@admin/@services/apis/CouriersService/Courier.service";
import { IWebsiteOption } from "@admin/@interfaces/common.interface";
import { CreateCourierPayload } from "@admin/@interfaces/couriers/couriers.interface";
import { CourierManagementContext } from "@admin/context/CourierManagementContext";

const AddCouriersModal = () => {
  const { fetchCouriers, isModalOpen, setIsModalOpen, modalMode, items } =
    useContext(CourierManagementContext);

  const couriers = [
    { name: "Pathao", logo: patho },
    { name: "SteadFast", logo: steadfast },
    { name: "RedX", logo: redx },
  ];

  const [isSubmit, setIsSubmit] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<string>(
    couriers[0].name
  );
  const [websiteOptions, setWebsiteOptions] = useState<IWebsiteOption[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<IWebsiteOption | null>(
    null
  );
  const [formData, setFormData] = useState<any>({
    name: "",
    type: couriers[0].name,
    website_id: null,
  });

  // ✅ Handle field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // ✅ Select courier
  const handleCourierSelect = (courierName: string) => {
    setSelectedCourier(courierName);
    setFormData((prev: any) => ({
      ...prev,
      type: courierName,
    }));
  };

  // ✅ Fetch websites
  const fetchWebList = async () => {
    try {
      const res = await GlobalService.getWebsiteList();
      if (res?.success) {
        const options = res?.data?.map((item: any) => ({
          label: item.web_name,
          value: item._id,
        }));
        setWebsiteOptions(options);
      } else ToastService.error(res?.message);
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  // ✅ Initialize on open
  useEffect(() => {
    if (isModalOpen) {
      fetchWebList();
      if (modalMode === "Edit" && items) {
        const courierType = items?.type || items?.courierType || couriers[0].name;
        const credentials = items?.credentials || {};
        setSelectedCourier(courierType);
        setSelectedWebsite({
          label: items?.website?.web_name || items?.website_id?.web_name || "",
          value: items?.website?._id || items?.website_id?._id || items?.website_id || null,
        });
        setFormData({
          ...items,
          ...credentials,
          marchant_store_id:
            credentials.merchant_store_id || items?.marchant_store_id || "",
          website_id: items?.website?._id || items?.website_id?._id || items?.website_id || null,
        });
      } else {
        // Reset when Create
        setFormData({ name: "", type: couriers[0].name, website_id: null });
        setSelectedCourier(couriers[0].name);
        setSelectedWebsite(null);
      }
    }
  }, [isModalOpen, modalMode, items]);

  const buildPayload = (): CreateCourierPayload => {
    const website_id = selectedWebsite?.value as string;
    const webhook = formData.webhook?.trim() || undefined;

    if (selectedCourier === "SteadFast") {
      return {
        name: formData.name,
        provider: "steadfast",
        website_id,
        store_name: formData.store_name,
        ...(webhook ? { webhook } : {}),
        credentials: {
          api_key: formData.api_key,
          secret_key: formData.secret_key,
          merchant_store_id: formData.marchant_store_id,
        },
      };
    }

    return {
      name: formData.name,
      provider: "pathao",
      website_id,
      store_name: formData.store_name || "",
      ...(webhook ? { webhook } : {}),
      credentials: {
        client_id: formData.client_id,
        client_secret: formData.client_secret,
        user_name: formData.user_name,
        password: formData.password,
        store_id: formData.store_id || "",
        is_delivered: formData.is_delivered || "",
      },
    };
  };

  const submitCourier = async (payload: CreateCourierPayload) => {
    if (modalMode === "Edit") {
      if (selectedCourier === "SteadFast") {
        return CourierService.updateSteadfast(items._id, payload);
      }
      return CourierService.updateCourier(items._id, payload);
    }

    return CourierService.createCourier(payload);
  };

  // ✅ Submit (Create / Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWebsite?.value) {
      ToastService.error("Please select a website");
      return;
    }
    setIsSubmit(true);
    try {
      const payload = buildPayload();
      const res = await submitCourier(payload);

      if (res?.success) {
        ToastService.success(res?.message);
        fetchCouriers();
        setIsModalOpen(false);
      } else {
        ToastService.error(res?.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  // ✅ Dynamic Field Render
  const renderFormFields = () => {
    if (!selectedCourier) return <p>Please select a courier.</p>;

    return (
      <>
        <div className="mb-6">
          <label className="block font-semibold mb-2 text-gray-600">
            Select Website
          </label>
          <SelectComponent
            options={websiteOptions}
            value={selectedWebsite}
            onChange={(opt: any) => {
              setSelectedWebsite(opt);
              setFormData((prev: any) => ({
                ...prev,
                website_id: opt?.value || null,
              }));
            }}
            placeholder="Select Website"
            className="w-full"
          />
        </div>

        <div className="md:mb-4 mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            onChange={handleInputChange}
            placeholder="Enter courier name or purpose"
            className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </div>

        {selectedCourier === "Pathao" &&
          [
            "client_id",
            "client_secret",
            "user_name",
            "password",
            "webhook",
          ].map((f) => (
            <div key={f} className="md:mb-4 mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                {f.replace(/_/g, " ")}
              </label>
              <input
                type={f === "password" ? "password" : "text"}
                name={f}
                value={formData[f] || ""}
                onChange={handleInputChange}
                placeholder={`Enter ${f}`}
                className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          ))}

        {selectedCourier === "SteadFast" &&
          [
            "marchant_store_id",
            "store_name",
            "api_key",
            "secret_key",
            "webhook",
          ].map((f) => (
            <div key={f} className="md:mb-4 mb-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1 capitalize">
                {f.replace(/_/g, " ")}
                {f === "webhook" && (
                  <span className="text-gray-400 font-normal ml-1">(optional)</span>
                )}
              </label>
              <input
                type={f === "secret_key" ? "password" : "text"}
                name={f}
                value={formData[f] || ""}
                onChange={handleInputChange}
                placeholder={`Enter ${f.replace(/_/g, " ")}`}
                className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                required={f !== "webhook"}
              />
            </div>
          ))}

        {selectedCourier === "RedX" && (
          <div className="md:mb-4 mb-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              name="apiKey"
              value={formData.apiKey || ""}
              onChange={handleInputChange}
              placeholder="Enter API Key"
              className="w-full p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}
      </>
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {modalMode === "Edit" ? "Edit Courier" : "Add Courier"}
          </h3>
          <Icon
            name="close"
            onClick={() => setIsModalOpen(false)}
            className="text-gray-600 cursor-pointer dark:text-gray-300"
          />
        </Modal.Header>

        <Modal.Body>
          <div className="mb-6 flex items-center justify-between gap-4">
            {couriers.map((c, i) => (
              <div
                key={i}
                className={`cursor-pointer p-4 border rounded-lg shadow-sm flex flex-col items-center space-y-2 transition-all ${
                  selectedCourier === c.name
                    ? "bg-blue-200 border-blue-500"
                    : "bg-gray-100 hover:bg-gray-200 border-gray-300"
                }`}
                onClick={() => handleCourierSelect(c.name)}
              >
                <Image
                  src={c.logo}
                  alt={c.name}
                  className="w-20 h-14 object-contain rounded-lg"
                />
                <p className="text-sm font-semibold">{c.name}</p>
              </div>
            ))}
          </div>
          <div className="ps-2">{renderFormFields()}</div>
        </Modal.Body>

        <Modal.Footer className="flex justify-end space-x-2">
          <Button className="bg-gray-400" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="rounded-m flex justify-center font-medium text-white bg-blue-500"
            disabled={isSubmit || !selectedWebsite?.value}
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

export default AddCouriersModal;
