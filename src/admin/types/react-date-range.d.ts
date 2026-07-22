/* eslint-disable no-unused-vars */
declare module "react-date-range" {
  import * as React from "react";

  export interface Range {
    startDate: Date;
    endDate: Date;
    key?: string;
  }

  export interface RangeKeyDict {
    [key: string]: Range;
  }

  export interface DateRangeProps {
    ranges: Range[];
    onChange: (ranges: RangeKeyDict) => void;
    months?: number;
    direction?: "horizontal" | "vertical";
    preventSnapRefocus?: boolean;
    initialFocusedRange?: [number, number];
    minDate?: Date;
    maxDate?: Date;
    className?: string;
  }

  export class DateRange extends React.Component<DateRangeProps> {}
}
