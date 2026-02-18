export type BlendMode = "split" | "overlay" | "pip" | "crossfade";

export interface BlendOptions {
  mode: BlendMode;
  opacity: number; // 0-1 for overlay mode
  pipPosition: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  pipScale: number; // 0.2-0.5
  splitRatio: number; // 0-1, position of split line
  splitDirection: "vertical" | "horizontal";
}

export const defaultBlendOptions: BlendOptions = {
  mode: "split",
  opacity: 0.5,
  pipPosition: "bottom-right",
  pipScale: 0.3,
  splitRatio: 0.5,
  splitDirection: "vertical",
};

export function drawBlendedFrame(
  ctx: CanvasRenderingContext2D,
  video1: HTMLVideoElement,
  video2: HTMLVideoElement,
  width: number,
  height: number,
  options: BlendOptions,
  progress: number // 0-1, for crossfade
) {
  ctx.clearRect(0, 0, width, height);

  switch (options.mode) {
    case "split":
      drawSplit(ctx, video1, video2, width, height, options);
      break;
    case "overlay":
      drawOverlay(ctx, video1, video2, width, height, options);
      break;
    case "pip":
      drawPiP(ctx, video1, video2, width, height, options);
      break;
    case "crossfade":
      drawCrossfade(ctx, video1, video2, width, height, progress);
      break;
  }
}

function drawVideoFit(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number
) {
  const vw = video.videoWidth || 1;
  const vh = video.videoHeight || 1;
  const videoRatio = vw / vh;
  const destRatio = dw / dh;

  let sx = 0,
    sy = 0,
    sw = vw,
    sh = vh;

  if (videoRatio > destRatio) {
    sw = vh * destRatio;
    sx = (vw - sw) / 2;
  } else {
    sh = vw / destRatio;
    sy = (vh - sh) / 2;
  }

  ctx.drawImage(video, sx, sy, sw, sh, dx, dy, dw, dh);
}

function drawSplit(
  ctx: CanvasRenderingContext2D,
  video1: HTMLVideoElement,
  video2: HTMLVideoElement,
  width: number,
  height: number,
  options: BlendOptions
) {
  const { splitRatio, splitDirection } = options;

  ctx.save();
  if (splitDirection === "vertical") {
    const splitX = width * splitRatio;

    ctx.beginPath();
    ctx.rect(0, 0, splitX, height);
    ctx.clip();
    drawVideoFit(ctx, video1, 0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(splitX, 0, width - splitX, height);
    ctx.clip();
    drawVideoFit(ctx, video2, 0, 0, width, height);
    ctx.restore();

    // Draw split line
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(splitX, 0);
    ctx.lineTo(splitX, height);
    ctx.stroke();
  } else {
    const splitY = height * splitRatio;

    ctx.beginPath();
    ctx.rect(0, 0, width, splitY);
    ctx.clip();
    drawVideoFit(ctx, video1, 0, 0, width, height);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.rect(0, splitY, width, height - splitY);
    ctx.clip();
    drawVideoFit(ctx, video2, 0, 0, width, height);
    ctx.restore();

    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, splitY);
    ctx.lineTo(width, splitY);
    ctx.stroke();
  }
}

function drawOverlay(
  ctx: CanvasRenderingContext2D,
  video1: HTMLVideoElement,
  video2: HTMLVideoElement,
  width: number,
  height: number,
  options: BlendOptions
) {
  drawVideoFit(ctx, video1, 0, 0, width, height);
  ctx.globalAlpha = options.opacity;
  drawVideoFit(ctx, video2, 0, 0, width, height);
  ctx.globalAlpha = 1;
}

function drawPiP(
  ctx: CanvasRenderingContext2D,
  video1: HTMLVideoElement,
  video2: HTMLVideoElement,
  width: number,
  height: number,
  options: BlendOptions
) {
  drawVideoFit(ctx, video1, 0, 0, width, height);

  const pipW = width * options.pipScale;
  const pipH = height * options.pipScale;
  const margin = 16;

  let pipX = margin;
  let pipY = margin;

  switch (options.pipPosition) {
    case "top-right":
      pipX = width - pipW - margin;
      break;
    case "bottom-left":
      pipY = height - pipH - margin;
      break;
    case "bottom-right":
      pipX = width - pipW - margin;
      pipY = height - pipH - margin;
      break;
  }

  // PiP shadow
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  // PiP border
  const radius = 8;
  ctx.beginPath();
  ctx.roundRect(pipX - 2, pipY - 2, pipW + 4, pipH + 4, radius + 2);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Clip to rounded rect
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pipX, pipY, pipW, pipH, radius);
  ctx.clip();
  drawVideoFit(ctx, video2, pipX, pipY, pipW, pipH);
  ctx.restore();
}

function drawCrossfade(
  ctx: CanvasRenderingContext2D,
  video1: HTMLVideoElement,
  video2: HTMLVideoElement,
  width: number,
  height: number,
  progress: number
) {
  // progress 0 -> fully video1, progress 1 -> fully video2
  // We create a cycling crossfade effect
  const cycle = (Math.sin(progress * Math.PI * 2) + 1) / 2; // 0-1-0-1 cycling

  ctx.globalAlpha = 1;
  drawVideoFit(ctx, video1, 0, 0, width, height);
  ctx.globalAlpha = cycle;
  drawVideoFit(ctx, video2, 0, 0, width, height);
  ctx.globalAlpha = 1;
}
