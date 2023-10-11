import { ParentComponent } from "solid-js";

interface Props {
  canvasHeight: number;
  canvasWidth: number;
  left: number;
  pixelDimension: number;
  top: number;
  videoHeight: number;
  videoWidth: number;
}

const Inset: ParentComponent<Props> = (props) => {
  function getBounds() {
    const visibleVideoPixelWidth = props.canvasWidth / props.pixelDimension;
    const visibleVideoPixelHeight = props.canvasHeight / props.pixelDimension;

    const bounds = {
      left: props.left / props.videoWidth,
      right: 1 - (props.left + visibleVideoPixelWidth) / props.videoWidth,
      top: props.top / props.videoHeight,
      bottom: 1 - (props.top + visibleVideoPixelHeight) / props.videoHeight,
    };

    return {
      left: `${bounds.left * 100}%`,
      right: `${bounds.right * 100}%`,
      top: `${bounds.top * 100}%`,
      bottom: `${bounds.bottom * 100}%`,
    };
  }

  return (
    <div class="absolute border border-white rounded-md" style={getBounds()} />
  );
};

export default Inset;
