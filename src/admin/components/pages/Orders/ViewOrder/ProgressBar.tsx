import React from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tooltip } from "react-tooltip";

const ProgressBars = ({ totalParcel, totalDelivery, isOption = true, fraudSummary }: any) => {
  const returned: any = fraudSummary?.total_return
  const deliveryPercent = Number(fraudSummary?.avg_success_rate?.replace('%', '')) || 0;
  // const returnPercent = fraudSummary?.total_parcel - fraudSummary?.total_delivery || 0
  const returnPercent = fraudSummary?.total_parcel
    ? Math.round(((fraudSummary.total_parcel - fraudSummary.total_delivery) / fraudSummary.total_parcel) * 100)
    : 0;
  const displayText = fraudSummary?.total_delivery > 1000 ? "1000+" : fraudSummary?.total_delivery || 0;
  const tooltipId = "delivery-tooltip";
  const totalParcelext = fraudSummary?.total_parcel > 1000 ? "1000+" : fraudSummary?.total_parcel || 0;
  const totaltooltipId = "total-tooltip";
  const totalReturnext = fraudSummary?.total_return > 1000 ? "1000+" : fraudSummary?.total_return || 0;
  const totalReturntooltipId = "return-tooltip";




  return (
    <div className="flex justify-center gap-5">
      {isOption && (
        <div className="text-center">
          <div style={{ width: 50, height: 50 }}>
            {" "}

            <div>
              <div className="cursor-pointer">
                <CircularProgressbar
                  value={Number(deliveryPercent.toFixed(0))}
                  text={`${Number(deliveryPercent.toFixed(0))}%`}
                  styles={buildStyles({
                    pathColor:
                      Number(deliveryPercent.toFixed(0)) >= 60
                        ? "#10b981"
                        : "#ef4444",
                    textColor:
                      deliveryPercent >= 60
                        ? "#10b981"
                        : deliveryPercent > 0
                          ? "#ef4444"
                          : totalParcel === 0 && totalDelivery === 0
                            ? "#A020F0"
                            : "#ef4444",

                    trailColor:
                      deliveryPercent >= 60
                        ? "#e5e7eb"
                        : deliveryPercent > 0
                          ? "#ef4444"
                          : totalParcel === 0 && totalDelivery === 0
                            ? "#A020F0"
                            : "#ef4444",

                    textSize: "26px",
                  })}
                />
              </div>
            </div>
          </div>
          <span
            className={`text-sm mt-2 block font-semibold ${deliveryPercent >= 60
              ? "text-[#10b981]"
              : deliveryPercent > 0
                ? "text-[#ef4444]"
                : totalParcel === 0 && totalDelivery === 0
                  ? "text-[#A020F0]"
                  : "text-[#ef4444]"
              }`}
          >
            Ratio
          </span>
        </div>
      )}

      <div className="text-center">
        <div style={{ width: 50, height: 50 }}>
          <div>
            <div
              className="cursor-pointer"
              data-tooltip-id={totaltooltipId}
              data-tooltip-content={totalParcel > 1000 ? totalParcel : ""}
            >
              <CircularProgressbar
                value={100}
                text={`${totalParcelext}`}
                styles={buildStyles({
                  pathColor: "#3b82f6",
                  textColor: "#3b82f6",
                  trailColor: "#e5e7eb",
                  textSize: "26px",
                })}
              />
            </div>
            <Tooltip id={totaltooltipId} />
          </div>
        </div>
        <span className="text-sm  mt-2 block font-semibold text-[#3b82f6]">
          Total
        </span>
      </div>

      <div className="">
        <div
          style={{ width: 50, height: 50 }}
          className="flex items-center justify-center"
        >
          <div>
            <div
              className="cursor-pointer"
              data-tooltip-id={tooltipId}
              data-tooltip-content={totalDelivery > 1000 ? totalDelivery : ""}
            >
              <CircularProgressbar
                value={deliveryPercent}
                text={`${displayText}`}
                styles={buildStyles({
                  pathColor: "#10b981",
                  textColor: "#10b981",
                  trailColor: "#e5e7eb",
                  textSize: "26px",
                })}
              />
            </div>
            <Tooltip id={tooltipId} />
          </div>
        </div>
        <p className="text-sm mt-2 block font-semibold text-[#10b981] -ml-2.5">
          Delivered
        </p>
      </div>

      {isOption && (
        <div className="">
          <div style={{ width: 50, height: 50 }}>
            <div>
              <div
                className="cursor-pointer"
                data-tooltip-id={totalReturntooltipId}
                data-tooltip-content={returned > 1000 ? returned : ""}
              >
                <CircularProgressbar
                  value={returnPercent}
                  text={`${totalReturnext}`}
                  styles={buildStyles({
                    pathColor: "#ef4444",
                    textColor: "#ef4444",
                    trailColor: "#e5e7eb",
                    textSize: "26px",
                  })}
                />
              </div>
              <Tooltip id={totalReturntooltipId} />
            </div>
          </div>
          <span className="text-sm font-semibold mt-2 block -ml-2 text-[#ef4444]">
            Returned
          </span>
        </div>
      )}
    </div>
  );
};

export default ProgressBars;
