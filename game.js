const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const FLOOR_Y = 430;
const GRAVITY = 0.75;
const BODY_DRAW_HEIGHT = 305;
const JUMP_DRAW_HEIGHT = 292;
const ATTACK_DRAW_HEIGHT = 305;
const CROUCH_DRAW_HEIGHT = 245;
const CAT_MAN_KO_DRAW_HEIGHT = 130;
const CAT_GIRL_KO_DRAW_HEIGHT = 108;

const keys = new Set();
const pressedKeys = new Set();

const spriteSources = {
  catMan: {
    idle: "assets/cat-man/idle.png",
    walk: "assets/cat-man/walk.png",
    run: "assets/cat-man/run.png",
    jump: "assets/cat-man/jump.png",
    punch: "assets/cat-man/punch.png",
    kick: "assets/cat-man/kick.png",
    jumpAttack: "assets/cat-man/jump-attack.png",
    block: "assets/cat-man/block.png",
    crouch: "assets/cat-man/crouch.png",
    dashAttack: "assets/cat-man/dash-attack.png",
    energyWave: "assets/cat-man/energy-wave.png",
    hitHurt: "assets/cat-man/hit-hurt.png",
    ko: "assets/cat-man/ko.png",
  },
  catGirl: {
    idle: "assets/cat-girl/idle.png",
    walk: "assets/cat-girl/walk.png",
    run: "assets/cat-girl/run.png",
    jump: "assets/cat-girl/jump.png",
    punch: "assets/cat-girl/punch.png",
    kick: "assets/cat-girl/kick.png",
    hitHurt: "assets/cat-girl/hit-hurt.png",
    ko: "assets/cat-girl/ko.png",
  },
};

const attackProfiles = {
  punch: { damage: 8, range: 145, activeFrom: 0.22, activeTo: 0.9 },
  kick: { damage: 11, range: 165, activeFrom: 0.18, activeTo: 0.9 },
  jumpAttack: { damage: 12, range: 160, activeFrom: 0.2, activeTo: 0.92 },
  dashAttack: { damage: 15, range: 175, activeFrom: 0.16, activeTo: 0.95 },
  energyWave: { damage: 18, range: 640, activeFrom: 0.35, activeTo: 1 },
};

const sprites = createSprites(spriteSources);

