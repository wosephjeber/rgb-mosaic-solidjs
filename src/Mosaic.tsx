import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { Component } from "solid-js";

import styles from "./Mosaic.module.css";
import { getRowsOfPixels, getPixelData, drawToCanvas } from "./utils/pixels";

const Mosaic: Component = () => {
  let canvas: HTMLCanvasElement;
  let [getStream, setStream] = createSignal(null);

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
      const video = document.createElement("video");

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
        const data = getPixelData(video);
        const pixels = getRowsOfPixels(data);

        let imageHeight = pixels.length;
        let imageWidth = pixels[0].length;
        let pixelDimension = 6 * 3;

        canvas.width = imageWidth * pixelDimension;
        canvas.height = imageHeight * pixelDimension;
        canvas.style.width = (imageWidth * pixelDimension) / 2 + "px";

        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        drawToCanvas(ctx, pixels);

        frame = requestAnimationFrame(loop);
      }

      onCleanup(() => {
        cancelAnimationFrame(frame);

        video.srcObject = null;
      });
    }
  });

  return (
    <div class={styles.mosaic}>
      <canvas class={styles["mosaic--canvas"]} ref={canvas} />
    </div>
  );
};

export default Mosaic;
