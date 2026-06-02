const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 430;

const catMan = new Image();
catMan.src = "assets/IDLE-man.png";

const idleFrames = [
  frame(0, 150, 340, 490),
  frame(345, 150, 325, 490),
  frame(680, 145, 320, 500),
  frame(995, 150, 340, 490),
];

const player = {
  x: WIDTH / 2,
  y: FLOOR_Y,
  scale: 0.68,
};

function frame(x, y, width, height) {
  return { x, y, width, height };
}

function drawBackground() {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#070a10");
  sky.addColorStop(0.62, "#121a27");
  sky.addColorStop(1, "#0b0f16");

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.fillStyle = "#18202d";
  ctx.fillRect(0, FLOOR_Y + 4, WIDTH, HEIGHT - FLOOR_Y);

  ctx.strokeStyle = "rgba(219, 234, 254, 0.22)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, FLOOR_Y + 4);
  ctx.lineTo(WIDTH, FLOOR_Y + 4);
  ctx.stroke();
}

function drawShadow() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(player.x, player.y + 8, 78, 16, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawCatManIdle() {
  const frameIndex = Math.floor(performance.now() / 140) % idleFrames.length;
  const source = idleFrames[frameIndex];
  const drawWidth = source.width * player.scale;
  const drawHeight = source.height * player.scale;
  const drawX = player.x - drawWidth / 2;
  const drawY = player.y - drawHeight;

  ctx.drawImage(
    catMan,
    source.x,
    source.y,
    source.width,
    source.height,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );
}

function drawLabel() {
  ctx.fillStyle = "#f8fafc";
  ctx.font = "900 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CAT MAN", WIDTH / 2, 72);

  ctx.fillStyle = "#93c5fd";
  ctx.font = "16px Arial";
  ctx.fillText("Idle animation only", WIDTH / 2, 98);
}

function gameLoop() {
  drawBackground();
  drawShadow();
  drawCatManIdle();
  drawLabel();
  requestAnimationFrame(gameLoop);
}

catMan.addEventListener("load", () => {
  requestAnimationFrame(gameLoop);
});
