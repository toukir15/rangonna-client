"use client";
import { IOption } from "@admin/@interfaces/reportIssue/reportIssue.interface";
import { MimSmsService } from "@admin/@services/apis/SettingsService/mimSmsSevice/mimSms.service";
import Button from "@admin/components/core/Button/Button";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Input from "@admin/components/core/Input/Input";
import SelectComponent from "@admin/components/core/Select/Select";
import AuthLayout, { NoScrollLayout } from "@admin/layouts/AuthLayout";
import { ToastService } from "@admin/utils/toastr.service";
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

type ReportIssueForm = {
    title: {
        label: string;
        value: string;
    } | null;
    phone: string;
    message: string;
};

const defaultValue: ReportIssueForm = {
    title: null,
    phone: "",
    message: "",
};

const webSchema = yup.object({
    title: yup
        .object({
            label: yup.string().required(),
            value: yup.string().required(),
        })
        .nullable(),
    phone: yup.string().required("Phone number is required"),
    message: yup.string().required("Message is required"),
});

const Page: React.FC = () => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const [messagesOption, setMessagesOption] = useState<IOption[]>([]);

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
        control,
        setValue,
    } = useForm<any>({
        resolver: yupResolver(webSchema),
        defaultValues: defaultValue,
    });

    const formSubmit = async (formData: ReportIssueForm) => {
        const mainData = {
            phone: formData?.phone,
            message: formData?.message,
        };
        setIsSubmit(true);
        MimSmsService.sendMimSms(mainData)
            .then((res: any) => {
                if (res?.success) {
                    ToastService.success(res?.message);
                    reset(defaultValue);
                } else {
                    ToastService.error(res?.message || "Failed to create report");
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message || "Something went wrong");
            })
            .finally(() => setIsSubmit(false));
    };

    const getMimSms = () => {
        MimSmsService.getMimSmsSuggestion()
            .then((res) => {
                if (res?.success) {
                    const formattedData = res?.data?.map((item: any) => ({
                        label: item.title,
                        value: item.message,
                    }));

                    setMessagesOption(formattedData);
                } else {
                    ToastService.error(res?.message);
                }
            })
            .catch((err: { message: string }) => {
                ToastService.error(err.message);
            })

    };

    //hello

    useEffect(() => {
        getMimSms();
    }, []);
    return (
        <AuthLayout>
            <NoScrollLayout>
                <div className="px-4 pt-4">
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        Create SMS
                    </h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Send custom SMS or choose a message suggestion.
                    </p>
                </div>
            </NoScrollLayout>

            <div className="px-4 py-6">
                <div className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
                    <form onSubmit={handleSubmit(formSubmit)} className="space-y-6">
                        <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Send Message
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Enter phone number and message details below.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            <Input
                                label="Phone Number"
                                registerProperty={register("phone")}
                                errorText={errors?.phone?.message}
                                type="text"
                                isRequired
                                placeholder="01XXXXXXXXX"
                            />

                            <div>
                                <label className="mb-1 block text-sm font-semibold text-neutral-600 dark:text-gray-300">
                                    Message Suggestion
                                </label>

                                <Controller
                                    name="title"
                                    control={control}
                                    render={({ field }) => (
                                        <SelectComponent
                                            options={messagesOption}
                                            value={field.value}
                                            onChange={(selectedOption: any) => {
                                                field.onChange(selectedOption);
                                                setValue("message", selectedOption?.value || "");
                                            }}
                                            placeholder="Choose a message template"
                                            className="w-full"
                                        />
                                    )}
                                />

                                {errors?.title && (
                                    <p className="mt-1 text-sm text-red-500">
                                        {errors.title.message as string}
                                    </p>
                                )}
                            </div>

                            <Input
                                label="Message"
                                registerProperty={register("message")}
                                errorText={errors?.message?.message}
                                type="textarea"
                                isRequired
                                placeholder="Write your message here..."
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
                            <Button
                                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                                type="button"
                                onClick={() => reset(defaultValue)}
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                                disabled={isSubmit}
                            >
                                {isSubmit ? <ButtonLoader /> : "Send SMS"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Page;
