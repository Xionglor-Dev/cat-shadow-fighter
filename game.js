const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 430;

const keys = new Set();

const sprites = {
  idle: new Image(),
  walk: new Image(),
  run: new Image(),
  punch: new Image(),
};

sprites.idle.src = "assets/IDLE-man.png";
sprites.walk.src = "assets/walk-man.png";
sprites.run.src = "assets/run-man.png";
sprites.punch.src = "assets/punch-man.png";

const animations = {
  idle: {
    image: sprites.idle,
    frameDuration: 140,
    scale: 0.68,
    frames: [
      frame(0, 150, 340, 490),
      frame(345, 150, 325, 490),
      frame(680, 145, 320, 500),
      frame(995, 150, 340, 490),
    ],
  },
  walk: {
    image: sprites.walk,
    frameDuration: 115,
    scale: 1,
    frames: [
      frame(20, 225, 285, 335),
      frame(300, 225, 275, 335),
      frame(560, 225, 270, 335),
      frame(820, 225, 260, 335),
      frame(1075, 225, 285, 335),
    ],
  },
  run: {
    image: sprites.run,
    frameDuration: 90,
    scale: 0.92,
    frames: [
      frame(42, 248, 330, 380),
      frame(382, 265, 320, 365),
      frame(700, 258, 350, 360),
      frame(1046, 270, 320, 355),
    ],
  },
  punch: {
    image: sprites.punch,
    frameDuration: 95,
    scale: 0.72,
    frames: [
      frame(40, 170, 360, 440),
      frame(425, 170, 455, 440),
      frame(885, 170, 491, 440),
    ],
  },
};

const player = {
  x: WIDTH / 2,
  y: FLOOR_Y,
  walkSpeed: 3.4,
  runSpeed: 6.4,
  facing: 1,
  action: "idle",
  actionTimer: 0,
  actionDuration: 0,
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

function updatePlayer() {
  const movingLeft = keys.has("KeyA");
  const movingRight = keys.has("KeyD");
  const running = (keys.has("ShiftLeft") || keys.has("ShiftRight")) && (movingLeft || movingRight);
  const speed = running ? player.runSpeed : player.walkSpeed;

  if (player.actionTimer > 0) {
    player.actionTimer -= 1;
    player.action = "punch";
    return;
  }

  if (keys.has("KeyF")) {
    startPunch();
    return;
  }

  if (movingLeft && !movingRight) {
    player.x -= speed;
    player.facing = -1;
  }

  if (movingRight && !movingLeft) {
    player.x += speed;
    player.facing = 1;
  }

  player.x = Math.max(120, Math.min(WIDTH - 120, player.x));
  player.action = running ? "run" : movingLeft || movingRight ? "walk" : "idle";
}

function startPunch() {
  player.action = "punch";
  player.actionTimer = 24;
  player.actionDuration = 24;
}

function drawCatMan() {
  const animation = animations[player.action];
  const frameIndex =
    player.actionTimer > 0 && player.actionDuration > 0
      ? Math.min(
          animation.frames.length - 1,
          Math.floor((1 - player.actionTimer / player.actionDuration) * animation.frames.length)
        )
      : Math.floor(performance.now() / animation.frameDuration) % animation.frames.length;
  const source = animation.frames[frameIndex];
  const drawWidth = source.width * animation.scale;
  const drawHeight = source.height * animation.scale;
  const drawY = player.y - drawHeight;

  ctx.save();

  if (player.facing === -1) {
    ctx.translate(player.x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      animation.image,
      source.x,
      source.y,
      source.width,
      source.height,
      -drawWidth / 2,
      drawY,
      drawWidth,
      drawHeight
    );
  } else {
    ctx.drawImage(
      animation.image,
      source.x,
      source.y,
      source.width,
      source.height,
      player.x - drawWidth / 2,
      drawY,
      drawWidth,
      drawHeight
    );
  }

  ctx.restore();
}

function drawLabel() {
  ctx.fillStyle = "#f8fafc";
  ctx.font = "900 28px Arial";
  ctx.textAlign = "center";
  ctx.fillText("CAT MAN", WIDTH / 2, 72);

  ctx.fillStyle = "#93c5fd";
  ctx.font = "16px Arial";
  ctx.fillText(player.action.toUpperCase(), WIDTH / 2, 98);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "14px Arial";
  ctx.fillText("A/D walk  |  Shift + A/D run  |  F punch", WIDTH / 2, 124);
}

function gameLoop() {
  updatePlayer();
  drawBackground();
  drawShadow();
  drawCatMan();
  drawLabel();
  requestAnimationFrame(gameLoop);
}

function startWhenReady() {
  let loadedImages = 0;
  const totalImages = Object.keys(sprites).length;

  function markLoaded() {
    loadedImages += 1;

    if (loadedImages === totalImages) {
      requestAnimationFrame(gameLoop);
    }
  }

  for (const image of Object.values(sprites)) {
    if (image.complete) {
      markLoaded();
    } else {
      image.addEventListener("load", markLoaded);
    }
  }
}

window.addEventListener("keydown", (event) => {
  keys.add(event.code);
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

startWhenReady();
