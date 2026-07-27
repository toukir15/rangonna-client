import Icon from "@admin/components/core/Icon/Icon";

type TableNoDataProps = {
  isSwitch: boolean | any;
};

const TableNoData: React.FC<TableNoDataProps> = ({ isSwitch }) => {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center px-6 py-6 text-center">
      {!isSwitch ? (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Icon name="wifi_off" size={32} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Your status is offline
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            Please check your current status to view table data.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/40">
            <Icon
              name="inventory_2"
              size={32}
              className="text-green-600/70 dark:text-green-400/80"
            />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            No data found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500 dark:text-gray-400">
            There are no records to display for the current filters.
          </p>
        </>
      )}
    </div>
  );
};

export default TableNoData;
