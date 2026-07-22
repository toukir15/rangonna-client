declare module "react-collapse" {
  import * as React from "react";
  export interface CollapseProps {
    isOpened: boolean;
    children?: React.ReactNode;
    theme?: { collapse?: string; content?: string };
    initialStyle?: React.CSSProperties;
    hasNestedCollapse?: boolean;
    fixedHeight?: number;
    fixedHeightDuringExpansion?: number;
    keepCollapsedContent?: boolean;
    springConfig?: { stiffness: number; damping: number };
    forceInitialAnimation?: boolean;
    onRest?: () => void;
    onWork?: () => void;
  }
  export class Collapse extends React.Component<CollapseProps> {}
  export const UnmountClosed: React.ComponentType<CollapseProps>;
}
