import Image from "next/image";
import noDataFound from "@admin/assets/images/noDataFound.png";

const NoDataFoundTable: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      <Image src={noDataFound} alt={"no data found"} />
      <h2 className="text-2xl md:text-4xl font-bold mb-4">Not Data Found</h2>
    </div>
  );
};

export default NoDataFoundTable;
