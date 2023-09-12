let canvas: OffscreenCanvas;
let ctx: CanvasRenderingContext2D;

function drawToCanvas(imageData: ImageData) {
  function drawPixel(r: number, g: number, b: number, x: number, y: number) {
    ctx.fillStyle = `rgb(${r}, 0, 0)`;
    ctx.fillText(String(r), x * pixelDimension, y * pixelDimension);

    ctx.fillStyle = `rgb(0, ${g}, 0)`;
    ctx.fillText(String(g), x * pixelDimension, y * pixelDimension + fontSize);

    ctx.fillStyle = `rgb(0, 0, ${b})`;
    ctx.fillText(
      String(b),
      x * pixelDimension,
      y * pixelDimension + fontSize * 2
    );
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

function handleCanvas(data: { canvas: OffscreenCanvas }) {
  const { canvas: offscreenCanvas } = data;

  canvas = offscreenCanvas;
  ctx = canvas.getContext("2d");
}

function handleDraw(data: { imageData: ImageData }) {
  if (!canvas || !ctx) {
    console.warn("canvas not set up in worker yet");
    return;
  }
  const { imageData } = data;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawToCanvas(imageData);

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
