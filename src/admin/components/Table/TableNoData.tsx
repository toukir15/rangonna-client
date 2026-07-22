import Image from "next/image";
import noDataFound from "@admin/assets/images/noDataFound.png";
import Icon from "@admin/components/core/Icon/Icon";
type TableNoDataProps = {
  isSwitch: boolean | any;
};

const TableNoData: React.FC<TableNoDataProps> = ({ isSwitch }) => {
  return (
    <div className="flex flex-col items-center w-full justify-center min-h-[60vh] bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200">
      {!isSwitch ? (
        <>
          <Icon name="wifi_off" size={150} className="text-gray-400" />
          <h2 className="text-2xl md:text-2xl font-bold mb-4 mt-2 text-gray-400">
            Your Status is Offline
          </h2>
          <p className="text-lg font-semibold font-poppins text-gray-400">
            Please Check Your Current Status
          </p>
        </>
      ) : (
        <>
          <Image src={noDataFound} alt={"no data found"} />
          <h2 className="text-2xl md:text-2xl font-bold mb-4 mt-2">
            No Data Found
          </h2>
        </>
      )}
    </div>
  );
};
export default TableNoData;