const animationSets = {
  catMan: {
    idle: animation(sprites.catMan.idle, 140, [
      scaledFrame(0, 1, 88, 130, BODY_DRAW_HEIGHT),
      scaledFrame(108, 0, 88, 131, BODY_DRAW_HEIGHT),
      scaledFrame(227, 0, 75, 131, BODY_DRAW_HEIGHT),
      scaledFrame(323, 1, 91, 130, BODY_DRAW_HEIGHT),
    ]),
    walk: animation(sprites.catMan.walk, 115, [
      scaledFrame(0, 1, 113, 129, BODY_DRAW_HEIGHT),
      scaledFrame(128, 1, 107, 128, BODY_DRAW_HEIGHT),
      scaledFrame(243, 1, 106, 129, BODY_DRAW_HEIGHT),
      scaledFrame(359, 1, 105, 129, BODY_DRAW_HEIGHT),
      scaledFrame(477, 1, 113, 128, BODY_DRAW_HEIGHT),
    ]),
    run: animation(sprites.catMan.run, 90, [
      scaledFrame(0, 0, 108, 113, BODY_DRAW_HEIGHT),
      scaledFrame(121, 7, 99, 111, BODY_DRAW_HEIGHT),
      scaledFrame(232, 4, 112, 110, BODY_DRAW_HEIGHT),
      scaledFrame(355, 7, 98, 111, BODY_DRAW_HEIGHT),
    ]),
    jump: animation(sprites.catMan.jump, 120, [
      scaledFrame(0, 54, 96, 103, JUMP_DRAW_HEIGHT),
      scaledFrame(121, 50, 101, 107, JUMP_DRAW_HEIGHT),
      scaledFrame(249, 12, 98, 111, JUMP_DRAW_HEIGHT),
      scaledFrame(371, 0, 102, 112, JUMP_DRAW_HEIGHT),
      scaledFrame(495, 53, 98, 104, JUMP_DRAW_HEIGHT),
    ]),
    punch: animation(sprites.catMan.punch, 95, [
      scaledFrame(0, 1, 90, 115, ATTACK_DRAW_HEIGHT, 0.44),
      scaledFrame(106, 2, 125, 113, ATTACK_DRAW_HEIGHT, 0.39),
      scaledFrame(231, 0, 144, 115, ATTACK_DRAW_HEIGHT, 0.33),
    ]),
    kick: animation(sprites.catMan.kick, 80, [
      scaledFrame(0, 18, 86, 115, ATTACK_DRAW_HEIGHT, 0.42),
      scaledFrame(129, 13, 108, 119, ATTACK_DRAW_HEIGHT, 0.3),
      scaledFrame(256, 10, 88, 123, ATTACK_DRAW_HEIGHT, 0.48),
      scaledFrame(389, 0, 123, 132, ATTACK_DRAW_HEIGHT, 0.32),
      scaledFrame(516, 17, 89, 115, ATTACK_DRAW_HEIGHT, 0.49),
    ]),
    jumpAttack: animation(sprites.catMan.jumpAttack, 85, [
      scaledFrame(0, 0, 83, 144, ATTACK_DRAW_HEIGHT, 0.44),
      scaledFrame(106, 0, 100, 144, ATTACK_DRAW_HEIGHT, 0.41),
      scaledFrame(219, 0, 99, 144, ATTACK_DRAW_HEIGHT, 0.48),
    ]),
    block: animation(sprites.catMan.block, 120, [
      scaledFrame(0, 0, 149, 133, BODY_DRAW_HEIGHT, 0.48),
    ]),
    crouch: animation(sprites.catMan.crouch, 140, [
      scaledFrame(0, 0, 88, 97, CROUCH_DRAW_HEIGHT, 0.52),
      scaledFrame(124, 0, 89, 97, CROUCH_DRAW_HEIGHT, 0.53),
    ]),
    dashAttack: animation(sprites.catMan.dashAttack, 80, [
      scaledFrame(0, 0, 99, 113, ATTACK_DRAW_HEIGHT, 0.46),
      scaledFrame(208, 0, 117, 113, ATTACK_DRAW_HEIGHT, 0.39),
      scaledFrame(380, 0, 135, 113, ATTACK_DRAW_HEIGHT, 0.4),
    ]),
    energyWave: animation(sprites.catMan.energyWave, 90, [
      scaledFrame(0, 0, 104, 125, ATTACK_DRAW_HEIGHT, 0.47),
      scaledFrame(128, 0, 112, 125, ATTACK_DRAW_HEIGHT, 0.49),
      scaledFrame(256, 0, 114, 125, ATTACK_DRAW_HEIGHT, 0.46),
      scaledFrame(378, 0, 141, 125, ATTACK_DRAW_HEIGHT, 0.37),
      scaledFrame(378, 0, 364, 125, ATTACK_DRAW_HEIGHT, 0.35),
    ]),
    hitHurt: animation(sprites.catMan.hitHurt, 95, [
      scaledFrame(0, 0, 104, 123, BODY_DRAW_HEIGHT, 0.58),
      scaledFrame(136, 12, 94, 112, BODY_DRAW_HEIGHT, 0.46),
      scaledFrame(242, 46, 116, 76, CAT_MAN_KO_DRAW_HEIGHT, 0.55),
    ]),
    ko: animation(sprites.catMan.ko, 180, [
      scaledFrame(0, 0, 153, 55, CAT_MAN_KO_DRAW_HEIGHT, 0.49),
    ]),
  },
  catGirl: {
    idle: animation(sprites.catGirl.idle, 140, [
      scaledFrame(0, 0, 105, 138, BODY_DRAW_HEIGHT),
      scaledFrame(112, 0, 100, 138, BODY_DRAW_HEIGHT),
      scaledFrame(219, 0, 103, 138, BODY_DRAW_HEIGHT),
      scaledFrame(327, 0, 103, 138, BODY_DRAW_HEIGHT),
    ]),
    walk: animation(sprites.catGirl.walk, 115, [
      scaledFrame(0, 0, 116, 135, BODY_DRAW_HEIGHT),
      scaledFrame(124, 0, 103, 135, BODY_DRAW_HEIGHT),
      scaledFrame(238, 0, 110, 135, BODY_DRAW_HEIGHT),
      scaledFrame(360, 0, 96, 135, BODY_DRAW_HEIGHT, 0.55),
      scaledFrame(477, 0, 103, 135, BODY_DRAW_HEIGHT),
      scaledFrame(592, 0, 106, 135, BODY_DRAW_HEIGHT),
    ]),
    run: animation(sprites.catGirl.run, 90, [
      scaledFrame(0, 0, 108, 121, BODY_DRAW_HEIGHT, 0.44),
      scaledFrame(120, 0, 109, 121, BODY_DRAW_HEIGHT, 0.42),
      scaledFrame(236, 0, 111, 121, BODY_DRAW_HEIGHT, 0.42),
      scaledFrame(356, 0, 106, 121, BODY_DRAW_HEIGHT, 0.39),
    ]),
    jump: animation(sprites.catGirl.jump, 120, [
      scaledFrame(0, 0, 100, 151, JUMP_DRAW_HEIGHT, 0.52),
      scaledFrame(112, 0, 90, 151, JUMP_DRAW_HEIGHT, 0.52),
      scaledFrame(219, 0, 108, 151, JUMP_DRAW_HEIGHT, 0.46),
      scaledFrame(346, 0, 111, 151, JUMP_DRAW_HEIGHT, 0.46),
      scaledFrame(498, 0, 96, 151, JUMP_DRAW_HEIGHT, 0.5),
    ]),
    punch: animation(sprites.catGirl.punch, 95, [
      scaledFrame(0, 0, 91, 120, ATTACK_DRAW_HEIGHT, 0.42),
      scaledFrame(112, 0, 123, 120, ATTACK_DRAW_HEIGHT, 0.39),
      scaledFrame(235, 0, 138, 120, ATTACK_DRAW_HEIGHT, 0.3),
    ]),
    kick: animation(sprites.catGirl.kick, 80, [
      scaledFrame(0, 0, 100, 128, ATTACK_DRAW_HEIGHT, 0.44),
      scaledFrame(127, 0, 112, 128, ATTACK_DRAW_HEIGHT, 0.37),
      scaledFrame(256, 0, 110, 128, ATTACK_DRAW_HEIGHT, 0.45),
      scaledFrame(387, 0, 127, 128, ATTACK_DRAW_HEIGHT, 0.37),
      scaledFrame(518, 0, 96, 128, ATTACK_DRAW_HEIGHT, 0.5),
    ]),
    hitHurt: animation(sprites.catGirl.hitHurt, 95, [
      scaledFrame(0, 0, 100, 126, BODY_DRAW_HEIGHT, 0.55),
      scaledFrame(139, 11, 85, 115, BODY_DRAW_HEIGHT, 0.48),
      scaledFrame(249, 61, 125, 59, CAT_GIRL_KO_DRAW_HEIGHT, 0.55),
    ]),
    ko: animation(sprites.catGirl.ko, 180, [
      scaledFrame(0, 0, 157, 46, CAT_GIRL_KO_DRAW_HEIGHT, 0.49),
    ]),
  },
};

