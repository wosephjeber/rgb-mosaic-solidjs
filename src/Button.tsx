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
      class="text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-md transition-colors px-4 py-2"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
