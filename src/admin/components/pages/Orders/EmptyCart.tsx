import Image from "next/image";
import noDataFound from "@admin/assets/images/noDataFound.png";

const EmptyCart: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-6">
      <Image src={noDataFound} alt={"no data found"} />
      <h2 className="text-xl font-bold mb-4 mt-4 text-red-600">
        No items in your cart yet
      </h2>
    </div>
  );
};

export default EmptyCart;
