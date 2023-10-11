import { createUniqueId, Component } from "solid-js";

import styles from "./Slider.module.css";

interface Props {
  icon?: Component;
  label: string;
  max?: string;
  min?: string;
  onInput: (event: InputEvent) => void;
  step?: string;
  value: string | number;
}

const Slider: Component<Props> = (props) => {
  const labelId = createUniqueId();
  const rangeId = createUniqueId();

  const Icon = props.icon;

  return (
    <>
      <div class="flex items-center space-x-2">
        {Icon && <Icon />}
        <label class="block text-sm font-bold" for={rangeId} id={labelId}>
          {props.label}
        </label>
      </div>
      <div class="flex">
        <input
          class={styles.slider}
          type="range"
          id={rangeId}
          name="fontsize"
          min={props.min}
          max={props.max}
          step={props.step}
          onInput={props.onInput}
          value={props.value}
        />
        <input
          aria-labeledby={labelId}
          class="ml-2 w-12"
          type="number"
          min={props.min}
          max={props.max}
          step={props.step}
          value={props.value}
          onInput={props.onInput}
        />
      </div>
    </>
  );
};

export default Slider;
