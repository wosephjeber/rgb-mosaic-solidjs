import { ParentComponent, JSX } from "solid-js";

interface Props {
  children: JSX.Element;
  onClick: (event: MouseEvent) => void;
  type?: "button" | "submit";
}

const Button: ParentComponent<Props> = ({
  children,
  onClick,
  type = "button",
}) => {
  return (
    <button
      class="text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-md transition-colors px-4 py-2"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
