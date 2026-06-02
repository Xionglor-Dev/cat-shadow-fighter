const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 430;
const GRAVITY = 0.75;

const keys = new Set();
const pressedKeys = new Set();

const sprites = {
  idle: new Image(),
  walk: new Image(),
  run: new Image(),
  punch: new Image(),
  jump: new Image(),
};

sprites.idle.src = "assets/IDLE-man.png";
sprites.walk.src = "assets/walk-man.png";
sprites.run.src = "assets/run-man.png";
sprites.punch.src = "assets/punch-man.png";
sprites.jump.src = "assets/jump-man.png";

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
    scale: 1.06,
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
    scale: 0.91,
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
    scale: 0.74,
    frames: [
      frame(40, 170, 360, 440),
      frame(425, 170, 455, 440),
      frame(885, 170, 491, 440),
    ],
  },
  jump: {
    image: sprites.jump,
    frameDuration: 120,
    scale: 1,
    frames: [
      frame(19, 429, 267, 292, 1.2),
      frame(306, 247, 278, 376, 0.86),
      frame(599, 96, 216, 364, 0.94),
      frame(817, 181, 276, 415, 0.77),
      frame(1051, 424, 300, 299, 1.17),
    ],
  },
};

const player = {
  x: WIDTH / 2,
  y: FLOOR_Y,
  velocityY: 0,
  walkSpeed: 3.4,
  runSpeed: 6.4,
  jumpPower: 15.5,
  facing: 1,
  action: "idle",
  actionTimer: 0,
  actionDuration: 0,
  onGround: true,
};

function frame(x, y, width, height, scale = null) {
  return { x, y, width, height, scale };
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
  const airDistance = Math.max(0, FLOOR_Y - player.y);
  const shadowScale = Math.max(0.45, 1 - airDistance / 260);

  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(player.x, FLOOR_Y + 8, 78 * shadowScale, 16 * shadowScale, 0, 0, Math.PI * 2);
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
    updatePhysics();
    return;
  }

  if (pressedKeys.has("KeyF") && player.onGround) {
    startPunch();
    updatePhysics();
    return;
  }

  if (pressedKeys.has("KeyW") && player.onGround) {
    player.velocityY = -player.jumpPower;
    player.onGround = false;
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
  updatePhysics();

  if (!player.onGround) {
    player.action = "jump";
  } else {
    player.action = running ? "run" : movingLeft || movingRight ? "walk" : "idle";
  }
}

function updatePhysics() {
  player.velocityY += GRAVITY;
  player.y += player.velocityY;

  if (player.y >= FLOOR_Y) {
    player.y = FLOOR_Y;
    player.velocityY = 0;
    player.onGround = true;
  }
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
      : player.action === "jump"
      ? getJumpFrameIndex()
      : Math.floor(performance.now() / animation.frameDuration) % animation.frames.length;
  const source = animation.frames[frameIndex];
  const drawScale = source.scale ?? animation.scale;
  const drawWidth = source.width * drawScale;
  const drawHeight = source.height * drawScale;
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

function getJumpFrameIndex() {
  if (player.velocityY < -11) {
    return 0;
  }

  if (player.velocityY < -4) {
    return 1;
  }

  if (player.velocityY < 2) {
    return 2;
  }

  if (player.velocityY < 9) {
    return 3;
  }

  return 4;
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
  ctx.fillText("A/D walk  |  Shift + A/D run  |  F punch  |  W jump", WIDTH / 2, 124);
}

function gameLoop() {
  updatePlayer();
  drawBackground();
  drawShadow();
  drawCatMan();
  drawLabel();
  pressedKeys.clear();
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
  if (!keys.has(event.code)) {
    pressedKeys.add(event.code);
  }

  keys.add(event.code);

  if (["KeyW", "KeyA", "KeyD", "KeyF", "ShiftLeft", "ShiftRight"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

startWhenReady();
