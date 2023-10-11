import {
  createEffect,
  createSignal,
  onCleanup,
  onMount,
  untrack,
} from "solid-js";
import type { Component } from "solid-js";

import { getPixelData } from "./utils/pixels";

import FloatingContainer from "./FloatingContainer";
import IconBrightness from "./icons/Brightness";
import IconContrast from "./icons/Contrast";
import OffscreenCanvasWorker from "./offscreen_canvas_worker?worker";
import Slider from "./Slider";
import Inset from "./Inset";

const Mosaic: Component = () => {
  const [getStream, setStream] = createSignal(null);
  const [videoReady, setVideoReady] = createSignal(false);
  const [contrast, setContrast] = createSignal(1);
  const [brightness, setBrightness] = createSignal(1);
  const [pixelDimension, setPixelDimension] = createSignal(24);
  const [left, setLeft] = createSignal(0);
  const [top, setTop] = createSignal(0);
  const [fps, setFps] = createSignal(0);

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
      let framesCount = 0;
      let lastIntervalCheck = Date.now();

      const fpsInterval = setInterval(() => {
        const now = Date.now();
        const timeElapsed = now - lastIntervalCheck;

        setFps(Math.round((framesCount / timeElapsed) * 1000));

        framesCount = 0;
        lastIntervalCheck = now;
      }, 1000);

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
          pixelDimension: untrack(pixelDimension),
          left: untrack(left),
          top: untrack(top),
          brightness: untrack(brightness),
        },
      });

      worker.onmessage = ({ data }) => {
        if (data.type === "ready_for_more") {
          framesCount += 1;

          worker.postMessage({
            type: "draw",
            data: {
              imageData: getPixelData(
                video,
                untrack(contrast),
                untrack(brightness)
              ),
              pixelDimension: untrack(pixelDimension),
              left: untrack(left),
              top: untrack(top),
            },
          });
        }
      };

      onCleanup(() => {
        worker.onmessage = null;
        clearInterval(fpsInterval);
      });
    }
  });

  function handleWheel(event: WheelEvent) {
    event.preventDefault();

    const deltaXInVideoPixels = (event.deltaX * 2) / pixelDimension();
    const deltaYInVideoPixels = (event.deltaY * 2) / pixelDimension();
    const visibleVideoPixelWidth = canvas.width / pixelDimension();
    const visibleVideoPixelHeight = canvas.height / pixelDimension();

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

  return (
    <div class="relative slate-950">
      <div class="w-screen h-screen" onWheel={handleWheel}>
        <canvas
          class="bg-black w-screen h-screen"
          ref={(el) => (canvas = el)}
        />
        {!videoReady() && (
          <div class="absolute w-screen h-screen flex items-center justify-center text-white top-0 left-0">
            Loading...
          </div>
        )}
      </div>
      <div class="absolute flex flex-col items-start top-4 left-4">
        <FloatingContainer
          bg="black"
          class="relative w-40 mb-4 overflow-hidden"
        >
          <video class="w-full aspect-video" ref={(el) => (video = el)} />
          {videoReady() && (
            <Inset
              canvasHeight={canvas.height}
              canvasWidth={canvas.width}
              left={left()}
              top={top()}
              pixelDimension={pixelDimension()}
              videoHeight={video.videoHeight}
              videoWidth={video.videoWidth}
            />
          )}
        </FloatingContainer>
        <FloatingContainer class="px-4 py-3 mb-4">
          <Slider
            icon={IconContrast}
            label="Contrast"
            max="2"
            min="0"
            onInput={({ target }: InputEvent) => {
              setContrast(Number((target as HTMLInputElement).value));
            }}
            step="0.05"
            value={contrast()}
          />
        </FloatingContainer>
        <FloatingContainer class="px-4 py-3 mb-4">
          <Slider
            icon={IconBrightness}
            label="Brightness"
            max="2"
            min="0"
            onInput={({ target }: InputEvent) => {
              setBrightness(Number((target as HTMLInputElement).value));
            }}
            step="0.05"
            value={brightness()}
          />
        </FloatingContainer>
        <FloatingContainer class="px-4 py-3 mb-4">
          <Slider
            label="Font size"
            max="18"
            min="4"
            onInput={({ target }: InputEvent) => {
              setPixelDimension(Number((target as HTMLInputElement).value) * 6);
            }}
            step=".25"
            value={pixelDimension() / 6}
          />
        </FloatingContainer>
        <FloatingContainer class="text-gray-800 px-4 py-2">
          {fps()} fps
        </FloatingContainer>
      </div>
    </div>
  );
};

export default Mosaic;
