import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tooltip } from "react-tooltip";

const readCssVar = (name: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
};

const ProgressBars = ({
  totalParcel,
  totalDelivery,
  isOption = true,
  fraudSummary,
}: any) => {
  const returned: any = fraudSummary?.total_return;
  const deliveryPercent =
    Number(fraudSummary?.avg_success_rate?.replace("%", "")) || 0;
  const returnPercent = fraudSummary?.total_parcel
    ? Math.round(
        ((fraudSummary.total_parcel - fraudSummary.total_delivery) /
          fraudSummary.total_parcel) *
          100,
      )
    : 0;
  const displayText =
    fraudSummary?.total_delivery > 1000
      ? "1000+"
      : fraudSummary?.total_delivery || 0;
  const tooltipId = "delivery-tooltip";
  const totalParcelext =
    fraudSummary?.total_parcel > 1000
      ? "1000+"
      : fraudSummary?.total_parcel || 0;
  const totaltooltipId = "total-tooltip";
  const totalReturnext =
    fraudSummary?.total_return > 1000
      ? "1000+"
      : fraudSummary?.total_return || 0;
  const totalReturntooltipId = "return-tooltip";

  const [colors, setColors] = useState({
    primary: "#10b981",
    danger: "#ef4444",
    info: "#3b82f6",
    trail: "#e5e7eb",
  });

  useEffect(() => {
    setColors({
      primary: readCssVar("--color-primary", "#10b981"),
      danger: "#ef4444",
      info: "#3b82f6",
      trail: readCssVar("--border", "#e5e7eb"),
    });
  }, []);

  const ratioGood = Number(deliveryPercent.toFixed(0)) >= 60;
  const ratioColor = ratioGood ? colors.primary : colors.danger;

  return (
    <div className="ov-progress">
      {isOption && (
        <div className="ov-progress__item">
          <div style={{ width: 50, height: 50 }}>
            <div className="cursor-pointer">
              <CircularProgressbar
                value={Number(deliveryPercent.toFixed(0))}
                text={`${Number(deliveryPercent.toFixed(0))}%`}
                styles={buildStyles({
                  pathColor: ratioColor,
                  textColor: ratioColor,
                  trailColor: colors.trail,
                  textSize: "26px",
                })}
              />
            </div>
          </div>
          <span
            className={`ov-progress__label ${
              ratioGood ? "is-good" : "is-bad"
            }`}
          >
            Ratio
          </span>
        </div>
      )}

      <div className="ov-progress__item">
        <div style={{ width: 50, height: 50 }}>
          <div
            className="cursor-pointer"
            data-tooltip-id={totaltooltipId}
            data-tooltip-content={totalParcel > 1000 ? totalParcel : ""}
          >
            <CircularProgressbar
              value={100}
              text={`${totalParcelext}`}
              styles={buildStyles({
                pathColor: colors.info,
                textColor: colors.info,
                trailColor: colors.trail,
                textSize: "26px",
              })}
            />
          </div>
          <Tooltip id={totaltooltipId} />
        </div>
        <span className="ov-progress__label is-total">Total</span>
      </div>

      <div className="ov-progress__item">
        <div
          style={{ width: 50, height: 50 }}
          className="flex items-center justify-center"
        >
          <div
            className="cursor-pointer"
            data-tooltip-id={tooltipId}
            data-tooltip-content={totalDelivery > 1000 ? totalDelivery : ""}
          >
            <CircularProgressbar
              value={deliveryPercent}
              text={`${displayText}`}
              styles={buildStyles({
                pathColor: colors.primary,
                textColor: colors.primary,
                trailColor: colors.trail,
                textSize: "26px",
              })}
            />
          </div>
          <Tooltip id={tooltipId} />
        </div>
        <p className="ov-progress__label is-good">Delivered</p>
      </div>

      {isOption && (
        <div className="ov-progress__item">
          <div style={{ width: 50, height: 50 }}>
            <div
              className="cursor-pointer"
              data-tooltip-id={totalReturntooltipId}
              data-tooltip-content={returned > 1000 ? returned : ""}
            >
              <CircularProgressbar
                value={returnPercent}
                text={`${totalReturnext}`}
                styles={buildStyles({
                  pathColor: colors.danger,
                  textColor: colors.danger,
                  trailColor: colors.trail,
                  textSize: "26px",
                })}
              />
            </div>
            <Tooltip id={totalReturntooltipId} />
          </div>
          <span className="ov-progress__label is-returned">Returned</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBars;
