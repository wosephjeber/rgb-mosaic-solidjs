import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import type { Component } from "solid-js";

import { getPixelData } from "./utils/pixels";

import OffscreenCanvasWorker from "./offscreen_canvas_worker?worker";

function getInsetBounds(scrollContainer: HTMLElement) {
  const {
    scrollTop,
    scrollLeft,
    offsetWidth,
    offsetHeight,
    scrollWidth,
    scrollHeight,
  } = scrollContainer;

  const leftPercent = scrollLeft / scrollWidth;
  const rightPercent = (scrollWidth - scrollLeft - offsetWidth) / scrollWidth;
  const topPercent = scrollTop / scrollHeight;
  const bottomPercent =
    (scrollHeight - scrollTop - offsetHeight) / scrollHeight;

  return {
    left: leftPercent * 100 + "%",
    right: rightPercent * 100 + "%",
    top: topPercent * 100 + "%",
    bottom: bottomPercent * 100 + "%",
  };
}

const Mosaic: Component = () => {
  const [getStream, setStream] = createSignal(null);
  const [videoReady, setVideoReady] = createSignal(false);
  const [insetBounds, setInsetBounds] = createSignal(null);
  const [contrast, setContrast] = createSignal(1);
  const [brightness, setBrightness] = createSignal(1);

  let canvas: HTMLCanvasElement;
  let scrollContainer: HTMLDivElement;
  let video: HTMLVideoElement;
  let worker: Worker;

  onMount(async () => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: 320,
          aspectRatio: 16 / 9,
        },
        audio: false,
      })
      .then(setStream);
  });

  createEffect(() => {
    const stream = getStream();

    if (stream !== null) {
      video.onloadeddata = () => {
        video.play().then(() => {
          setVideoReady(true);
        });
      };
      video.onerror = (error) => {
        console.error("video error", error);
      };
      video.srcObject = stream;

      onCleanup(() => {
        video.srcObject = null;
      });
    }
  });

  createEffect(() => {
    if (videoReady()) {
      if (!worker) {
        let imageHeight = video.videoHeight;
        let imageWidth = video.videoWidth;
        let pixelDimension = 6 * 3;

        canvas.width = imageWidth * pixelDimension;
        canvas.height = imageHeight * pixelDimension;
        canvas.style.width = (imageWidth * pixelDimension) / 2 + "px";

        const offscreenCanvas = canvas.transferControlToOffscreen();

        worker = new OffscreenCanvasWorker();
        worker.postMessage(
          { type: "canvas", data: { canvas: offscreenCanvas } },
          [offscreenCanvas]
        );
      }

      // Using `untrack` because we don't want the effect to rerun when the
      // `contrast` and `brightness` signals change. We just want to access
      // their current values within the effect.
      untrack(() => {
        worker.postMessage({
          type: "draw",
          data: { imageData: getPixelData(video, contrast(), brightness()) },
        });
      });

      worker.onmessage = ({ data }) => {
        if (data.type === "ready_for_more") {
          untrack(() => {
            worker.postMessage({
              type: "draw",
              data: {
                imageData: getPixelData(video, contrast(), brightness()),
              },
            });
          });
        }
      };

      onCleanup(() => {
        worker.onmessage = null;
      });
    }
  });

  function handleChangeContrast(event: InputEvent) {
    setContrast(event.target.value);
  }

  function handleChangeBrightness(event: InputEvent) {
    setBrightness(event.target.value);
  }

  function handleScroll(event) {
    const bounds = getInsetBounds(event.target);

    setInsetBounds(bounds);
  }

  return (
    <div class="relative">
      <div
        class="w-full h-screen overflow-auto"
        ref={scrollContainer}
        onScroll={handleScroll}
      >
        <canvas class="bg-black" ref={canvas} />
      </div>
      {getStream() && (
        <div class="absolute flex flex-col items-start top-4 left-4">
          <div class="relative mb-4">
            <video class="rounded-md w-40" ref={video} />
            {insetBounds() && (
              <div
                class="absolute border border-white rounded-md"
                style={insetBounds()}
              />
            )}
          </div>
          <div class="bg-white rounded-md p-4">
            <label class="block" for="contrast-slider">
              Contrast
            </label>
            <div class="flex">
              <input
                class="block"
                type="range"
                id="contrast-slider"
                name="contrast"
                min="0"
                max="2"
                step="0.05"
                onInput={handleChangeContrast}
                value={contrast()}
              />
              <input
                class="ml-2 w-12"
                type="number"
                min="0"
                max="2"
                step="0.05"
                value={contrast()}
                onInput={handleChangeContrast}
              />
            </div>

            <label class="block" for="brightness-slider">
              Brightness
            </label>
            <div class="flex">
              <input
                class="block"
                type="range"
                id="brightness-slider"
                name="brightness"
                min="0"
                max="2"
                step="0.05"
                onInput={handleChangeBrightness}
                value={brightness()}
              />
              <input
                class="ml-2 w-12"
                type="number"
                min="0"
                max="2"
                step="0.05"
                value={brightness()}
                onInput={handleChangeBrightness}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mosaic;
