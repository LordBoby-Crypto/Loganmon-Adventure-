(() => {
  const logan = document.getElementById("logan");
  const dialog = document.getElementById("dialog");
  const optionLogan = document.getElementById("optionLogan");
  const optionSomeone = document.getElementById("optionSomeone");

  const stage = { width: 864, height: 576 };
  const player = { x: 480, y: 333, speed: 2.2 };
  const keys = new Set();

  let menuOpen = false;
  let menuIndex = 0;
  const menuButtons = [optionLogan, optionSomeone];

  /*
    Collision rectangles are screen coordinates for the displayed 864x576 scene.
    I loosened the PC/desk area and stairs so Logan can reach:
    - the blue PC chair/terminal area
    - the staircase landing
  */
  const solids = [
    // top wall strip
    { x: 0, y: 0, w: 864, h: 98 },

    // upper-left desk/table, but leave lower blue-PC access open
    { x: 0, y: 98, w: 154, h: 82 },
    { x: 0, y: 180, w: 70, h: 46 },

    // drawer/bookshelf block left of main shelves
    { x: 158, y: 96, w: 170, h: 120 },

    // central bookcase
    { x: 330, y: 78, w: 200, h: 142 },

    // top-right long counter
    { x: 530, y: 133, w: 334, h: 62 },

    // stair rail/platform, leaving open path on lower/right side
    { x: 632, y: 196, w: 96, h: 62 },
    { x: 708, y: 176, w: 72, h: 82 },

    // bed
    { x: 78, y: 344, w: 176, h: 128 },

    // central PC/table on rug
    { x: 394, y: 278, w: 120, h: 86 },

    // room bounds
    { x: 0, y: 548, w: 864, h: 28 },
    { x: 0, y: 0, w: 32, h: 576 },
    { x: 832, y: 0, w: 32, h: 576 }
  ];

  // Zones where E/Enter can open interactions.
  const pcZone = { x: 52, y: 178, w: 95, h: 70 };
  const stairZone = { x: 724, y: 190, w: 96, h: 96 };

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

  function currentFeetBox() {
    return feetBoxAt(player.x, player.y);
  }

  function near(rect) {
    return intersects(currentFeetBox(), rect);
  }

  function setMenuSelection(index) {
    menuIndex = index;
    menuButtons.forEach((button, i) => button.classList.toggle("selected", i === menuIndex));
  }

  function openPcMenu() {
    menuOpen = true;
    dialog.classList.remove("hidden");
    setMenuSelection(0);
  }

  function closeMenu() {
    menuOpen = false;
    dialog.classList.add("hidden");
  }

  function selectMenuOption() {
    const message = menuIndex === 0
      ? "Logan's PC selected: item storage will be built later."
      : "Someone's PC selected: Loganmon storage boxes will be built later.";

    dialog.innerHTML = `
      <div class="dialog-title">${menuIndex === 0 ? "Logan's PC" : "Someone's PC"}</div>
      <p>${message}</p>
      <p class="dialog-hint">Press Esc, E, or Enter to close.</p>
    `;
  }

  function interact() {
    if (near(pcZone)) {
      openPcMenu();
      return;
    }

    if (near(stairZone)) {
      menuOpen = true;
      dialog.classList.remove("hidden");
      dialog.innerHTML = `
        <div class="dialog-title">Stairs</div>
        <p>The stairs will lead downstairs once the next room is built.</p>
        <p class="dialog-hint">Press Esc, E, or Enter to close.</p>
      `;
    }
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
    if (!menuOpen) {
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
    }

    logan.style.left = `${Math.round(player.x)}px`;
    logan.style.top = `${Math.round(player.y)}px`;

    requestAnimationFrame(update);
  }

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (menuOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (key === "arrowup" || key === "w") {
        event.preventDefault();
        setMenuSelection(Math.max(0, menuIndex - 1));
        return;
      }

      if (key === "arrowdown" || key === "s") {
        event.preventDefault();
        setMenuSelection(Math.min(menuButtons.length - 1, menuIndex + 1));
        return;
      }

      if (key === "enter" || key === "e") {
        event.preventDefault();
        if (dialog.querySelector(".menu-option")) selectMenuOption();
        else closeMenu();
        return;
      }

      return;
    }

    if (["arrowleft", "arrowright", "arrowup", "arrowdown", "w", "a", "s", "d"].includes(key)) {
      event.preventDefault();
      keys.add(key);
      return;
    }

    if (key === "enter" || key === "e") {
      event.preventDefault();
      interact();
    }
  });

  window.addEventListener("keyup", event => {
    keys.delete(event.key.toLowerCase());
  });

  optionLogan.addEventListener("click", () => {
    setMenuSelection(0);
    selectMenuOption();
  });

  optionSomeone.addEventListener("click", () => {
    setMenuSelection(1);
    selectMenuOption();
  });

  update();
})();
