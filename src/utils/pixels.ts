export type PixelData = [r: number, g: number, b: number];

export function getPixelData(
  video: HTMLVideoElement,
  contrast: number,
  brightness: number
) {
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.filter = `contrast(${contrast * 100}%) brightness(${brightness})`;
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  return ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
}

export function drawToCanvas(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData
) {
  function drawPixel(r: number, g: number, b: number, x: number, y: number) {
    ctx.fillStyle = `rgb(${r}, 0, 0)`;
    ctx.fillText(r, x * pixelDimension, y * pixelDimension);

    ctx.fillStyle = `rgb(0, ${g}, 0)`;
    ctx.fillText(g, x * pixelDimension, y * pixelDimension + fontSize);

    ctx.fillStyle = `rgb(0, 0, ${b})`;
    ctx.fillText(b, x * pixelDimension, y * pixelDimension + fontSize * 2);
  }

  const fontSize = 6;
  let pixelDimension = fontSize * 3;

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";

  const { data, width } = imageData;

  for (let i = 0, len = data.length; i < len; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    drawPixel(data[i], data[i + 1], data[i + 2], x, y);
  }
}
