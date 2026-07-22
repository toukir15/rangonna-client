"use client";
import React from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

const PaymentChart: React.FC<any> = ({
  data,
  height = "300px",
  width = "100%",
  theme = "light",
}) => {
  const dateList = data.map((item: any[]) => item[0]);
  const valueList = data.map((item: any[]) => item[1]);

  const option: echarts.EChartsOption = {
    title: {
      text: "Payment Trend",
      left: "center",
      textStyle: {
        fontSize: 16,
        fontWeight: "normal",
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
      },
      formatter: (params: any) => {
        const date = params[0].axisValue;
        const value = params[0].data;
        return `
          <div style="font-weight: bold">${date}</div>
          <div>Amount: ${value}</div>
        `;
      },
    },
    visualMap: {
      show: false,
      type: "continuous",
      dimension: 0, // Gradient along x-axis
      min: 0,
      max: dateList.length - 1,
      inRange: {
        color: ["#37a2ff", "#67e0e3", "#ffdb5c", "#ff9f7f"],
      },
    },
    xAxis: {
      type: "category",
      data: dateList,
      axisLabel: {
        rotate: 45,
        fontSize: 10,
      },
      axisLine: {
        lineStyle: {
          color: theme === "dark" ? "#6E7079" : "#333",
        },
      },
    },
    yAxis: {
      type: "value",
      name: "Amount",
      axisLine: {
        lineStyle: {
          color: theme === "dark" ? "#6E7079" : "#333",
        },
      },
      splitLine: {
        lineStyle: {
          color: theme === "dark" ? "#2D323D" : "#EEE",
        },
      },
    },
    series: [
      {
        type: "line",
        showSymbol: false,
        data: valueList,
        lineStyle: {
          width: 3,
        },
        emphasis: {
          lineStyle: {
            width: 4,
          },
        },
        areaStyle: {
          opacity: 0.2, // Optional: adds a subtle fill under the line
        },
      },
    ],
  };

  return (
    <div className="relative w-full bg-white rounded-lg p-4 shadow-lg">
      <div>
        <h3 className="text-lg font-bold border-b pb-2">Payment History</h3>
      </div>
      <div className="mt-4 h-[300px]">
        <ReactECharts
          option={option}
          style={{ height, width }}
          theme={theme}
          className="gradient-line-chart"
          opts={{ renderer: "svg" }}
        />
      </div>
    </div>
  );
};

export default PaymentChart;
