import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import type { Component } from "solid-js";

import styles from "./Mosaic.module.css";

import { getPixelData } from "./utils/pixels";

import OffscreenCanvasWorker from "./offscreen_canvas_worker?worker";
import Slider from "./Slider";

const Mosaic: Component = () => {
  const [getStream, setStream] = createSignal(null);
  const [videoReady, setVideoReady] = createSignal(false);
  const [contrast, setContrast] = createSignal(1);
  const [brightness, setBrightness] = createSignal(1);
  const [fontSize, setFontSize] = createSignal(8);
  const [left, setLeft] = createSignal(0);
  const [top, setTop] = createSignal(0);

  let canvas: HTMLCanvasElement;
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
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = canvas.width / 2 + "px";
        canvas.style.height = canvas.height / 2 + "px";

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

      worker.postMessage({
        type: "draw",
        data: {
          imageData: getPixelData(
            video,
            untrack(contrast),
            untrack(brightness)
          ),
          fontSize: untrack(fontSize),
          left: untrack(left),
          top: untrack(top),
        },
      });

      worker.onmessage = ({ data }) => {
        if (data.type === "ready_for_more") {
          worker.postMessage({
            type: "draw",
            data: {
              imageData: getPixelData(
                video,
                untrack(contrast),
                untrack(brightness)
              ),
              fontSize: untrack(fontSize),
              left: untrack(left),
              top: untrack(top),
            },
          });
        }
      };

      onCleanup(() => {
        worker.onmessage = null;
      });
    }
  });

  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const pixelDimension = untrack(fontSize) * 3;
    const deltaXInVideoPixels = (event.deltaX * 2) / pixelDimension;
    const deltaYInVideoPixels = (event.deltaY * 2) / pixelDimension;
    const visibleVideoPixelWidth = canvas.width / pixelDimension;
    const visibleVideoPixelHeight = canvas.height / pixelDimension;

    setLeft((prevLeft) =>
      Math.min(
        Math.max(prevLeft + deltaXInVideoPixels, 0),
        video.videoWidth - visibleVideoPixelWidth
      )
    );
    setTop((prevTop) =>
      Math.min(
        Math.max(prevTop + deltaYInVideoPixels, 0),
        video.videoHeight - visibleVideoPixelHeight
      )
    );
  }

  function getBounds() {
    if (!video || !canvas) return {};

    const pixelDimension = fontSize() * 3;
    const visibleVideoPixelWidth = canvas.width / pixelDimension;
    const visibleVideoPixelHeight = canvas.height / pixelDimension;

    const bounds = {
      left: left() / video.videoWidth,
      right: 1 - (left() + visibleVideoPixelWidth) / video.videoWidth,
      top: top() / video.videoHeight,
      bottom: 1 - (top() + visibleVideoPixelHeight) / video.videoHeight,
    };

    return {
      left: `${bounds.left * 100}%`,
      right: `${bounds.right * 100}%`,
      top: `${bounds.top * 100}%`,
      bottom: `${bounds.bottom * 100}%`,
    };
  }

  return (
    <div class="relative slate-950">
      <div class="w-screen h-screen" onWheel={handleWheel}>
        <canvas
          class="bg-black w-screen h-screen"
          ref={(el) => (canvas = el)}
        />
      </div>
      {getStream() && (
        <div class="absolute flex flex-col items-start top-4 left-4">
          <div class="relative mb-4">
            <video
              class={`${styles["floating-container"]} rounded-md w-40`}
              ref={(el) => (video = el)}
            />
            {videoReady() && (
              <div
                class="absolute border border-white rounded-md"
                style={getBounds()}
              />
            )}
          </div>
          <div
            class={`bg-white text-gray-800 rounded-md divide-y divide-slate-200 ${styles["floating-container"]}`}
          >
            <div class="px-4 py-3">
              <Slider
                label="Contrast"
                max="2"
                min="0"
                onInput={({ target }: InputEvent) => {
                  setContrast(Number((target as HTMLInputElement).value));
                }}
                step="0.05"
                value={contrast()}
              />
            </div>
            <div class="px-4 py-3">
              <Slider
                label="Brightness"
                max="2"
                min="0"
                onInput={({ target }: InputEvent) => {
                  setBrightness(Number((target as HTMLInputElement).value));
                }}
                step="0.05"
                value={brightness()}
              />
            </div>
            <div class="px-4 py-3">
              <Slider
                label="Font Size"
                max="24"
                min="8"
                onInput={({ target }: InputEvent) => {
                  setFontSize(Number((target as HTMLInputElement).value));
                }}
                step="1"
                value={fontSize()}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mosaic;
