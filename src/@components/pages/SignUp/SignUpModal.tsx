import React, { useContext, useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import ContentModal from "@/@components/core/Modal/ContentModal";
import Icon from "@/@components/core/Icon/Icon";
import Input from "@/@components/core/Input/Input";
import Button from "@/@components/core/Button/Button";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";
import { GlobalContext } from "../Context/GlobalContext";
import { usePathname } from "next/navigation";

interface PurchasesModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

type FormValues = {
  phone: string;
  code?: string;
};

const phoneRegex = /^(?:\+?88)?01[3-9]\d{8}$/;

const schemaSend = yup.object({
  phone: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(phoneRegex, "Enter a valid Bangladeshi phone number"),
});

const schemaVerify = yup.object({
  phone: yup.string().trim().required(),
  code: yup
    .string()
    .trim()
    .required("OTP code is required")
    .length(4, "OTP must be 4 digits"),
});

const SignUpModal: React.FC<PurchasesModalProps> = ({
  isModalOpen,
  setIsModalOpen,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const [step, setStep] = useState<"send" | "verify">("send");
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);
  const { fetchUserInfo } = useContext(GlobalContext);

  const resolver = useMemo(
    () => yupResolver(step === "send" ? schemaSend : schemaVerify),
    [step]
  );

  const {
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver,
    defaultValues: { phone: "", code: "" },
  });

  const phone = watch("phone");
  const code = watch("code");

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = setInterval(() => setResendCountdown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [resendCountdown]);

  const onSendOtp = async (data: FormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await ProductService.fetchOtp({ phone: data.phone });

      setStep("verify");
      setResendCountdown(60);
    } catch (err: any) {
      ToastService.error(
        err?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (data: FormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      const res = await ProductService.verifyOtp({
        phone: data.phone,
        code: data.code,
      });
      setIsModalOpen(false);
      ToastService.success(res.message);
      fetchUserInfo();
      router.refresh();
      router.push(pathname);
      // router.push("my-account");

      setStep("send");
      reset();
    } catch (err: any) {
      ToastService.error(
        err?.data.message || "Invalid code. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!phone || resendCountdown > 0) return;
    setLoading(true);
    setServerError(null);
    try {
      await ProductService.fetchOtp({ phone });

      setResendCountdown(60);
    } catch (err: any) {
      ToastService.error(err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({ phone: "", code: "" });
    setServerError(null);
    setStep("send");
    setIsModalOpen(false);
  };

  return (
    <form onSubmit={handleSubmit(step === "send" ? onSendOtp : onVerifyOtp)}>
      <ContentModal
        isOpen={isModalOpen}
        onClose={handleClose}
        width="w-full md:w-3/4"
        maxWidth="max-w-[480px]"
        className="ld:mx-0 mx-3 lg:!mt-48 my-auto"
      >
        <ContentModal.Header className="flex items-center justify-between !border-none !pb-0 !pt-4">
          {step === "verify" ? (
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => setStep("send")}
            >
              <ArrowLeft size={16} />
              Edit phone
            </button>
          ) : (
            <span />
          )}

          <Icon
            name={"close"}
            onClick={handleClose}
            className="text-gray-400 cursor-pointer"
          />
        </ContentModal.Header>

        <ContentModal.Body className="!px-6 !pt-0">
          <div className="pb-8">
            <div className="flex items-center justify-center">
              <Icon
                name={step === "send" ? "person" : "verified_user"}
                variant="outlined"
                size={38}
                className="text-white premium-gradient-gold w-14 h-14 p-2.5 rounded-full"
              />
            </div>

            <h3 className="font-bold text-center text-2xl pt-4 font-inter">
              {step === "send" ? "Welcome Back" : "Verify OTP"}
            </h3>

            <h3 className="font-semibold text-center text-lg py-3 text-gray-500">
              {step === "send"
                ? "Sign in with your phone number"
                : `Enter the 4-digit code sent to ${phone}`}
            </h3>

            {serverError && (
              <p className="text-center text-primary text-sm mb-3">
                {serverError}
              </p>
            )}

            <div>
              <Input
                label="Phone Number"
                placeholder="01XXXXXXXXX"
                registerProperty={register("phone")}
                errorText={errors?.phone?.message}
                type="text"
                isRequired
                classNames={step === "send" ? "mb-4" : "mb-2"}
                inputClass="!py-2.5 !ps-12"
                iconLeft={
                  <Icon
                    name={"call"}
                    variant="outlined"
                    size={26}
                    className="text-gray-500 mt-6.5"
                  />
                }
                isDisabled={step === "verify"}
              />

              {step === "verify" && (
                <>
                  <Input
                    label="OTP Code"
                    placeholder="Enter 4-digit code"
                    registerProperty={register("code")}
                    errorText={errors?.code?.message}
                    type="number"
                    classNames="mb-3"
                    maxLength={6}
                  />

                  <div className="flex items-center justify-between mb-2">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCountdown > 0 || loading}
                      className={`text-sm ${
                        resendCountdown > 0 || loading
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-primary hover:underline font-bold cursor-pointer"
                      }`}
                    >
                      {resendCountdown > 0
                        ? `Resend in ${resendCountdown}s`
                        : "Resend code"}
                    </button>

                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock size={16} />
                      <span>Code expires in 5 mins</span>
                    </div>
                  </div>
                </>
              )}

              <Button
                className="!premium-cta w-full !rounded-lg mt-3 cursor-pointer !flex items-center justify-center gap-4 disabled:opacity-60"
                type="submit"
                disabled={
                  loading || (step === "verify" && (!code || code.length < 4))
                }
              >
                {step === "send" ? (
                  <>
                    Login With OTP
                    <ArrowRight size={18} className="text-white" />
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight size={18} className="text-white" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </ContentModal.Body>
      </ContentModal>
    </form>
  );
};

export default SignUpModal;
