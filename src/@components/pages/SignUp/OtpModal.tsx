import React, { useEffect, useMemo, useRef, useState } from "react";
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
interface PurchasesModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
  phoneNumber: string;
  order_id: string;
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

const OtpModal: React.FC<PurchasesModalProps> = ({
  isModalOpen,
  setIsModalOpen,
  phoneNumber,
  order_id,
}) => {
  const router = useRouter();

  const [step, setStep] = useState<"send" | "verify">(
    phoneNumber ? "verify" : "send"
  );
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [serverError, setServerError] = useState<string | null>(null);

  const RESEND_SECONDS = 60;
  const OTP_EXPIRE_SECONDS = 300;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}s`;
  };

  const resolver = useMemo(
    () => yupResolver(step === "send" ? schemaSend : schemaVerify),
    [step]
  );

  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver,
    defaultValues: { phone: phoneNumber || "", code: "" },
  });

  const phone = watch("phone");
  const code = watch("code");

  useEffect(() => {
    if (resendCountdown <= 0 && otpExpiresIn <= 0) return;
    const id = setInterval(() => {
      setResendCountdown((s) => (s > 0 ? s - 1 : 0));
      setOtpExpiresIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [resendCountdown, otpExpiresIn]);

  useEffect(() => {
    if (!isModalOpen) return;

    if (phoneNumber) {
      setStep("verify");
      setValue("phone", phoneNumber, { shouldValidate: true });
      setServerError(null);

      if (resendCountdown <= 0) {
        (async () => {
          try {
            setLoading(true);
            await ProductService.fetchOrderOtp({ phone: phoneNumber });
            setResendCountdown(RESEND_SECONDS);
            setOtpExpiresIn(OTP_EXPIRE_SECONDS);
          } catch (err: any) {
            ToastService.error(
              err?.message || "Failed to send OTP. Please try again."
            );
          } finally {
            setLoading(false);
          }
        })();
      }
    } else {
      setStep("send");
      reset({ phone: "", code: "" });
      setServerError(null);
      setResendCountdown(0);
      setOtpExpiresIn(0);
    }
  }, [isModalOpen, phoneNumber]);

  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!isModalOpen || step !== "verify") return;
    if (typeof window === "undefined") return;
    const supportsWebOTP = "OTPCredential" in window && window.isSecureContext;

    if (!supportsWebOTP) return;

    const ac = new AbortController();
    abortRef.current = ac;

    (async () => {
      try {
        const result = await navigator.credentials.get({
          otp: { transport: ["sms"] },
          signal: ac.signal,
        } as any);
        // @ts-ignore
        const receivedCode = result?.code as string | undefined;
        if (receivedCode) {
          setValue("code", receivedCode, { shouldValidate: true });
          setTimeout(() => {
            handleSubmit(onVerifyOtp)();
          }, 0);
        }
      } catch {}
    })();

    return () => {
      ac.abort();
      abortRef.current = null;
    };
  }, [isModalOpen, step]);

  const onSendOtp = async (data: FormValues) => {
    setLoading(true);
    setServerError(null);
    try {
      await ProductService.fetchOrderOtp({ phone: data.phone });
      setStep("verify");
      setResendCountdown(RESEND_SECONDS);
      setOtpExpiresIn(OTP_EXPIRE_SECONDS);
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
      await ProductService.verifyOrderOtp({
        phone: data.phone,
        code: data.code,
        order_id,
      });
      setIsModalOpen(false);
      router.refresh();
      router.push("/checkout/received-order");
      setStep("send");
      reset();
      setResendCountdown(0);
      setOtpExpiresIn(0);

      abortRef.current?.abort();
    } catch (err: any) {
      ToastService.error(
        err?.data?.message || "Invalid code. Please try again."
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
      await ProductService.fetchOrderOtp({ phone });
      setResendCountdown(RESEND_SECONDS);
      setOtpExpiresIn(OTP_EXPIRE_SECONDS);
    } catch (err: any) {
      ToastService.error(err?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset({ phone: phoneNumber || "", code: "" });
    setServerError(null);
    setStep(phoneNumber ? "verify" : "send");
    setIsModalOpen(false);
    abortRef.current?.abort();
  };

  const isVerifyMode = step === "verify";
  const otpExpired = otpExpiresIn === 0 && isVerifyMode;

  return (
    <form onSubmit={handleSubmit(isVerifyMode ? onVerifyOtp : onSendOtp)}>
      <ContentModal
        isOpen={isModalOpen}
        onClose={handleClose}
        width="w-full md:w-3/4"
        maxWidth="max-w-[480px]"
        className="ld:mx-0 mx-3 lg:!mt-48 my-auto"
      >
        <ContentModal.Header className="flex items-center justify-between !border-none !pb-0 !pt-4">
          {isVerifyMode && !phoneNumber ? (
            <button
              type="button"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
              onClick={() => {
                setStep("send");
                reset({ phone: "", code: "" });
                setServerError(null);
                setResendCountdown(0);
                setOtpExpiresIn(0);
                abortRef.current?.abort();
              }}
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
                name={isVerifyMode ? "verified_user" : "call"}
                variant="outlined"
                size={38}
                className={`text-white  w-14 h-14 p-2.5 rounded-full ${
                  isVerifyMode ? "bg-green-600" : "premium-cta"
                }`}
              />
            </div>

            <h3 className="font-bold text-center text-2xl pt-4 font-inter">
              {isVerifyMode ? "Verify OTP" : "Welcome Back"}
            </h3>

            <h3 className="font-semibold text-center text-lg py-3 text-gray-500">
              {isVerifyMode
                ? `ওটিপি দিন, আর মুহূর্তেই কনফার্ম করুন আপনার অর্ডার।`
                : "Sign in with your phone number"}
            </h3>

            {serverError && (
              <p className="text-center text-primary text-sm mb-3">
                {serverError}
              </p>
            )}

            <div>
              {/* <Input
                label="Phone Number"
                placeholder="01XXXXXXXXX"
                registerProperty={register("phone")}
                errorText={errors?.phone?.message}
                type="text"
                isRequired
                classNames={isVerifyMode ? "mb-2" : "mb-4"}
                inputClass="!py-2.5 !ps-12"
                iconLeft={
                  <Icon
                    name={"call"}
                    variant="outlined"
                    size={26}
                    className="text-gray-500 mt-6.5"
                  />
                }
                // lock phone when verifying; always lock if phoneNumber prop exists
                isDisabled={isVerifyMode || !!phoneNumber}
              /> */}

              {isVerifyMode && (
                <>
                  <Input
                    label="OTP Code"
                    placeholder="Enter 4-digit code"
                    registerProperty={register("code")}
                    errorText={errors?.code?.message}
                    type="number"
                    autoComplete="one-time-code"
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
                        ? `Resend in ${formatTime(resendCountdown)}`
                        : "Resend code"}
                    </button>

                    <div className="flex items-center gap-1 text-gray-500 text-sm">
                      <Clock size={16} />
                      {otpExpired ? (
                        <span className="text-primary">Code expired</span>
                      ) : (
                        <span>Code expires in 5 min</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <Button
                className="!premium-cta w-full !rounded-lg mt-3 cursor-pointer !flex items-center justify-center gap-4 disabled:opacity-60"
                type="submit"
                disabled={
                  loading || (isVerifyMode && (!code || code.length < 4))
                }
              >
                {isVerifyMode ? (
                  <>
                    Verify OTP
                    <ArrowRight size={18} className="text-white" />
                  </>
                ) : (
                  <>
                    Verify OTP
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

export default OtpModal;
