"use client";
import Banner from "@/@components/Landing/Banner";
import { Benefits } from "@/@components/Landing/Benefits";
import Checkout from "@/@components/Landing/Checkout";
import PricePool from "@/@components/Landing/PricePool";
import Reviews from "@/@components/Landing/Reviews";
import VideoStream from "@/@components/Landing/VideoStream";
import { ProductService } from "@/@services/apis/Product/Product.service";
import { ToastService } from "@/utils/toaster.service";
import { useParams } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function Home() {
  const { oId } = useParams();
  const [landingData, setLandingData] = useState<any>(null);

  useEffect(() => {
    const fetchLanding = () => {
      // setTableLoading(true);
      if (!oId) return;
      ProductService.getSingleLanding(oId)
        .then((res: any) => {
          if (res?.success) {
            setLandingData(res?.data);
          } else {
            ToastService.error(res?.message);
          }
        })
        .catch((err: { message: string }) => {
          ToastService.error(err.message);
        })
        .finally(() => {
          // setTableLoading(false);
        });
    };
    fetchLanding();
  }, [oId]);

  return (
    <div>
      <Banner landingData={landingData} />
      <VideoStream landingData={landingData} />
      <Reviews landingData={landingData} />
      <PricePool landingData={landingData} />
      <Benefits landingData={landingData} />
      <div id="checkout" className="">
        <Checkout landingData={landingData} />
      </div>
    </div>
  );
}
