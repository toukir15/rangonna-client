import { FC, useEffect } from "react";
import topbar from "topbar";

interface ITop {
  hide: () => void;
  show: () => void;
}

const config = {
  barColors: {
    "0": "#e8f5e9",
    "1": "#2e7d32",
  },
  barThickness: 2,
  shadowBlur: 5,
};

topbar.config(config);
const topProgress: ITop = topbar;

const TopProgressCom: FC = () => {
  useEffect(() => {
    topProgress.show();
    return () => topProgress.hide();
  }, []);

  return <></>;
};

export { TopProgressCom, topProgress };
