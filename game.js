const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 430;
const GRAVITY = 0.75;
const JUMP_DRAW_HEIGHT = 292;
const ATTACK_DRAW_HEIGHT = 305;

const keys = new Set();
const pressedKeys = new Set();

const sprites = {
  idle: new Image(),
  walk: new Image(),
  run: new Image(),
  punch: new Image(),
  kick: new Image(),
  jump: new Image(),
};

sprites.idle.src = "assets/cat-man/idle.png";
sprites.walk.src = "assets/cat-man/walk.png";
sprites.run.src = "assets/cat-man/run.png";
sprites.punch.src = "assets/cat-man/punch.png";
sprites.kick.src = "assets/cat-man/kick.png";
sprites.jump.src = "assets/cat-man/jump.png";

const animations = {
  idle: {
    image: sprites.idle,
    frameDuration: 140,
    scale: 2.34,
    frames: [
      frame(0, 1, 88, 130),
      frame(108, 0, 88, 131),
      frame(227, 0, 75, 131),
      frame(323, 1, 91, 130),
    ],
  },
  walk: {
    image: sprites.walk,
    frameDuration: 115,
    scale: 2.36,
    frames: [
      frame(0, 1, 113, 129),
      frame(128, 1, 107, 128),
      frame(243, 1, 106, 129),
      frame(359, 1, 105, 129),
      frame(477, 1, 113, 128),
    ],
  },
  run: {
    image: sprites.run,
    frameDuration: 90,
    scale: 2.7,
    frames: [
      frame(0, 0, 108, 113),
      frame(121, 7, 99, 111),
      frame(232, 4, 112, 110),
      frame(355, 7, 98, 111),
    ],
  },
  punch: {
    image: sprites.punch,
    frameDuration: 95,
    scale: 2.65,
    frames: [
      frame(0, 1, 90, 115, ATTACK_DRAW_HEIGHT / 115, 0.44),
      frame(106, 2, 125, 113, ATTACK_DRAW_HEIGHT / 113, 0.39),
      frame(231, 0, 144, 115, ATTACK_DRAW_HEIGHT / 115, 0.33),
    ],
  },
  kick: {
    image: sprites.kick,
    frameDuration: 80,
    scale: 1,
    frames: [
      frame(0, 18, 86, 115, ATTACK_DRAW_HEIGHT / 115, 0.42),
      frame(129, 13, 108, 119, ATTACK_DRAW_HEIGHT / 119, 0.3),
      frame(256, 10, 88, 123, ATTACK_DRAW_HEIGHT / 123, 0.48),
      frame(389, 0, 123, 132, ATTACK_DRAW_HEIGHT / 132, 0.32),
      frame(516, 17, 89, 115, ATTACK_DRAW_HEIGHT / 115, 0.49),
    ],
  },
  jump: {
    image: sprites.jump,
    frameDuration: 120,
    scale: 1,
    frames: [
      frame(0, 54, 96, 103, JUMP_DRAW_HEIGHT / 103),
      frame(121, 50, 101, 107, JUMP_DRAW_HEIGHT / 107),
      frame(249, 12, 98, 111, JUMP_DRAW_HEIGHT / 111),
      frame(371, 0, 102, 112, JUMP_DRAW_HEIGHT / 112),
      frame(495, 53, 98, 104, JUMP_DRAW_HEIGHT / 104),
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
  lockedAction: "idle",
  onGround: true,
};

function frame(x, y, width, height, scale = null, anchorX = 0.5) {
  return { x, y, width, height, scale, anchorX };
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
    player.action = player.lockedAction;
    updatePhysics();
    player.actionTimer -= 1;
    return;
  }

  if (pressedKeys.has("KeyF") && player.onGround) {
    startTimedAction("punch", 7);
    updatePhysics();
    return;
  }

  if (pressedKeys.has("KeyG") && player.onGround) {
    startTimedAction("kick", 6);
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

function startTimedAction(action, ticksPerFrame) {
  player.action = action;
  player.lockedAction = action;
  player.actionDuration = animations[action].frames.length * ticksPerFrame;
  player.actionTimer = player.actionDuration;
}

function drawCatMan() {
  const animation = animations[player.action];
  const isTimedAction = player.actionDuration > 0 && player.action === player.lockedAction;
  const frameIndex =
    isTimedAction
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
  const anchorX = source.anchorX ?? 0.5;
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
      -drawWidth * anchorX,
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
      player.x - drawWidth * anchorX,
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
  ctx.fillText("A/D walk  |  Shift + A/D run  |  F punch  |  G kick  |  W jump", WIDTH / 2, 124);
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

  if (["KeyW", "KeyA", "KeyD", "KeyF", "KeyG", "ShiftLeft", "ShiftRight"].includes(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

startWhenReady();
