(() => {
  const roomImg = document.getElementById("room");
  const logan = document.getElementById("logan");
  const dialog = document.getElementById("dialog");
  const gameStage = document.getElementById("gameStage");

  const rooms = {
    bedroom: {
      src: "assets/rooms/logans-bedroom.png",
      width: 576,
      height: 411,
      start: { x: 480, y: 333 },
      solids: [
        { x: 0, y: 0, w: 576, h: 88 },
        { x: 0, y: 383, w: 576, h: 28 },
        { x: 0, y: 0, w: 32, h: 411 },
        { x: 544, y: 0, w: 32, h: 411 },
        { x: 72, y: 338, w: 184, h: 132 },
        { x: 42, y: 96, w: 120, h: 74 },
        { x: 166, y: 100, w: 150, h: 118 },
        { x: 334, y: 88, w: 202, h: 126 },
        { x: 536, y: 132, w: 296, h: 60 },
        { x: 398, y: 286, w: 118, h: 78 }
      ],
      pcZone: { x: 32, y: 164, w: 140, h: 112 },
      stairsZone: { x: 616, y: 166, w: 218, h: 148 },
      stairsTo: "downstairs"
    },
    downstairs: {
      src: "assets/rooms/downstairs.png",
      width: 612,
      height: 477,
      start: { x: 476, y: 56 },
      solids: [
        { x: 0, y: 0, w: 612, h: 48 },
        { x: 0, y: 449, w: 612, h: 28 },
        { x: 0, y: 0, w: 28, h: 477 },
        { x: 584, y: 0, w: 28, h: 477 },
        { x: 0, y: 48, w: 263, h: 86 },
        { x: 159, y: 162, w: 214, h: 128 },
        { x: 0, y: 359, w: 62, h: 88 },
        { x: 550, y: 359, w: 62, h: 88 }
      ],
      stairsZone: { x: 422, y: 25, w: 180, h: 150 },
      stairsTo: "bedroom"
    }
  };

  let currentRoom = "bedroom";
  const player = { x: rooms.bedroom.start.x, y: rooms.bedroom.start.y, speed: 2.2 };
  const keys = new Set();
  let menuOpen = false;
  let pcIndex = 0;
  let menuMode = "message";

  function setStage(room) {
    gameStage.style.width = room.width + "px";
    gameStage.style.height = room.height + "px";
    roomImg.style.width = room.width + "px";
    roomImg.style.height = room.height + "px";
  }

  function changeRoom(name) {
    currentRoom = name;
    const room = rooms[name];
    roomImg.src = room.src;
    setStage(room);
    player.x = room.start.x;
    player.y = room.start.y;
    closeDialog();
  }

  function feetBoxAt(x, y) {
    return { x: x + 34, y: y + 68, w: 28, h: 20 };
  }

  function intersects(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function canMoveTo(x, y) {
    const room = rooms[currentRoom];
    const feet = feetBoxAt(x, y);
    if (feet.x < 0 || feet.y < 0 || feet.x + feet.w > room.width || feet.y + feet.h > room.height) return false;
    return !room.solids.some(rect => intersects(feet, rect));
  }

  function near(rect) {
    return rect && intersects(feetBoxAt(player.x, player.y), rect);
  }

  function openDialog(html, mode = "message") {
    menuOpen = true;
    menuMode = mode;
    dialog.innerHTML = html;
    dialog.classList.remove("hidden");
  }

  function closeDialog() {
    menuOpen = false;
    dialog.classList.add("hidden");
  }

  function setPcSelection(index) {
    pcIndex = index;
    [...dialog.querySelectorAll(".menu-option")].forEach((b, i) => b.classList.toggle("selected", i === pcIndex));
  }

  function openPcMenu() {
    openDialog(`
      <div class="dialog-title">PC</div>
      <button class="menu-option selected"><strong>Logan's PC</strong><span>Store or withdraw items.</span></button>
      <button class="menu-option"><strong>Someone's PC</strong><span>Access Pokémon Storage Boxes to deposit, withdraw, or swap team members.</span></button>
      <p class="dialog-hint">Press E/Enter to select. Press Esc to close.</p>
    `, "pc");
    [...dialog.querySelectorAll(".menu-option")].forEach((button, index) => {
      button.addEventListener("click", () => {
        pcIndex = index;
        selectPcOption();
      });
    });
    setPcSelection(0);
  }

  function selectPcOption() {
    if (pcIndex === 0) {
      openDialog(`<div class="dialog-title">Logan's PC</div><p>Item storage will be built later.</p><p class="dialog-hint">Press Esc, E, or Enter to close.</p>`);
    } else {
      openDialog(`<div class="dialog-title">Someone's PC</div><p>Loganmon storage boxes will be built later.</p><p class="dialog-hint">Press Esc, E, or Enter to close.</p>`);
    }
  }

  function interact() {
    const room = rooms[currentRoom];

    if (currentRoom === "bedroom" && near(room.pcZone)) {
      openPcMenu();
      return;
    }

    if (near(room.stairsZone)) {
      changeRoom(room.stairsTo);
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
      let dx = 0, dy = 0;
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

    logan.style.left = Math.round(player.x) + "px";
    logan.style.top = Math.round(player.y) + "px";
    requestAnimationFrame(update);
  }

  window.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (menuOpen) {
      if (key === "escape") {
        event.preventDefault();
        closeDialog();
        return;
      }
      if (menuMode === "pc" && (key === "arrowup" || key === "w")) {
        event.preventDefault();
        setPcSelection(Math.max(0, pcIndex - 1));
        return;
      }
      if (menuMode === "pc" && (key === "arrowdown" || key === "s")) {
        event.preventDefault();
        setPcSelection(Math.min(1, pcIndex + 1));
        return;
      }
      if (key === "enter" || key === "e") {
        event.preventDefault();
        if (menuMode === "pc") selectPcOption();
        else closeDialog();
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

  window.addEventListener("keyup", event => keys.delete(event.key.toLowerCase()));

  setStage(rooms.bedroom);
  update();
})();
