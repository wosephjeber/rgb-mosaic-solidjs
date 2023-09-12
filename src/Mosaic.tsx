import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Component } from "solid-js";

import { getPixelData, drawToCanvas } from "./utils/pixels";

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
        console.log("video error", error);
      };
      video.srcObject = stream;

      onCleanup(() => {
        video.srcObject = null;
      });
    }
  });

  createEffect(() => {
    if (videoReady()) {
      const ctx = canvas.getContext("2d");

      let frame: number | null = requestAnimationFrame(loop);
      let inset = false;

      function loop() {
        const imageData = getPixelData(video, contrast(), brightness());

        let imageHeight = imageData.height;
        let imageWidth = imageData.width;
        let pixelDimension = 6 * 3;

        canvas.width = imageWidth * pixelDimension;
        canvas.height = imageHeight * pixelDimension;
        canvas.style.width = (imageWidth * pixelDimension) / 2 + "px";

        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        drawToCanvas(ctx, imageData);

        frame = requestAnimationFrame(loop);

        if (!inset) {
          setInsetBounds(getInsetBounds(scrollContainer));
          inset = true;
        }
      }
      onCleanup(() => {
        cancelAnimationFrame(frame);
      });
    }
  });

  function handleChangeContrast(event) {
    setContrast(event.target.value);
  }

  function handleChangeBrightness(event) {
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
