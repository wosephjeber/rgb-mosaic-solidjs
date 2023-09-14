let canvas: OffscreenCanvas;
let ctx: OffscreenCanvasRenderingContext2D;

function drawToCanvas(
  imageData: ImageData,
  fontSize: number,
  left: number,
  top: number
) {
  const pixelDimension = fontSize * 3;
  const { data, width } = imageData;

  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textBaseline = "top";
  ctx.textAlign = "center";

  const leftBound = left / pixelDimension;
  const rightBound = canvas.width / pixelDimension + left / pixelDimension;
  const topBound = top / pixelDimension;
  const bottomBound = canvas.height / pixelDimension + top / pixelDimension;

  function drawPixel(r: number, g: number, b: number, x: number, y: number) {
    if (x < leftBound || y < topBound || x > rightBound || y > bottomBound)
      return;

    ctx.fillStyle = `rgb(${r}, 0, 0)`;
    ctx.fillText(
      String(r),
      x * pixelDimension - left,
      y * pixelDimension - top
    );

    ctx.fillStyle = `rgb(0, ${g}, 0)`;
    ctx.fillText(
      String(g),
      x * pixelDimension - left,
      y * pixelDimension + fontSize - top
    );

    ctx.fillStyle = `rgb(0, 0, ${b})`;
    ctx.fillText(
      String(b),
      x * pixelDimension - left,
      y * pixelDimension + fontSize * 2 - top
    );
  }

  for (let i = 0, len = data.length; i < len; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor(i / 4 / width);

    drawPixel(data[i], data[i + 1], data[i + 2], x, y);
  }
}

function handleCanvas(data: { canvas: OffscreenCanvas }) {
  const { canvas: offscreenCanvas } = data;

  canvas = offscreenCanvas;
  ctx = canvas.getContext("2d") as OffscreenCanvasRenderingContext2D;
}

function handleDraw(data: {
  imageData: ImageData;
  fontSize: number;
  left: number;
  top: number;
}) {
  if (!canvas || !ctx) {
    console.warn("canvas not set up in worker yet");
    return;
  }
  const { fontSize, imageData, left, top } = data;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawToCanvas(imageData, fontSize, left, top);

  self.postMessage({ type: "ready_for_more" });
}

self.onmessage = ({ data }) => {
  switch (data.type) {
    case "canvas":
      handleCanvas(data.data);
      break;
    case "draw":
      handleDraw(data.data);
      break;
    default:
      console.log("No handler for", data.type);
  }
};
