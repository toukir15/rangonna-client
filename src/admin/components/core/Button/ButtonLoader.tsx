interface IPreloaderProps {
  size?: number;
  color?: string;
  frontColor?: string;
  backColor?: string;
  absolutePosition?: boolean;
  className?: string;
}

const ButtonLoader = ({
  absolutePosition = false,
  className,
}: IPreloaderProps) => (
  <div
    className={`flex items-center justify-center ${className || ""}`}
    style={absolutePosition ? { position: "relative" } : {}}
  >
    <div
      style={
        absolutePosition ? { position: "absolute", zIndex: 1, top: 0 } : {}
      }
    >
      <div className="lds-ellipsis">
        <div />
        <div />
        <div />
        <div />
      </div>
    </div>
  </div>
);

export default ButtonLoader;
