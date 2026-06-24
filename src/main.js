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
  let menuMode = "pc";
  const menuButtons = [optionLogan, optionSomeone];

  /*
    v6 collision rule:
    Do NOT try to perfectly trace every object yet.
    Only block the obvious furniture and room bounds.
    The PC and stairs are deliberately reachable now.
  */
  const solids = [
    // room edges
    { x: 0, y: 0, w: 864, h: 88 },
    { x: 0, y: 548, w: 864, h: 28 },
    { x: 0, y: 0, w: 32, h: 576 },
    { x: 832, y: 0, w: 32, h: 576 },

    // bed
    { x: 72, y: 338, w: 184, h: 132 },

    // top-left desk/cabinet, but PC chair area is open
    { x: 42, y: 96, w: 120, h: 74 },

    // yellow drawer and shelf blocks
    { x: 166, y: 100, w: 150, h: 118 },
    { x: 334, y: 88, w: 202, h: 126 },

    // long upper-right counter only
    { x: 536, y: 132, w: 296, h: 60 },

    // center chair/computer on rug
    { x: 398, y: 286, w: 118, h: 78 }
  ];

  // Bigger zones so you can interact by standing near the object, not perfectly on it.
  const pcZone = { x: 32, y: 164, w: 140, h: 112 };
  const stairZone = { x: 616, y: 166, w: 218, h: 148 };

  function feetBoxAt(x, y) {
    return { x: x + 34, y: y + 68, w: 28, h: 20 };
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

  function resetPcMenuHtml() {
    dialog.innerHTML = `
      <div class="dialog-title">PC</div>
      <button class="menu-option selected" id="optionLogan">
        <strong>Logan's PC</strong>
        <span>Store or withdraw items.</span>
      </button>
      <button class="menu-option" id="optionSomeone">
        <strong>Someone's PC</strong>
        <span>Access Pokémon Storage Boxes to deposit, withdraw, or swap team members.</span>
      </button>
      <p class="dialog-hint">Press E/Enter to select. Press Esc to close.</p>
    `;
    menuButtons[0] = document.getElementById("optionLogan");
    menuButtons[1] = document.getElementById("optionSomeone");

    menuButtons[0].addEventListener("click", () => {
      setMenuSelection(0);
      selectMenuOption();
    });

    menuButtons[1].addEventListener("click", () => {
      setMenuSelection(1);
      selectMenuOption();
    });
  }

  function openPcMenu() {
    menuMode = "pc";
    menuOpen = true;
    resetPcMenuHtml();
    dialog.classList.remove("hidden");
    setMenuSelection(0);
  }

  function openMessage(title, body) {
    menuMode = "message";
    menuOpen = true;
    dialog.classList.remove("hidden");
    dialog.innerHTML = `
      <div class="dialog-title">${title}</div>
      <p>${body}</p>
      <p class="dialog-hint">Press Esc, E, or Enter to close.</p>
    `;
  }

  function closeMenu() {
    menuOpen = false;
    dialog.classList.add("hidden");
  }

  function selectMenuOption() {
    const message = menuIndex === 0
      ? "Logan's PC selected: item storage will be built later."
      : "Someone's PC selected: Loganmon storage boxes will be built later.";

    openMessage(menuIndex === 0 ? "Logan's PC" : "Someone's PC", message);
  }

  function interact() {
    if (near(pcZone)) {
      openPcMenu();
      return;
    }

    if (near(stairZone)) {
      openMessage("Stairs", "The stairs will lead downstairs once the next room is built.");
      return;
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

      if (menuMode === "pc" && (key === "arrowup" || key === "w")) {
        event.preventDefault();
        setMenuSelection(Math.max(0, menuIndex - 1));
        return;
      }

      if (menuMode === "pc" && (key === "arrowdown" || key === "s")) {
        event.preventDefault();
        setMenuSelection(Math.min(menuButtons.length - 1, menuIndex + 1));
        return;
      }

      if (key === "enter" || key === "e") {
        event.preventDefault();
        if (menuMode === "pc") selectMenuOption();
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

  update();
})();
