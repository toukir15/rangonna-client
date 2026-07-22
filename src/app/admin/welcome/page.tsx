"use client";
import Button from "@admin/components/core/Button/Button";
import { useRouter } from "next/navigation";
import React from "react";

const Page: React.FC = () => {
  const router = useRouter();
  return (
    <div className="h-screen flex mx-auto justify-center pt-20">
      <div className="items-center bg-white h-52 p-10 w-[1000px] rounded-lg">
        <h3 className="text-center text-2xl font-bold ">
          Welcome to eCom Intelligence
        </h3>
        <p className="my-2 text-lg text-center">
          Click the button below to start setting up your ecommerce website.
        </p>
        <div className="flex justify-center">
          <Button
            className="text-center bg-blue-600"
            onClick={() => router.push("/admin/welcome/create-shop")}
          >
            Create Your Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
