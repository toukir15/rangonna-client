import Icon from "@admin/components/core/Icon/Icon";

type TableNoDataProps = {
  isSwitch: boolean | any;
};

const TableNoData: React.FC<TableNoDataProps> = ({ isSwitch }) => {
  return (
    <div className="flex w-full max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      {!isSwitch ? (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-icon)]">
            <Icon name="wifi_off" size={28} className="text-app-muted" />
          </div>
          <h2 className="text-base font-semibold text-app">
            Your status is offline
          </h2>
          <p className="mt-1 max-w-sm text-sm text-app-muted">
            Please check your current status to view table data.
          </p>
        </>
      ) : (
        <>
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)]">
            <Icon
              name="inventory_2"
              size={28}
              className="text-[var(--accent)]"
            />
          </div>
          <h2 className="text-base font-semibold text-app">No data found</h2>
          <p className="mt-1 max-w-sm text-sm text-app-muted">
            There are no records to display for the current filters.
          </p>
        </>
      )}
    </div>
  );
};

export default TableNoData;
