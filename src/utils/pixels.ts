export type PixelData = [r: number, g: number, b: number];

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

export function getPixelData(
  video: HTMLVideoElement,
  contrast: number,
  brightness: number
) {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.filter = `contrast(${contrast * 100}%) brightness(${brightness})`;
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  return ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
}
