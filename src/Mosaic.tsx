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
import Slider from "./Slider";

const Mosaic: Component = () => {
  const [getStream, setStream] = createSignal(null);
  const [videoReady, setVideoReady] = createSignal(false);
  const [insetBounds, setInsetBounds] = createSignal(null);
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
          fontSize: fontSize(),
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
              fontSize: fontSize(),
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
    setLeft((prevLeft) => prevLeft + event.deltaX * 2);
    setTop((prevTop) => prevTop + event.deltaY * 2);
  }

  return (
    <div class="relative">
      <div class="w-full h-screen overflow-auto" onWheel={handleWheel}>
        <canvas class="bg-black" ref={(el) => (canvas = el)} />
      </div>
      {getStream() && (
        <div class="absolute flex flex-col items-start top-4 left-4">
          <div class="relative mb-4">
            <video class="rounded-md w-40" ref={(el) => (video = el)} />
            {insetBounds() && (
              <div
                class="absolute border border-white rounded-md"
                style={insetBounds() || {}}
              />
            )}
          </div>
          <div class="bg-white rounded-md p-4">
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
      )}
    </div>
  );
};

export default Mosaic;
