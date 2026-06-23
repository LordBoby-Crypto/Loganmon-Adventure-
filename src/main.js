(() => {
  const logan = document.getElementById("logan");

  const stage = { width: 864, height: 576 };
  const player = { x: 480, y: 333, w: 96, h: 96, speed: 2.2 };
  const keys = new Set();

  const solids = [
    { x: 0, y: 0, w: 864, h: 122 },
    { x: 0, y: 122, w: 159, h: 92 },
    { x: 159, y: 92, w: 245, h: 126 },
    { x: 404, y: 79, w: 170, h: 128 },
    { x: 574, y: 137, w: 290, h: 76 },
    { x: 576, y: 178, w: 256, h: 102 },
    { x: 72, y: 335, w: 190, h: 137 },
    { x: 394, y: 270, w: 128, h: 92 },
    { x: 0, y: 546, w: 864, h: 30 },
    { x: 0, y: 0, w: 28, h: 576 },
    { x: 836, y: 0, w: 28, h: 576 }
  ];

  function feetBoxAt(x, y) {
    return { x: x + 32, y: y + 66, w: 32, h: 24 };
  }

  function intersects(a, b) {
    return a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y;
  }

  function canMoveTo(x, y) {
    const feet = feetBoxAt(x, y);

    if (feet.x < 0 || feet.y < 0 || feet.x + feet.w > stage.width || feet.y + feet.h > stage.height) {
      return false;
    }

    return !solids.some(rect => intersects(feet, rect));
  }

  function moveAxis(dx, dy) {
    if (dx !== 0) {
      const nx = player.x + dx;
      if (canMoveTo(nx, player.y)) player.x = nx;
    }

    if (dy !== 0) {
      const ny = player.y + dy;
      if (canMoveTo(player.x, ny)) player.y = ny;
    }
  }

  function update() {
    let dx = 0;
    let dy = 0;

    if (keys.has("arrowleft") || keys.has("a")) dx -= player.speed;
    if (keys.has("arrowright") || keys.has("d")) dx += player.speed;
    if (keys.has("arrowup") || keys.has("w")) dy -= player.speed;
    if (keys.has("arrowdown") || keys.has("s")) dy += player.speed;

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    moveAxis(dx, dy);

    logan.style.left = `${Math.round(player.x)}px`;
    logan.style.top = `${Math.round(player.y)}px`;

    requestAnimationFrame(update);
  }

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();
    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      keys.add(key);
    }
  });

  window.addEventListener("keyup", event => {
    keys.delete(event.key.toLowerCase());
  });

  update();
})();
