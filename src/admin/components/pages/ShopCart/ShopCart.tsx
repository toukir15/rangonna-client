"use client";
import Icon from "@admin/components/core/Icon/Icon";

const ShopCart = ({ data }: any) => {
  return (
    <div className="admin-metric-card h-full">
      <div className="flex h-full items-center gap-3 p-3.5 md:p-4">
        <div className="admin-metric-icon shrink-0">
          <Icon
            name={data?.icon}
            className="dashboard-theme-accent"
            size="22px"
            variant="outlined"
          />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-[11px] font-semibold uppercase tracking-[0.08em] text-app-muted">
            {data?.label}
          </h3>
          <div className="mt-1 flex items-baseline gap-1.5">
            <h4 className="text-[22px] font-bold tracking-tight text-app">
              {data?.value}
            </h4>
            {data?.percentage && (
              <h4 className="dashboard-theme-accent text-xs font-semibold">
                {data?.percentage}
              </h4>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopCart;
