import { ParentComponent, JSX } from "solid-js";

import styles from "./FloatingContainer.module.css";

interface Props {
  children: JSX.Element;
  class?: string;
}

const FloatingContainer: ParentComponent<Props> = (props) => {
  return (
    <div
      class={`bg-white text-gray-800 rounded-md ${styles["floating-container"]} ${props.class}`}
    >
      {props.children}
    </div>
  );
};

export default FloatingContainer;