const fighters = [
  createFighter({
    name: "CAT MAN",
    color: "#93c5fd",
    x: WIDTH * 0.32,
    facing: 1,
    animations: animationSets.catMan,
    controls: {
      left: "KeyA",
      right: "KeyD",
      run: "ShiftLeft",
      jump: "KeyW",
      crouch: "KeyS",
      block: "KeyE",
      dashAttack: "KeyQ",
      jumpAttack: "KeyR",
      energyWave: "KeyT",
      punch: "KeyF",
      kick: "KeyG",
    },
  }),
  createFighter({
    name: "CAT GIRL",
    color: "#d8b4fe",
    x: WIDTH * 0.68,
    facing: -1,
    animations: animationSets.catGirl,
    controls: {
      left: "ArrowLeft",
      right: "ArrowRight",
      run: "ShiftRight",
      jump: "ArrowUp",
      punch: "KeyJ",
      kick: "KeyK",
    },
  }),
];

const controlCodes = new Set(
  fighters.flatMap((fighter) => Object.values(fighter.controls).filter(Boolean))
);

function createSprites(sources) {
  return Object.fromEntries(
    Object.entries(sources).map(([fighterName, fighterSources]) => [
      fighterName,
      Object.fromEntries(
        Object.entries(fighterSources).map(([action, src]) => {
          const image = new Image();
          image.src = src;
          return [action, image];
        })
      ),
    ])
  );
}

