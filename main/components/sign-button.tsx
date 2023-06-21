import { Image } from "antd";

type SignButtonProps = {
  src: string;
  height?: number;
  width?: number;
  onSignClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
};
const SignButton = (props: SignButtonProps) => {
  const {
    height = 100,
    width = 100,
    src,
    onSignClick,
    selected = false,
    disabled = false,
  } = props;
  return (
    <div
      className={`sign-btn-container ${selected ? "selected" : ""} ${
        disabled ? "disabled" : ""
      }`}
      onClick={onSignClick}
    >
      <Image height={height} width={width} src={src} preview={false} />
    </div>
  );
};
export default SignButton;
