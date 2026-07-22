"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Input from "@admin/components/core/Input/Input";
import Switch from "@admin/components/core/SwitchButton/SingleSwitch";
import AuthLayout from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { CampaignPageService } from "@admin/@services/apis/CampaignPage/CampaignPage.service";

const RichTextEditor = dynamic(
  () => import("@admin/components/core/Editor/RichTextEditor"),
  { ssr: false },
);

export interface IPageFormValues {
  title: string;
  slug: string;
  status: boolean;
}

const defaultValue: IPageFormValues = {
  title: "",
  slug: "",
  status: true,
};

const pageSchema = yup.object({
  title: yup.string().required("Title is required"),
  slug: yup.string().required("Slug is required"),
  status: yup.boolean(),
});

export const toCampaignPageSlug = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "-");

type CampaignPageFormProps = {
  mode: "add" | "edit";
  pageId?: string;
};

const CampaignPageForm: React.FC<CampaignPageFormProps> = ({ mode, pageId }) => {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [statusEnabled, setStatusEnabled] = useState(true);
  const [loading, setLoading] = useState(mode === "edit");

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<IPageFormValues>({
    resolver: yupResolver(pageSchema),
    defaultValues: defaultValue,
  });

  useEffect(() => {
    if (mode !== "edit" || !pageId) return;

    setLoading(true);
    CampaignPageService.getCampaignPageById(pageId)
      .then((res: any) => {
        if (!res?.success) {
          ToastService.error(res?.message || "Failed to load page");
          return;
        }

        const page = res.data;
        const status = page?.status ?? true;
        reset({
          title: page?.title?.toString() || "",
          slug: page?.slug?.toString() || "",
          status,
        });
        setStatusEnabled(status);
        setContent(page?.description || "");
      })
      .catch((err: { message?: string }) => {
        ToastService.error(err?.message || "Failed to load page");
      })
      .finally(() => setLoading(false));
  }, [mode, pageId, reset]);

  const titleRegister = register("title", {
    onChange: (e) => {
      if (mode === "edit") return;
      setValue("slug", toCampaignPageSlug(e.target.value), {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
  });

  const formSubmit = async (formData: IPageFormValues) => {
    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: content.trim(),
      status: formData.status,
    };

    try {
      const res =
        mode === "edit" && pageId
          ? await CampaignPageService.updateCampaignPage(pageId, payload)
          : await CampaignPageService.createCampaignPage(payload);

      if (res?.success) {
        ToastService.success(res?.message || "Saved successfully");
        router.push("/admin/pages");
      } else {
        ToastService.error(res?.message || "Failed to save page");
      }
    } catch (err: any) {
      ToastService.error(err?.message || "Something went wrong");
    }
  };

  return (
    <AuthLayout>
      <div className="p-3 md:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="2xl:text-2xl lg:text-xl text-lg text-blue-900 font-semibold dark:text-gray-300">
            {mode === "edit" ? "Edit Campaign Page" : "Create Campaign Page"}
          </h2>
          <Link
            href="/admin/pages"
            className="text-sm text-blue-600 hover:underline dark:text-blue-400"
          >
            Back to Pages
          </Link>
        </div>

        {loading ? (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-sm text-gray-500">
            Loading page...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(formSubmit)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm p-4 md:p-6 space-y-4"
          >
            <Input
              label="Title"
              registerProperty={titleRegister}
              errorText={errors.title?.message}
              type="text"
              isRequired
              placeholder="Enter page title"
            />

            <Input
              label="Slug"
              registerProperty={register("slug")}
              errorText={errors.slug?.message}
              type="text"
              isRequired
              placeholder="Enter page slug"
            />

            <div>
              <p className="block text-sm font-semibold text-neutral-600 dark:text-gray-300 mb-1">
                Description
              </p>
              <RichTextEditor
                key={`${mode}-${pageId || "new"}`}
                content={content}
                onChange={setContent}
                uploadFolder="campaign-page"
                placeholder="Write page content here..."
              />
            </div>

            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold text-neutral-600 dark:text-gray-300">
                Status
              </p>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Switch
                    key={`${pageId || "new"}-${statusEnabled}`}
                    default={statusEnabled}
                    onToggle={(value) => {
                      field.onChange(value);
                      setStatusEnabled(value);
                    }}
                  />
                )}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {statusEnabled ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Link href="/admin/pages">
                <Button type="button">Cancel</Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-500 text-white px-4 rounded"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ButtonLoader />
                ) : mode === "edit" ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  );
};

export default CampaignPageForm;
