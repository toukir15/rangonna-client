"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import SelectComponent from "@admin/components/core/Select/Select";
import React, { useContext, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { GlobalService } from "@admin/@services/apis/GlobalService/Global.service";
import { MarketingWebHookContext } from "@/app/admin/marketing/marketing-webhook/page";
import { marketingWebhookService } from "@admin/@services/apis/Marketing/MarketingWebhook.service";

interface FormValues {
  website: { label: string; value: string } | null;
  webhook_url: string;
}

const schema = yup.object({
  website: yup.mixed().required("Website is required"),
  webhook_url: yup.string().required("Webhook URL is required"),
});

const defaultValues: FormValues = {
  website: null,
  webhook_url: "",
};

const MarketingWebhookListModal = () => {
  const {
    isModalOpen,
    setIsModalOpen,
    modalMode,
    items,
    getMarketingWebhookList,
  } = useContext(MarketingWebHookContext);

  const [isSubmit, setIsSubmit] = useState(false);
  const [websiteOptions, setWebsiteOptions] = useState<any[]>([]);

  const {
    handleSubmit,
    control,
    register,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  /* ---------------- Fetch Website List ---------------- */
  const fetchWebList = async () => {
    try {
      const res = await GlobalService.getWebsiteList();
      if (res?.success) {
        setWebsiteOptions(
          res.data.data.map((item: any) => ({
            label: item.web_name,
            value: item._id,
          }))
        );
      }
    } catch (err: any) {
      ToastService.error(err.message);
    }
  };

  /* ---------------- Edit Mode Reset ---------------- */
  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        website: {
          label: items.website?.web_name,
          value: items.website?._id,
        },

        webhook_url: items.webhook_url,
      });
    } else {
      reset(defaultValues);
    }
  }, [modalMode, items, reset]);

  useEffect(() => {
    if (isModalOpen) fetchWebList();
  }, [isModalOpen]);

  /* ---------------- Submit ---------------- */
  const onSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const payload = {
      website: data.website?.value,
      webhook_url: data.webhook_url,
    };

    try {
      const res =
        modalMode === "Edit"
          ? await marketingWebhookService.updateMarketingWebhook(
              items._id,
              payload
            )
          : await marketingWebhookService.createMarketingWebhook(payload);

      if (res?.success) {
        ToastService.success(res.message);
        setIsModalOpen(false);
        getMarketingWebhookList();
        reset(defaultValues);
      } else {
        ToastService.error(res.message);
      }
    } catch (err: any) {
      ToastService.error(err.message);
    } finally {
      setIsSubmit(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        width="w-full md:w-3/4"
        maxWidth="max-w-2xl"
      >
        <Modal.Header className="flex justify-between">
          <h3 className="text-lg font-semibold">
            {modalMode === "Edit" ? "Edit Webhook" : "Create Webhook"}
          </h3>
          <Icon name="close" onClick={() => setIsModalOpen(false)} />
        </Modal.Header>

        <Modal.Body>
          <Controller
            name="website"
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
            label="Webhook URL"
            registerProperty={register("webhook_url")}
            errorText={errors.webhook_url?.message}
            placeholder="Enter webhook url"
            isRequired
          />
        </Modal.Body>

        <Modal.Footer className="flex justify-end gap-2">
          <Button onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button type="submit" disabled={isSubmit}>
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

export default MarketingWebhookListModal;
