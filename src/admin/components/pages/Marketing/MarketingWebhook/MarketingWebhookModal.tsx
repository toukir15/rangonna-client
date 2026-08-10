"use client";

import Button from "@admin/components/core/Button/Button";
import Icon from "@admin/components/core/Icon/Icon";
import Input from "@admin/components/core/Input/Input";
import Modal from "@admin/components/core/ModalFrom/ModalFrom";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { ToastService } from "@admin/utils/toastr.service";
import { MarketingWebHookContext } from "@/app/admin/marketing/marketing-webhook/page";
import { marketingWebhookService } from "@admin/@services/apis/Marketing/MarketingWebhook.service";

interface FormValues {
  webhook_url: string;
}

const schema = yup.object({
  webhook_url: yup.string().required("Webhook URL is required"),
});

const defaultValues: FormValues = {
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

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors },
  } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (modalMode === "Edit" && items) {
      reset({
        webhook_url: items.webhook_url,
      });
    } else {
      reset(defaultValues);
    }
  }, [modalMode, items, reset]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmit(true);

    const payload = {
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
