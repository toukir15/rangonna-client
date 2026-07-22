"use client"
import Icon from "@admin/components/core/Icon/Icon";
import { useEffect, useState } from "react";

const LiveWatch = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2">
            <Icon name="schedule" />
            <p className="text-lg font-semibold tracking-wide pt-0.5">
                {time.toLocaleTimeString("en-BD", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: true,
                })}
            </p>
            <p className="text-xs opacity-80 pt-0.5 font-bold">
                {time.toLocaleDateString("en-BD", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })}
            </p>
        </div>
    );
};
export default LiveWatch;