"use client";
import Button from "@admin/components/core/Button/Button";
import Image from "next/image";
import { useEffect, useState } from "react";
import cloud from "@admin/assets/images/cloud.png";
import Icon from "@admin/components/core/Icon/Icon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthService } from "@admin/@services/apis/AuthService/Auth.service";
import { ToastService } from "@admin/utils/toastr.service";
import { useGlobalContext } from "@admin/context/GlobalContext";
import ButtonLoader from "@admin/components/core/Button/ButtonLoader";
import Cookies from "js-cookie";

const Page: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const router = useRouter();
  const { setToken } = useGlobalContext();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [resend, setIsResend] = useState<boolean>(false);

  const [userData, setUserData] = useState({
    email: "",
    phone: "",
    valid_until: "",
  });

  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const storedData = localStorage.getItem("signData");

    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserData({
        email: parsedData.email,
        phone: parsedData.phone,
        valid_until: parsedData.valid_until,
      });

      // Initialize timer based on valid_until
      const expiryTimestamp = new Date(parsedData.valid_until).getTime();
      const currentTimestamp = new Date().getTime();

      const secondsLeft = Math.max(
        Math.floor((expiryTimestamp - currentTimestamp) / 1000),
        0
      );

      setTimeLeft(secondsLeft);
    }
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [timeLeft]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value;
    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);
    if (value && index < otp.length - 1) {
      const nextInput = document.getElementById(
        `otp-input-${index + 1}`
      ) as HTMLInputElement;
      nextInput?.focus();
    }
  };

  const handleBackspace = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && otp[index] === "") {
      const prevInput = document.getElementById(
        `otp-input-${index - 1}`
      ) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  const handleSubmit = () => {
    setIsSubmit(true);
    const code: any = otp.join("");
    AuthService.verify_otp({ code })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          localStorage.setItem("authInfo", JSON.stringify(res.data));
          Cookies.set("authToken", JSON.stringify(res.data.accessToken), {
            expires: 7,
            secure: true,
            sameSite: "Strict",
          });
          setToken(res.data);
          router.push("/admin/welcome");
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsSubmit(false);
      });
  };

  const isOtpComplete = otp.every((value) => value !== "");

  const handleResend = () => {
    setIsResend(true);

    AuthService.resend_otp({ email: userData.email, phone: userData.phone })
      .then((res: any) => {
        if (res?.success) {
          ToastService.success(res?.message);
          const newValidUntil = res?.data?.valid_until;
          setUserData((prev) => ({
            ...prev,
            valid_until: newValidUntil,
          }));
          const expiryTimestamp = new Date(newValidUntil).getTime();
          const currentTimestamp = new Date().getTime();

          const secondsLeft = Math.max(
            Math.floor((expiryTimestamp - currentTimestamp) / 1000),
            0
          );

          setTimeLeft(secondsLeft);
        } else {
          ToastService.error(res?.message);
        }
      })
      .catch((err: any) => {
        ToastService.error(err.message);
      })
      .finally(() => {
        setIsResend(false);
      });
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <Image className="h-20 w-auto" src={cloud} alt={""} />
          <Link href="/admin/signup">
            <Icon
              name={"keyboard_backspace"}
              variant="outlined"
              className="mt-2 text-gray-400"
            />
          </Link>
        </div>
        <h4 className="text-xl font-semibold mt-4">Verify OTP</h4>
        <h6 className="text-sm my-3">An OTP has been sent to your email</h6>
        <h6 className="text-xs font-semibold">Enter OTP</h6>
        <div className="mt-1 flex justify-center">
          {otp.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              value={value}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              className="w-14 h-14 mx-1 text-center border rounded focus:ring-1 focus:ring-blue-400 focus:outline-none"
              placeholder="0"
            />
          ))}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>Time left: {formatTime(timeLeft)}</div>

          {timeLeft === 0 && (
            <div
              className={`flex items-center justify-end gap-2 ${
                resend ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!resend) {
                  handleResend();
                }
              }}
            >
              <p className="text-base text-blue-500">
                {resend ? "Resending" : "Resend"}
              </p>
              <Icon name="arrow_forward" size={20} className="text-blue-500" />
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Button
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded w-full"
            disabled={!isOtpComplete}
          >
            {isSubmit ? <ButtonLoader /> : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
