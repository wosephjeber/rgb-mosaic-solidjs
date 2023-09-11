import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Component } from "solid-js";

import { getPixelData, drawToCanvas } from "./utils/pixels";

const Mosaic: Component = () => {
  let [getStream, setStream] = createSignal(null);
  let [insetBounds, setInsetBounds] = createSignal(null);

  let canvas: HTMLCanvasElement;
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
    const ctx = canvas.getContext("2d");

    if (ctx !== null && stream !== null) {
      let frame: number | null;

      video.onloadeddata = () => {
        video.play().then(() => {
          frame = requestAnimationFrame(loop);
        });
      };
      video.onerror = (error) => {
        console.log("video error", error);
      };
      video.srcObject = stream;

      function loop() {
        const imageData = getPixelData(video);

        let imageHeight = imageData.height;
        let imageWidth = imageData.width;
        let pixelDimension = 6 * 3;

        canvas.width = imageWidth * pixelDimension;
        canvas.height = imageHeight * pixelDimension;
        canvas.style.width = (imageWidth * pixelDimension) / 2 + "px";

        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        drawToCanvas(ctx, imageData);

        frame = requestAnimationFrame(loop);
      }

      onCleanup(() => {
        cancelAnimationFrame(frame);

        video.srcObject = null;
      });
    }
  });

  function handleScroll(event) {
    const { target } = event;
    const {
      scrollTop,
      scrollLeft,
      offsetWidth,
      offsetHeight,
      scrollWidth,
      scrollHeight,
    } = target;

    const leftPercent = scrollLeft / scrollWidth;
    const rightPercent = (scrollWidth - scrollLeft - offsetWidth) / scrollWidth;
    const topPercent = scrollTop / scrollHeight;
    const bottomPercent =
      (scrollHeight - scrollTop - offsetHeight) / scrollHeight;

    const bounds = {
      left: leftPercent * 100 + "%",
      right: rightPercent * 100 + "%",
      top: topPercent * 100 + "%",
      bottom: bottomPercent * 100 + "%",
    };

    setInsetBounds(bounds);

    console.log("scrolled", target.scrollTop, target.scrollLeft);
  }

  return (
    <div class="relative">
      <div class="w-full h-screen overflow-auto" onScroll={handleScroll}>
        <canvas class="bg-black" ref={canvas} />
      </div>
      {getStream() && (
        <div class="absolute top-4 left-4">
          <video class="rounded-md h-20" ref={video} />
          <div
            class="absolute border border-white"
            style={{
              ...(insetBounds() || {}),
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Mosaic;
