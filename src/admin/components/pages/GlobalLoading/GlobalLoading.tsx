import Image from "next/image";
import routLogo from "@admin/assets/logo/naviforceRound.png";

const GlobalLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-[92vh]  relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <Image
          src={routLogo}
          alt={
            "Rounded logo of Naviforce representing its brand identity in the eCommerce industry."
          }
          width={80}
          height={80}
        />
      </div>
      <div className="animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-gray-900 dark:border-white"></div>
    </div>
  );
};

export default GlobalLoading;
