export type PixelData = [r: number, g: number, b: number];

export function getPixelData(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  ctx.filter = "contrast(150%) brightness(1.5)";
  ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

  return ctx.getImageData(0, 0, video.videoWidth, video.videoHeight);
}

export function getRowsOfPixels(imageData: ImageData) {
  const { data, width } = imageData;

  let pixels = [];
  let rows = [];

  for (let i = 0, len = data.length; i < len; i += 4) {
    pixels.push(data.slice(i, i + 4));
  }

  for (let i = 0, len = pixels.length; i < len; i += width) {
    rows.push(pixels.slice(i, i + width));
  }

  return rows;
}

export function drawToCanvas(ctx: CanvasRenderingContext2D, rows: PixelData[]) {
  function drawPixel(rgb: PixelData, x: number, y: number) {
    let [r, g, b] = rgb;

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

  rows.map((row, y) => {
    row.map((pixel, x) => {
      drawPixel(pixel, x, y);
    });
  });
}
