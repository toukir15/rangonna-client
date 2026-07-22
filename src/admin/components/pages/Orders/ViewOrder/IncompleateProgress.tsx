import React, { useId, useMemo } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { Tooltip } from "react-tooltip";

type FraudSummary = {
    total_parcel?: number;
    total_delivery?: number;
    total_return?: number;
    avg_success_rate?: string;
};

type ProgressBarsProps = {
    totalParcel?: number;
    totalDelivery?: number;
    isOption?: boolean;
    fraudSummary?: FraudSummary;
};

const IncompleateProgress: React.FC<ProgressBarsProps> = ({
    totalParcel = 0,
    totalDelivery = 0,
    isOption = true,
    fraudSummary,
}) => {
    const uniqueId = useId();

    const summaryTotalParcel = Number(fraudSummary?.total_parcel) || totalParcel || 0;
    const summaryTotalDelivery =
        Number(fraudSummary?.total_delivery) || totalDelivery || 0;
    const summaryTotalReturn = Number(fraudSummary?.total_return) || 0;

    const deliveryPercent = useMemo(() => {
        if (fraudSummary?.avg_success_rate) {
            return Number(fraudSummary.avg_success_rate.replace("%", "")) || 0;
        }

        if (!summaryTotalParcel) return 0;

        return Math.round((summaryTotalDelivery / summaryTotalParcel) * 100);
    }, [fraudSummary?.avg_success_rate, summaryTotalParcel, summaryTotalDelivery]);

    const returnPercent = useMemo(() => {
        if (!summaryTotalParcel) return 0;
        return Math.round((summaryTotalReturn / summaryTotalParcel) * 100);
    }, [summaryTotalParcel, summaryTotalReturn]);

    const displayDeliveredText =
        summaryTotalDelivery > 1000 ? "1000+" : String(summaryTotalDelivery);

    const displayTotalText =
        summaryTotalParcel > 1000 ? "1000+" : String(summaryTotalParcel);

    const displayReturnText =
        summaryTotalReturn > 1000 ? "1000+" : String(summaryTotalReturn);

    const ratioColor =
        deliveryPercent >= 60
            ? "#10b981"
            : deliveryPercent > 0
                ? "#ef4444"
                : summaryTotalParcel === 0 && summaryTotalDelivery === 0
                    ? "#A020F0"
                    : "#ef4444";

    const totalTooltipId = `total-tooltip-${uniqueId}`;
    const deliveredTooltipId = `delivered-tooltip-${uniqueId}`;
    const returnTooltipId = `return-tooltip-${uniqueId}`;

    return (
        <div className="flex justify-center gap-5">
            {isOption && (
                <div className="text-center">
                    <div style={{ width: 50, height: 50 }}>
                        <div className="cursor-pointer">
                            <CircularProgressbar
                                value={Number(deliveryPercent.toFixed(0))}
                                text={`${Number(deliveryPercent.toFixed(0))}%`}
                                styles={buildStyles({
                                    pathColor: ratioColor,
                                    textColor: ratioColor,
                                    trailColor:
                                        summaryTotalParcel === 0 && summaryTotalDelivery === 0
                                            ? "#e5e7eb"
                                            : "#e5e7eb",
                                    textSize: "26px",
                                })}
                            />
                        </div>
                    </div>

                    <span
                        className={`text-sm mt-2 block font-semibold ${deliveryPercent >= 60
                            ? "text-[#10b981]"
                            : deliveryPercent > 0
                                ? "text-[#ef4444]"
                                : summaryTotalParcel === 0 && summaryTotalDelivery === 0
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
                    <div
                        className="cursor-pointer"
                        data-tooltip-id={totalTooltipId}
                        data-tooltip-content={summaryTotalParcel > 1000 ? summaryTotalParcel : ""}
                    >
                        <CircularProgressbar
                            value={100}
                            text={displayTotalText}
                            styles={buildStyles({
                                pathColor: "#3b82f6",
                                textColor: "#3b82f6",
                                trailColor: "#e5e7eb",
                                textSize: "26px",
                            })}
                        />
                    </div>
                    <Tooltip id={totalTooltipId} />
                </div>

                <span className="text-sm mt-2 block font-semibold text-[#3b82f6]">
                    Total
                </span>
            </div>

            <div className="text-center">
                <div
                    style={{ width: 50, height: 50 }}
                    className="flex items-center justify-center"
                >
                    <div
                        className="cursor-pointer"
                        data-tooltip-id={deliveredTooltipId}
                        data-tooltip-content={
                            summaryTotalDelivery > 1000 ? summaryTotalDelivery : ""
                        }
                    >
                        <CircularProgressbar
                            value={Number(deliveryPercent.toFixed(0))}
                            text={displayDeliveredText}
                            styles={buildStyles({
                                pathColor: "#10b981",
                                textColor: "#10b981",
                                trailColor: "#e5e7eb",
                                textSize: "26px",
                            })}
                        />
                    </div>
                    <Tooltip id={deliveredTooltipId} />
                </div>

                <p className="text-sm mt-2 block font-semibold text-[#10b981]">
                    Delivered
                </p>
            </div>

            {isOption && (
                <div className="text-center">
                    <div style={{ width: 50, height: 50 }}>
                        <div
                            className="cursor-pointer"
                            data-tooltip-id={returnTooltipId}
                            data-tooltip-content={summaryTotalReturn > 1000 ? summaryTotalReturn : ""}
                        >
                            <CircularProgressbar
                                value={returnPercent}
                                text={displayReturnText}
                                styles={buildStyles({
                                    pathColor: "#ef4444",
                                    textColor: "#ef4444",
                                    trailColor: "#e5e7eb",
                                    textSize: "26px",
                                })}
                            />
                        </div>
                        <Tooltip id={returnTooltipId} />
                    </div>

                    <span className="text-sm font-semibold mt-2 block text-[#ef4444]">
                        Returned
                    </span>
                </div>
            )}
        </div>
    );
};

export default IncompleateProgress;