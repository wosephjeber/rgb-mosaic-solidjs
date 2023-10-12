import { ParentComponent, JSX } from "solid-js";

import styles from "./FloatingContainer.module.css";

type BgColor = "white" | "black";

interface Props {
  children: JSX.Element;
  class?: string;
  bg?: BgColor;
}

const COLORS: Record<BgColor, string> = {
  white: "bg-white",
  black: "bg-black",
};

const FloatingContainer: ParentComponent<Props> = (props) => {
  return (
    <div
      class={`${COLORS[props.bg || "white"]} text-gray-800 rounded-md ${
        styles["floating-container"]
      } ${props.class}`}
    >
      {props.children}
    </div>
  );
};

export default FloatingContainer;