function animation(image, frameDuration, frames) {
  return { image, frameDuration, frames };
}

function frame(x, y, width, height, scale = 1, anchorX = 0.5) {
  return { x, y, width, height, scale, anchorX };
}

function scaledFrame(x, y, width, height, targetHeight, anchorX = 0.5) {
  return frame(x, y, width, height, targetHeight / height, anchorX);
}

function createFighter({ name, color, x, facing, animations, controls }) {
  return {
    name,
    color,
    x,
    y: FLOOR_Y,
    velocityY: 0,
    walkSpeed: 3.4,
    runSpeed: 6.4,
    jumpPower: 15.5,
    dashSpeed: 8.5,
    facing,
    action: "idle",
    actionTimer: 0,
    actionDuration: 0,
    lockedAction: "idle",
    onGround: true,
    maxHealth: 100,
    health: 100,
    hasHit: false,
    isKO: false,
    animations,
    controls,
  };
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

function updateFighter(fighter) {
  const controls = fighter.controls;
  const movingLeft = keys.has(controls.left);
  const movingRight = keys.has(controls.right);
  const running = keys.has(controls.run) && (movingLeft || movingRight);
  const speed = running ? fighter.runSpeed : fighter.walkSpeed;

  if (fighter.isKO) {
    fighter.action = "ko";
    updatePhysics(fighter);
    clampFighter(fighter);
    return;
  }

  if (fighter.actionTimer > 0) {
    fighter.action = fighter.lockedAction;

    if (fighter.lockedAction === "dashAttack") {
      fighter.x += fighter.facing * fighter.dashSpeed;
    }

    updatePhysics(fighter);
    clampFighter(fighter);
    return;
  }

  if (pressedKeys.has(controls.jumpAttack) && fighter.animations.jumpAttack) {
    if (fighter.onGround) {
      fighter.velocityY = -fighter.jumpPower * 0.68;
      fighter.onGround = false;
    }

    startTimedAction(fighter, "jumpAttack", 7);
    updatePhysics(fighter);
    return;
  }

  if (pressedKeys.has(controls.dashAttack) && fighter.onGround && fighter.animations.dashAttack) {
    startTimedAction(fighter, "dashAttack", 7);
    updatePhysics(fighter);
    return;
  }

  if (pressedKeys.has(controls.energyWave) && fighter.onGround && fighter.animations.energyWave) {
    startTimedAction(fighter, "energyWave", 7);
    updatePhysics(fighter);
    return;
  }

  if (pressedKeys.has(controls.punch) && fighter.onGround && fighter.animations.punch) {
    startTimedAction(fighter, "punch", 7);
    updatePhysics(fighter);
    return;
  }

  if (pressedKeys.has(controls.kick) && fighter.onGround && fighter.animations.kick) {
    startTimedAction(fighter, "kick", 6);
    updatePhysics(fighter);
    return;
  }

  if (keys.has(controls.block) && fighter.onGround && fighter.animations.block) {
    fighter.action = "block";
    updatePhysics(fighter);
    return;
  }

  if (keys.has(controls.crouch) && fighter.onGround && fighter.animations.crouch) {
    fighter.action = "crouch";
    updatePhysics(fighter);
    return;
  }

  if (pressedKeys.has(controls.jump) && fighter.onGround) {
    fighter.velocityY = -fighter.jumpPower;
    fighter.onGround = false;
  }

  if (movingLeft && !movingRight) {
    fighter.x -= speed;
    fighter.facing = -1;
  }

  if (movingRight && !movingLeft) {
    fighter.x += speed;
    fighter.facing = 1;
  }

  updatePhysics(fighter);
  clampFighter(fighter);

  if (!fighter.onGround) {
    fighter.action = "jump";
  } else {
    fighter.action = running ? "run" : movingLeft || movingRight ? "walk" : "idle";
  }
}

function updatePhysics(fighter) {
  fighter.velocityY += GRAVITY;
  fighter.y += fighter.velocityY;

  if (fighter.y >= FLOOR_Y) {
    fighter.y = FLOOR_Y;
    fighter.velocityY = 0;
    fighter.onGround = true;
  }
}

function clampFighter(fighter) {
  fighter.x = Math.max(85, Math.min(WIDTH - 85, fighter.x));
}

function startTimedAction(fighter, action, ticksPerFrame) {
  fighter.action = action;
  fighter.lockedAction = action;
  fighter.actionDuration = fighter.animations[action].frames.length * ticksPerFrame;
  fighter.actionTimer = fighter.actionDuration;
  fighter.hasHit = false;
}

function resolveHits() {
  for (const attacker of fighters) {
    const attack = attackProfiles[attacker.lockedAction];

    if (!attack || attacker.actionTimer <= 0 || attacker.hasHit || attacker.isKO) {
      continue;
    }

    const progress = 1 - attacker.actionTimer / attacker.actionDuration;

    if (progress < attack.activeFrom || progress > attack.activeTo) {
      continue;
    }

    const target = fighters.find((fighter) => fighter !== attacker);

    if (!target || target.isKO || !isAttackInRange(attacker, target, attack.range)) {
      continue;
    }

    applyHit(attacker, target, attack.damage);
    attacker.hasHit = true;
  }
}

function isAttackInRange(attacker, target, range) {
  const forwardDistance = (target.x - attacker.x) * attacker.facing;

  return forwardDistance > 0 && forwardDistance <= range && Math.abs(target.y - attacker.y) < 180;
}

function applyHit(attacker, target, damage) {
  const isBlocked = target.action === "block" && isFacing(target, attacker);
  const appliedDamage = isBlocked ? Math.ceil(damage * 0.25) : damage;

  target.health = Math.max(0, target.health - appliedDamage);

  if (target.health === 0) {
    startKO(target);
    return;
  }

  if (!isBlocked) {
    startTimedAction(target, "hitHurt", 7);
    target.x -= attacker.facing * 12;
    clampFighter(target);
  }
}

function isFacing(fighter, other) {
  return (other.x - fighter.x) * fighter.facing > 0;
}

function startKO(fighter) {
  fighter.health = 0;
  fighter.isKO = true;
  fighter.action = "ko";
  fighter.lockedAction = "ko";
  fighter.actionTimer = 0;
  fighter.actionDuration = 0;
  fighter.velocityY = 0;
  fighter.y = FLOOR_Y;
}

function drawShadow(fighter) {
  const airDistance = Math.max(0, FLOOR_Y - fighter.y);
  const shadowScale = Math.max(0.42, 1 - airDistance / 260);

  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(fighter.x, FLOOR_Y + 8, 76 * shadowScale, 16 * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawFighter(fighter) {
  const animation = fighter.animations[fighter.action] ?? fighter.animations.idle;
  const source = animation.frames[getFrameIndex(fighter, animation)];
  const drawWidth = source.width * source.scale;
  const drawHeight = source.height * source.scale;
  const drawY = fighter.y - drawHeight;

  ctx.save();

  if (fighter.facing === -1) {
    ctx.translate(fighter.x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(
      animation.image,
      source.x,
      source.y,
      source.width,
      source.height,
      -drawWidth * source.anchorX,
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
      fighter.x - drawWidth * source.anchorX,
      drawY,
      drawWidth,
      drawHeight
    );
  }

  ctx.restore();
}

function getFrameIndex(fighter, animation) {
  if (fighter.actionTimer > 0 && fighter.actionDuration > 0) {
    return Math.min(
      animation.frames.length - 1,
      Math.floor((1 - fighter.actionTimer / fighter.actionDuration) * animation.frames.length)
    );
  }

  if (fighter.action === "jump") {
    return getJumpFrameIndex(fighter);
  }

  return Math.floor(performance.now() / animation.frameDuration) % animation.frames.length;
}

function getJumpFrameIndex(fighter) {
  if (fighter.velocityY < -11) {
    return 0;
  }

  if (fighter.velocityY < -4) {
    return 1;
  }

  if (fighter.velocityY < 2) {
    return 2;
  }

  if (fighter.velocityY < 9) {
    return 3;
  }

  return 4;
}

function drawHud() {
  ctx.textAlign = "left";
  ctx.fillStyle = fighters[0].color;
  ctx.font = "900 22px Arial";
  ctx.fillText("P1 CAT MAN", 28, 54);
  ctx.font = "14px Arial";
  ctx.fillText(formatAction(fighters[0].action), 28, 78);
  drawHealthBar(28, 88, 240, fighters[0]);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("A/D move  LShift run  W jump  F/G hit  S crouch  E block  Q/R/T specials", 28, 124);

  ctx.textAlign = "right";
  ctx.fillStyle = fighters[1].color;
  ctx.font = "900 22px Arial";
  ctx.fillText("P2 CAT GIRL", WIDTH - 28, 54);
  ctx.font = "14px Arial";
  ctx.fillText(formatAction(fighters[1].action), WIDTH - 28, 78);
  drawHealthBar(WIDTH - 268, 88, 240, fighters[1]);
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("Arrow keys move/jump  RShift run  J punch  K kick", WIDTH - 28, 124);
}

function drawHealthBar(x, y, width, fighter) {
  const healthRatio = fighter.health / fighter.maxHealth;

  ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
  ctx.fillRect(x, y, width, 12);

  ctx.fillStyle = fighter.color;
  ctx.fillRect(x, y, width * healthRatio, 12);

  ctx.strokeStyle = "rgba(219, 234, 254, 0.55)";
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, 12);
}

function formatAction(action) {
  const labels = {
    dashAttack: "DASH ATTACK",
    energyWave: "ENERGY WAVE",
    hitHurt: "HIT / HURT",
    jumpAttack: "JUMP ATTACK",
    ko: "KO",
  };

  return labels[action] ?? action.toUpperCase();
}

function decrementActionTimers() {
  for (const fighter of fighters) {
    if (fighter.actionTimer > 0) {
      fighter.actionTimer -= 1;

      if (fighter.actionTimer === 0) {
        fighter.actionDuration = 0;
        fighter.lockedAction = "idle";
      }
    }
  }
}

function gameLoop() {
  for (const fighter of fighters) {
    updateFighter(fighter);
  }

  resolveHits();
  drawBackground();

  for (const fighter of fighters) {
    drawShadow(fighter);
  }

  for (const fighter of fighters) {
    drawFighter(fighter);
  }

  drawHud();
  decrementActionTimers();
  pressedKeys.clear();
  requestAnimationFrame(gameLoop);
}

function startWhenReady() {
  const allSprites = Object.values(sprites).flatMap((spriteGroup) => Object.values(spriteGroup));
  let loadedImages = 0;

  function markLoaded() {
    loadedImages += 1;

    if (loadedImages === allSprites.length) {
      requestAnimationFrame(gameLoop);
    }
  }

  for (const image of allSprites) {
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

  if (controlCodes.has(event.code)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keys.delete(event.code);
});

startWhenReady();
