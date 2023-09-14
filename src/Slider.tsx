import { createUniqueId, Component } from "solid-js";

interface Props {
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

  return (
    <div>
      <label class="block" for={rangeId} id={labelId}>
        {props.label}
      </label>
      <div class="flex">
        <input
          class="block"
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
    </div>
  );
};

export default Slider;