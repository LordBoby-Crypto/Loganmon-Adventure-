(() => {
  "use strict";

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const W = canvas.width;
  const H = canvas.height;
  const TILE = 32;
  const MAP_W = 20;
  const MAP_H = 15;
  const SAVE_KEY = "loganmonPrototypeV1Save";

  const TYPE_CHART = {
    Earth: { weak: ["Construct"], strong: [] },
    Redstone: { weak: ["Aqua", "Iron", "Stone"], strong: ["Armor", "Frost", "Grass", "Lava"] },
    Aqua: { weak: ["Star", "Armor"], strong: ["Redstone", "Iron", "Stone"] },
    Star: { weak: ["Iron"], strong: ["Aqua", "Beast"] },
    Armor: { weak: ["Redstone", "Frost", "Swamp", "Beast", "Grass"], strong: ["Aqua", "Iron", "Stone"] },
    Frost: { weak: ["Redstone", "Construct", "Stone", "Lava"], strong: ["Armor", "Iron", "Beast", "Apex"] },
    Construct: { weak: ["Beast", "Void"], strong: ["Earth", "Frost", "Stone", "Shadow", "Lava"] },
    Swamp: { weak: ["Iron", "Void"], strong: ["Armor"] },
    Iron: { weak: ["Aqua", "Armor", "Frost"], strong: ["Redstone", "Star", "Swamp", "Stone", "Lava"] },
    Beast: { weak: ["Star", "Frost", "Stone"], strong: ["Armor", "Construct", "Grass"] },
    Void: { weak: ["Grass", "Ender", "Shadow"], strong: ["Construct", "Swamp"] },
    Grass: { weak: ["Redstone", "Beast", "Stone"], strong: ["Armor", "Void", "Shadow"] },
    Stone: { weak: ["Aqua", "Armor", "Construct", "Iron", "Lava"], strong: ["Redstone", "Frost", "Beast", "Grass"] },
    Ender: { weak: ["Ender", "Shadow"], strong: ["Void", "Ender"] },
    Apex: { weak: ["Frost", "Apex"], strong: ["Apex"] },
    Shadow: { weak: ["Construct", "Grass"], strong: ["Void", "Ender"] },
    Lava: { weak: ["Redstone", "Construct", "Iron"], strong: ["Frost", "Stone"] }
  };

  const MOVES = {
    Tackle: { name: "Tackle", type: "Earth", power: 35, accuracy: 95 },
    Scratch: { name: "Scratch", type: "Construct", power: 35, accuracy: 95 },
    ArmorBash: { name: "Armor Bash", type: "Armor", power: 42, accuracy: 92 },
    RedSpark: { name: "Red Spark", type: "Redstone", power: 42, accuracy: 92 },
    AquaBubble: { name: "Aqua Bubble", type: "Aqua", power: 42, accuracy: 92 },
    Peck: { name: "Peck", type: "Beast", power: 35, accuracy: 95 },
    QuickBite: { name: "Quick Bite", type: "Earth", power: 36, accuracy: 95 },
    LeafNibble: { name: "Leaf Nibble", type: "Grass", power: 35, accuracy: 95 },
    MudSplash: { name: "Mud Splash", type: "Swamp", power: 35, accuracy: 95 },
    StoneChip: { name: "Stone Chip", type: "Stone", power: 38, accuracy: 92 },
    IronTap: { name: "Iron Tap", type: "Iron", power: 38, accuracy: 92 },
    StarZap: { name: "Star Zap", type: "Star", power: 42, accuracy: 92 }
  };

  const MONSTER_DEX = {
    Ruby: {
      type: ["Armor"], color: "#9f5d43", accent: "#dcc59a", base: { hp: 24, attack: 8, defense: 9, speed: 5 },
      moves: ["Tackle", "ArmorBash"], shape: "dog"
    },
    Rox: {
      type: ["Redstone"], color: "#c54225", accent: "#ffb34f", base: { hp: 22, attack: 9, defense: 6, speed: 8 },
      moves: ["Scratch", "RedSpark"], shape: "fox"
    },
    Axeo: {
      type: ["Aqua"], color: "#2c8dcc", accent: "#9ae6ff", base: { hp: 25, attack: 7, defense: 7, speed: 6 },
      moves: ["Tackle", "AquaBubble"], shape: "axolotl"
    },
    Raven: {
      type: ["Earth", "Beast"], color: "#30343f", accent: "#8ea3b9", base: { hp: 18, attack: 6, defense: 5, speed: 8 },
      moves: ["Tackle", "Peck"], shape: "bird"
    },
    Silverfiche: {
      type: ["Earth"], color: "#9aa0a8", accent: "#e2e7ec", base: { hp: 19, attack: 6, defense: 5, speed: 7 },
      moves: ["QuickBite", "Tackle"], shape: "mouse"
    },
    Worm: {
      type: ["Grass"], color: "#4e9c44", accent: "#d9ff83", base: { hp: 18, attack: 5, defense: 6, speed: 4 },
      moves: ["LeafNibble", "Tackle"], shape: "worm"
    },
    Cater: {
      type: ["Grass", "Swamp"], color: "#5ca33a", accent: "#6a5a7b", base: { hp: 18, attack: 5, defense: 6, speed: 5 },
      moves: ["LeafNibble", "MudSplash"], shape: "bug"
    },
    Rockie: {
      type: ["Stone", "Iron"], color: "#746b5f", accent: "#c7c1b8", base: { hp: 22, attack: 8, defense: 10, speed: 3 },
      moves: ["StoneChip", "IronTap"], shape: "rock"
    },
    Buzz: {
      type: ["Star"], color: "#f1d044", accent: "#fff6a8", base: { hp: 18, attack: 7, defense: 5, speed: 9 },
      moves: ["StarZap", "Tackle"], shape: "spark"
    }
  };

  const TILE_INFO = {
    "#": { name: "wall", color: "#23392c", edge: "#17261e", pass: false },
    ".": { name: "floor", color: "#d7c38c", edge: "#c8b77f", pass: true },
    ",": { name: "room floor", color: "#d7b985", edge: "#cda978", pass: true },
    "p": { name: "path", color: "#cba96b", edge: "#b9955c", pass: true },
    "g": { name: "grass", color: "#39964a", edge: "#2e7e3e", pass: true, grass: true },
    "r": { name: "red path", color: "#c05b46", edge: "#964536", pass: true },
    "s": { name: "stone", color: "#888b86", edge: "#70736f", pass: true },
    "w": { name: "water", color: "#2a7ab8", edge: "#1d5c96", pass: false },
    "b": { name: "bed", color: "#6947ab", edge: "#3e2868", pass: false },
    "C": { name: "computer", color: "#5e6d7d", edge: "#2d3540", pass: false },
    "D": { name: "door", color: "#55381f", edge: "#2f1f12", pass: true },
    "e": { name: "exit", color: "#cba96b", edge: "#b9955c", pass: true },
    "L": { name: "lab wall", color: "#8f8f96", edge: "#696971", pass: false },
    "H": { name: "house wall", color: "#a2673c", edge: "#724426", pass: false },
    "G": { name: "gym wall", color: "#934337", edge: "#5d291f", pass: false },
    "M": { name: "mart", color: "#6086bf", edge: "#3e5a82", pass: false },
    "N": { name: "center", color: "#d9dbeb", edge: "#aeb1c9", pass: false },
    "o": { name: "starter ball", color: "#f3f4f6", edge: "#ba2c2c", pass: false },
    "t": { name: "table", color: "#855c36", edge: "#54371f", pass: false },
    "x": { name: "blocked", color: "#57494c", edge: "#382f31", pass: false }
  };

  const MAPS = {
    room: {
      name: "Logan's Room",
      musicHint: "home",
      tiles: [
        "####################",
        "#..................#",
        "#..bbb.............#",
        "#..bbb.............#",
        "#..................#",
        "#............CCC...#",
        "#............CCC...#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#..................#",
        "#.........D........#",
        "##########e#########"
      ],
      warps: [
        { x: 10, y: 14, to: "mineValley", tx: 10, ty: 11 }
      ],
      npcs: []
    },
    mineValley: {
      name: "Mine Valley",
      musicHint: "town",
      tiles: [
        "#########ee#########",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#ggHHHHHppLLLLLLLgg#",
        "#ggHHHHHppLLLLLLLgg#",
        "#ggHHHDHppLLLDLLLgg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "####################"
      ],
      warps: [
        { x: 10, y: 5, to: "lab", tx: 10, ty: 13 },
        { x: 9, y: 0, to: "route1", tx: 9, ty: 13, requiresStarter: true, blockedText: ["Route 1 is too dangerous without a Loganmon.", "Grandpa is waiting at the lab."] },
        { x: 10, y: 0, to: "route1", tx: 10, ty: 13, requiresStarter: true, blockedText: ["Route 1 is too dangerous without a Loganmon.", "Grandpa is waiting at the lab."] }
      ],
      npcs: [
        { id: "marmar", name: "Marmar", x: 5, y: 10, color: "#e3a25a", dir: "down", lines: ["Marmar: Logan, Professor--I mean, Grandpa--and Lilly are waiting for you at the lab.", "Marmar: Shanon is sorry she could not make it today. She has Elite Four business to attend to."] }
      ]
    },
    lab: {
      name: "Grandpa's Lab",
      musicHint: "lab",
      tiles: [
        "LLLLLLLLLLLLLLLLLLLL",
        "L..................L",
        "L..................L",
        "L....tttttttttt....L",
        "L....t........t....L",
        "L....t..o.o.o.t....L",
        "L....t........t....L",
        "L....tttttttttt....L",
        "L..................L",
        "L..................L",
        "L..................L",
        "L..................L",
        "L..................L",
        "L.........D........L",
        "LLLLLLLLLLeLLLLLLLLL"
      ],
      warps: [
        { x: 10, y: 14, to: "mineValley", tx: 10, ty: 6 }
      ],
      npcs: [
        { id: "grandpa", name: "Grandpa", x: 10, y: 3, color: "#d7d7d7", dir: "down", lines: ["Professor: Logan, you made it!", "Professor: I have three Loganmon here on the table. Choose one when you are ready."] },
        { id: "lillyLab", name: "Lilly", x: 14, y: 8, color: "#d35fa0", dir: "left", lines: ["Lilly: Logan can pick first. That way he cannot say I chose the better one."] }
      ],
      starterBalls: [
        { x: 8, y: 5, name: "Ruby", description: "Ruby - Armor dog. Loyal and defensive." },
        { x: 10, y: 5, name: "Rox", description: "Rox - Redstone fox. Fast and clever." },
        { x: 12, y: 5, name: "Axeo", description: "Axeo - Aqua axolotl. Balanced and steady." }
      ]
    },
    route1: {
      name: "Route 1",
      musicHint: "route",
      tiles: [
        "#########ee#########",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#gggggggppggggggggg#",
        "#########ee#########"
      ],
      warps: [
        { x: 9, y: 14, to: "mineValley", tx: 9, ty: 1 },
        { x: 10, y: 14, to: "mineValley", tx: 10, ty: 1 },
        { x: 9, y: 0, to: "redGeyser", tx: 9, ty: 13 },
        { x: 10, y: 0, to: "redGeyser", tx: 10, ty: 13 }
      ],
      encounters: [
        { name: "Raven", min: 2, max: 5, rate: 55 },
        { name: "Silverfiche", min: 2, max: 4, rate: 45 }
      ],
      npcs: [
        { id: "route1PotionNpc", name: "Rookie", x: 13, y: 8, color: "#4b8bc6", dir: "left", giveOnce: "route1Potion", lines: ["Rookie: Raven can be tough for new trainers. Keep a Potion ready.", "Rookie: Here, take this Potion for the road!"], repeatLines: ["Rookie: Keep that Potion handy!"] }
      ]
    },
    redGeyser: {
      name: "Red Geyser",
      musicHint: "city",
      tiles: [
        "####################",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrGGGGGrrrrNNNNNrr#",
        "#rrGGGGGrrrrNNNNNrr#",
        "#rrGGDGGrrrrNNDNNrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrMMMMMrrrrrrrrrrr#",
        "#rrMMDMMrrrrrrrrrrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrrrrrrrrrrrrrrrrr#",
        "#rrrrrrrrpprrrrrrrr#",
        "#########ee#########"
      ],
      warps: [
        { x: 9, y: 14, to: "route1", tx: 9, ty: 1 },
        { x: 10, y: 14, to: "route1", tx: 10, ty: 1 }
      ],
      npcs: [
        { id: "gymGuard", name: "Gym Guard", x: 6, y: 5, color: "#3d3d3d", dir: "down", lines: ["Gym Guard: Hold it. Red Gym is for advanced trainers only.", "Gym Guard: Come back when you have seven badges.", "Gym Guard: Leader Zach only battles trainers who have proven themselves."] },
        { id: "nurse", name: "Nurse", x: 14, y: 5, color: "#e6e6f8", dir: "down", nurse: true, lines: ["Nurse: Welcome to the Logan Center.", "Nurse: Your Loganmon are fully healed!"] },
        { id: "v1Guide", name: "Guide", x: 14, y: 10, color: "#58a65c", dir: "left", lines: ["Guide: Prototype V1 ends here for now.", "Guide: Next build should add Route 2 South, Red Forest, Stone City, and Stone Gym."] }
      ]
    }
  };

  function validateMaps() {
    for (const [id, map] of Object.entries(MAPS)) {
      if (map.tiles.length !== MAP_H) throw new Error(`${id} has ${map.tiles.length} rows`);
      map.tiles.forEach((row, index) => {
        if (row.length !== MAP_W) throw new Error(`${id} row ${index} has ${row.length} columns: ${row}`);
      });
    }
  }

  validateMaps();

  const game = {
    state: "title",
    titleIndex: 0,
    mapId: "room",
    player: { x: 10, y: 12, dir: "down" },
    flags: {},
    inventory: { potions: 0, balls: 0, logandex: false },
    party: [],
    dialog: { lines: [], index: 0, after: null },
    choice: { prompt: "", options: [], index: 0, after: null },
    battle: null,
    message: "",
    messageTimer: 0,
    screenFlash: 0
  };

  const DIRS = {
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
    left: { dx: -1, dy: 0 },
    right: { dx: 1, dy: 0 }
  };

  function startNewGame() {
    game.state = "overworld";
    game.titleIndex = 0;
    game.mapId = "room";
    game.player = { x: 10, y: 12, dir: "down" };
    game.flags = { introSeen: true };
    game.inventory = { potions: 0, balls: 0, logandex: false };
    game.party = [];
    saveGame();
    openDialog([
      "Lilly: Logan! Get up! We are getting our first Loganmon today!",
      "Tip: Walk to the computer in your room and press Enter to check it.",
      "Then head outside and go to Grandpa's lab."
    ]);
  }

  function saveGame() {
    const data = {
      mapId: game.mapId,
      player: game.player,
      flags: game.flags,
      inventory: game.inventory,
      party: game.party
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    showMessage("Game saved");
  }

  function hasSave() {
    return Boolean(localStorage.getItem(SAVE_KEY));
  }

  function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    try {
      const data = JSON.parse(raw);
      game.mapId = data.mapId || "room";
      game.player = data.player || { x: 10, y: 12, dir: "down" };
      game.flags = data.flags || {};
      game.inventory = data.inventory || { potions: 0, balls: 0, logandex: false };
      game.party = data.party || [];
      game.state = "overworld";
      showMessage("Loaded save");
      return true;
    } catch (error) {
      console.error(error);
      localStorage.removeItem(SAVE_KEY);
      return false;
    }
  }

  function showMessage(text) {
    game.message = text;
    game.messageTimer = 150;
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function currentMap() {
    return MAPS[game.mapId];
  }

  function tileAt(map, x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return "#";
    return map.tiles[y][x];
  }

  function tileInfo(char) {
    return TILE_INFO[char] || TILE_INFO["."];
  }

  function npcAt(map, x, y) {
    return (map.npcs || []).find(npc => npc.x === x && npc.y === y);
  }

  function createMonster(name, level) {
    const dex = MONSTER_DEX[name];
    if (!dex) throw new Error(`Unknown Loganmon ${name}`);
    const stats = calculateStats(dex.base, level);
    return {
      uid: `${name}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      level,
      type: dex.type.slice(),
      maxHp: stats.hp,
      hp: stats.hp,
      attack: stats.attack,
      defense: stats.defense,
      speed: stats.speed,
      moves: dex.moves.slice(0, 4),
      exp: 0
    };
  }

  function calculateStats(base, level) {
    return {
      hp: Math.floor(base.hp + level * 3.4),
      attack: Math.floor(base.attack + level * 1.5),
      defense: Math.floor(base.defense + level * 1.35),
      speed: Math.floor(base.speed + level * 1.25)
    };
  }

  function refreshStats(mon) {
    const dex = MONSTER_DEX[mon.name];
    const oldMax = mon.maxHp;
    const stats = calculateStats(dex.base, mon.level);
    mon.maxHp = stats.hp;
    mon.attack = stats.attack;
    mon.defense = stats.defense;
    mon.speed = stats.speed;
    mon.hp = clamp(mon.hp + (mon.maxHp - oldMax), 1, mon.maxHp);
  }

  function firstAlivePartyMember() {
    return game.party.find(mon => mon.hp > 0) || game.party[0];
  }

  function healParty() {
    for (const mon of game.party) mon.hp = mon.maxHp;
  }

  function getTypeEffectiveness(moveType, defenderTypes) {
    let modifier = 1;
    for (const defenderType of defenderTypes) {
      const move = TYPE_CHART[moveType];
      if (!move) continue;
      if (move.strong.includes(defenderType)) modifier *= 2;
      if (move.weak.includes(defenderType)) modifier *= 0.5;
    }
    return modifier;
  }

  function formatTypes(types) {
    return types.join("/");
  }

  function openDialog(lines, after = null) {
    game.dialog = { lines: lines.slice(), index: 0, after };
    game.state = "dialog";
  }

  function openChoice(prompt, options, after) {
    game.choice = { prompt, options, index: 0, after };
    game.state = "choice";
  }

  function advanceDialog() {
    game.dialog.index += 1;
    if (game.dialog.index >= game.dialog.lines.length) {
      const after = game.dialog.after;
      game.dialog = { lines: [], index: 0, after: null };
      game.state = "overworld";
      if (after) after();
    }
  }

  function tryMove(dir) {
    if (game.state !== "overworld") return;
    const vector = DIRS[dir];
    game.player.dir = dir;
    const map = currentMap();
    const nx = game.player.x + vector.dx;
    const ny = game.player.y + vector.dy;
    const targetTile = tileAt(map, nx, ny);
    const targetInfo = tileInfo(targetTile);
    const targetNpc = npcAt(map, nx, ny);

    if (!targetInfo.pass || targetNpc) return;

    const warp = (map.warps || []).find(w => w.x === nx && w.y === ny);
    if (warp && warp.requiresStarter && !game.flags.hasStarter) {
      openDialog(warp.blockedText || ["You cannot go that way yet."]);
      return;
    }

    game.player.x = nx;
    game.player.y = ny;

    if (warp) {
      changeMap(warp.to, warp.tx, warp.ty);
      return;
    }

    maybeStartWildEncounter();
  }

  function changeMap(id, x, y) {
    game.mapId = id;
    game.player.x = x;
    game.player.y = y;
    game.screenFlash = 12;
    saveGameQuietly();
  }

  function saveGameQuietly() {
    const data = {
      mapId: game.mapId,
      player: game.player,
      flags: game.flags,
      inventory: game.inventory,
      party: game.party
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  }

  function frontTile() {
    const vector = DIRS[game.player.dir];
    return { x: game.player.x + vector.dx, y: game.player.y + vector.dy };
  }

  function interact() {
    if (game.state !== "overworld") return;
    const map = currentMap();
    const front = frontTile();
    const npc = npcAt(map, front.x, front.y);

    if (npc) {
      faceNpcTowardPlayer(npc);
      if (npc.nurse) {
        healParty();
        saveGameQuietly();
        openDialog(npc.lines);
        return;
      }
      if (npc.giveOnce) {
        if (!game.flags[npc.giveOnce]) {
          game.flags[npc.giveOnce] = true;
          game.inventory.potions += 1;
          saveGameQuietly();
          openDialog([...npc.lines, "Received 1 Potion."]);
        } else {
          openDialog(npc.repeatLines || npc.lines);
        }
        return;
      }
      openDialog(npc.lines);
      return;
    }

    const tile = tileAt(map, front.x, front.y);
    if (game.mapId === "room" && tile === "C") {
      if (!game.flags.pcPotion) {
        game.flags.pcPotion = true;
        game.inventory.potions += 1;
        saveGameQuietly();
        openDialog(["Logan checked the PC.", "There was a Potion stored inside.", "Received 1 Potion."]);
      } else {
        openDialog(["The PC is empty now."]);
      }
      return;
    }

    if (game.mapId === "lab") {
      const starterBall = (map.starterBalls || []).find(ball => ball.x === front.x && ball.y === front.y);
      if (starterBall) {
        handleStarterBall(starterBall);
        return;
      }
    }

    if (tile === "D") {
      openDialog(["A door."]);
      return;
    }

    if (game.mapId === "redGeyser") {
      if (tile === "N") {
        healParty();
        saveGameQuietly();
        openDialog(["This is the Logan Center.", "Your Loganmon are fully healed!"]);
        return;
      }
      if (tile === "M") {
        openDialog(["This is the Logan Mart.", "The shop is closed in Prototype V1, but you already have enough demo items."]);
        return;
      }
      if (tile === "G") {
        openDialog(["Red Gym is locked.", "Come back when you have seven badges."]);
        return;
      }
    }

    openDialog(["Nothing interesting here."]);
  }

  function faceNpcTowardPlayer(npc) {
    const dx = game.player.x - npc.x;
    const dy = game.player.y - npc.y;
    if (Math.abs(dx) > Math.abs(dy)) npc.dir = dx > 0 ? "right" : "left";
    else npc.dir = dy > 0 ? "down" : "up";
  }

  function handleStarterBall(ball) {
    if (game.flags.hasStarter) {
      openDialog([`This ball held ${ball.name}.`, "The starter table is empty now."]);
      return;
    }

    openChoice(`${ball.description}\nChoose ${ball.name}?`, ["Yes", "No"], selected => {
      if (selected === "No") {
        game.state = "overworld";
        return;
      }
      receiveStarter(ball.name);
    });
  }

  function receiveStarter(name) {
    const rivalMap = { Ruby: "Rox", Rox: "Axeo", Axeo: "Ruby" };
    const rivalStarter = rivalMap[name];
    const starter = createMonster(name, 5);
    game.party = [starter];
    game.flags.hasStarter = true;
    game.flags.starterName = name;
    game.flags.lillyStarter = rivalStarter;
    game.inventory.logandex = true;
    game.inventory.balls += 5;
    game.inventory.potions += 5;
    saveGameQuietly();

    openDialog([
      `Professor: You chose ${name}!`,
      `Lilly: Fine. Then I choose ${rivalStarter}.`,
      "Lilly: Hey, Logan! We both have Loganmon now, so let us see who is better!"
    ], () => {
      startTrainerBattle("Lilly", createMonster(rivalStarter, 5), [
        "Lilly after Logan wins: You got lucky. I am going to train up and beat you next time!",
        "Professor: Good battle, both of you.",
        "Professor: Before you go, take these.",
        "Received the Logandex, 5 Logan Balls, and 5 Potions.",
        "Professor: Head through Route 1 when you are ready. It leads to Red Geyser."
      ]);
    });
  }

  function maybeStartWildEncounter() {
    const map = currentMap();
    const info = tileInfo(tileAt(map, game.player.x, game.player.y));
    if (!info.grass || !map.encounters || !game.flags.hasStarter || Math.random() > 0.12) return;
    const entry = weightedEncounter(map.encounters);
    const enemy = createMonster(entry.name, randomInt(entry.min, entry.max));
    startWildBattle(enemy);
  }

  function weightedEncounter(entries) {
    const total = entries.reduce((sum, e) => sum + e.rate, 0);
    let roll = Math.random() * total;
    for (const entry of entries) {
      roll -= entry.rate;
      if (roll <= 0) return entry;
    }
    return entries[entries.length - 1];
  }

  function startWildBattle(enemy) {
    const player = firstAlivePartyMember();
    if (!player || player.hp <= 0) {
      openDialog(["Your Loganmon are too tired to battle.", "Find a Logan Center."]);
      return;
    }
    game.battle = makeBattle({ kind: "wild", trainerName: null, enemy, afterWinLines: [] });
    pushBattleText(`A wild ${enemy.name} appeared!`);
    game.state = "battle";
  }

  function startTrainerBattle(trainerName, enemy, afterWinLines) {
    game.battle = makeBattle({ kind: "trainer", trainerName, enemy, afterWinLines });
    pushBattleText(`${trainerName} sent out ${enemy.name}!`);
    game.state = "battle";
  }

  function makeBattle({ kind, trainerName, enemy, afterWinLines }) {
    return {
      kind,
      trainerName,
      player: firstAlivePartyMember(),
      enemy,
      afterWinLines,
      menu: "main",
      mainIndex: 0,
      moveIndex: 0,
      bagIndex: 0,
      textQueue: [],
      textIndex: 0,
      locked: false,
      finished: false,
      animationTimer: 0,
      playerShake: 0,
      enemyShake: 0
    };
  }

  function pushBattleText(text) {
    game.battle.textQueue.push(text);
  }

  function activeBattleText() {
    const battle = game.battle;
    return battle.textQueue[0] || "";
  }

  function consumeBattleText() {
    const battle = game.battle;
    if (battle.textQueue.length > 0) battle.textQueue.shift();
    if (battle.textQueue.length === 0 && battle.finished) finishBattle();
  }

  function finishBattle() {
    const battle = game.battle;
    const afterWinLines = battle.afterWinLines || [];
    const won = battle.enemy.hp <= 0 && battle.player.hp > 0;
    const wasTrainer = battle.kind === "trainer";

    if (battle.kind === "wild" && battle.caught) {
      game.battle = null;
      game.state = "overworld";
      saveGameQuietly();
      return;
    }

    if (!won) {
      healParty();
      game.battle = null;
      saveGameQuietly();
      openDialog(["Logan hurried back to safety.", "Your party was healed for the prototype."]);
      return;
    }

    game.battle = null;
    saveGameQuietly();
    if (wasTrainer && afterWinLines.length) openDialog(afterWinLines);
    else game.state = "overworld";
  }

  function selectBattleMain() {
    const battle = game.battle;
    const option = ["Fight", "Bag", "Ball", "Run"][battle.mainIndex];
    if (option === "Fight") battle.menu = "moves";
    if (option === "Bag") battle.menu = "bag";
    if (option === "Ball") useBall();
    if (option === "Run") tryRun();
  }

  function useMove(index) {
    const battle = game.battle;
    const moveKey = battle.player.moves[index];
    if (!moveKey) return;
    battle.menu = "main";
    executeTurn(moveKey);
  }

  function executeTurn(playerMoveKey) {
    const battle = game.battle;
    const enemyMoveKey = battle.enemy.moves[randomInt(0, battle.enemy.moves.length - 1)];
    const playerFirst = battle.player.speed >= battle.enemy.speed;

    if (playerFirst) {
      attack(battle.player, battle.enemy, playerMoveKey, "player");
      if (battle.enemy.hp > 0) attack(battle.enemy, battle.player, enemyMoveKey, "enemy");
    } else {
      attack(battle.enemy, battle.player, enemyMoveKey, "enemy");
      if (battle.player.hp > 0) attack(battle.player, battle.enemy, playerMoveKey, "player");
    }

    checkBattleEnd();
  }

  function attack(attacker, defender, moveKey, side) {
    const battle = game.battle;
    const move = MOVES[moveKey];
    const who = side === "player" ? attacker.name : `Enemy ${attacker.name}`;
    pushBattleText(`${who} used ${move.name}!`);

    if (Math.random() * 100 > move.accuracy) {
      pushBattleText("But it missed!");
      return;
    }

    const effectiveness = getTypeEffectiveness(move.type, defender.type);
    const base = (((2 * attacker.level / 5 + 2) * move.power * attacker.attack / Math.max(1, defender.defense)) / 50) + 2;
    const randomFactor = 0.85 + Math.random() * 0.15;
    const damage = Math.max(1, Math.floor(base * effectiveness * randomFactor));
    defender.hp = clamp(defender.hp - damage, 0, defender.maxHp);

    if (side === "player") battle.enemyShake = 14;
    else battle.playerShake = 14;

    if (effectiveness > 1) pushBattleText("It was super effective!");
    if (effectiveness > 0 && effectiveness < 1) pushBattleText("It was not very effective.");
  }

  function checkBattleEnd() {
    const battle = game.battle;
    if (battle.enemy.hp <= 0) {
      pushBattleText(`Enemy ${battle.enemy.name} fainted!`);
      gainExp(battle.player, battle.enemy.level * 8);
      battle.finished = true;
      return;
    }
    if (battle.player.hp <= 0) {
      pushBattleText(`${battle.player.name} fainted!`);
      battle.finished = true;
    }
  }

  function gainExp(mon, amount) {
    mon.exp += amount;
    pushBattleText(`${mon.name} gained ${amount} EXP.`);
    let needed = mon.level * 15;
    while (mon.exp >= needed) {
      mon.exp -= needed;
      mon.level += 1;
      refreshStats(mon);
      pushBattleText(`${mon.name} grew to Lv. ${mon.level}!`);
      needed = mon.level * 15;
    }
  }

  function usePotion() {
    const battle = game.battle;
    if (game.inventory.potions <= 0) {
      pushBattleText("You do not have any Potions.");
      battle.menu = "main";
      return;
    }
    if (battle.player.hp >= battle.player.maxHp) {
      pushBattleText(`${battle.player.name} is already healthy.`);
      battle.menu = "main";
      return;
    }
    game.inventory.potions -= 1;
    battle.player.hp = clamp(battle.player.hp + 20, 0, battle.player.maxHp);
    pushBattleText(`Used a Potion on ${battle.player.name}.`);
    const enemyMoveKey = battle.enemy.moves[randomInt(0, battle.enemy.moves.length - 1)];
    attack(battle.enemy, battle.player, enemyMoveKey, "enemy");
    battle.menu = "main";
    checkBattleEnd();
  }

  function useBall() {
    const battle = game.battle;
    if (battle.kind !== "wild") {
      pushBattleText("You cannot catch another trainer's Loganmon.");
      return;
    }
    if (game.inventory.balls <= 0) {
      pushBattleText("You do not have any Logan Balls.");
      return;
    }
    game.inventory.balls -= 1;
    const hpRatio = battle.enemy.hp / battle.enemy.maxHp;
    const chance = clamp(0.78 - hpRatio * 0.45 + (battle.enemy.level <= 3 ? 0.08 : 0), 0.2, 0.82);
    pushBattleText(`Logan threw a Logan Ball at ${battle.enemy.name}!`);
    if (Math.random() < chance) {
      battle.caught = true;
      battle.finished = true;
      pushBattleText(`Gotcha! ${battle.enemy.name} was caught!`);
      if (game.party.length < 6) {
        game.party.push(battle.enemy);
        pushBattleText(`${battle.enemy.name} joined your party.`);
      } else {
        pushBattleText(`${battle.enemy.name} was sent to storage. Storage is not playable yet.`);
      }
      return;
    }
    pushBattleText(`${battle.enemy.name} broke free!`);
    const enemyMoveKey = battle.enemy.moves[randomInt(0, battle.enemy.moves.length - 1)];
    attack(battle.enemy, battle.player, enemyMoveKey, "enemy");
    checkBattleEnd();
  }

  function tryRun() {
    const battle = game.battle;
    if (battle.kind !== "wild") {
      pushBattleText("You cannot run from this trainer battle.");
      return;
    }
    if (Math.random() < 0.75) {
      pushBattleText("Got away safely!");
      battle.finished = true;
    } else {
      pushBattleText("Could not escape!");
      const enemyMoveKey = battle.enemy.moves[randomInt(0, battle.enemy.moves.length - 1)];
      attack(battle.enemy, battle.player, enemyMoveKey, "enemy");
      checkBattleEnd();
    }
  }

  document.addEventListener("keydown", event => {
    const key = normalizeKey(event.key);
    if (!key) return;
    event.preventDefault();
    handleKey(key);
  });

  function normalizeKey(key) {
    const table = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right",
      Enter: "confirm", " ": "confirm", Escape: "back"
    };
    return table[key] || null;
  }

  function handleKey(key) {
    if (game.state === "title") return handleTitleKey(key);
    if (game.state === "dialog") return handleDialogKey(key);
    if (game.state === "choice") return handleChoiceKey(key);
    if (game.state === "battle") return handleBattleKey(key);
    if (game.state === "overworld") return handleOverworldKey(key);
  }

  function handleTitleKey(key) {
    const options = titleOptions();
    if (key === "up") game.titleIndex = (game.titleIndex + options.length - 1) % options.length;
    if (key === "down") game.titleIndex = (game.titleIndex + 1) % options.length;
    if (key === "confirm") {
      const selected = options[game.titleIndex];
      if (selected === "New Game") startNewGame();
      if (selected === "Continue") {
        if (!loadGame()) showMessage("No save found");
      }
      if (selected === "Controls") {
        openDialog(["Controls", "Arrow keys or WASD: Move / select", "Enter or Space: Confirm / interact", "Escape: Back", "The game saves when you change maps, finish battles, or press Save in this menu."]);
      }
    }
  }

  function titleOptions() {
    return hasSave() ? ["New Game", "Continue", "Controls"] : ["New Game", "Controls"];
  }

  function handleDialogKey(key) {
    if (key === "confirm") advanceDialog();
  }

  function handleChoiceKey(key) {
    const choice = game.choice;
    if (key === "up" || key === "left") choice.index = (choice.index + choice.options.length - 1) % choice.options.length;
    if (key === "down" || key === "right") choice.index = (choice.index + 1) % choice.options.length;
    if (key === "back") {
      game.state = "overworld";
      return;
    }
    if (key === "confirm") {
      const selected = choice.options[choice.index];
      const after = choice.after;
      game.choice = { prompt: "", options: [], index: 0, after: null };
      if (after) after(selected);
    }
  }

  function handleOverworldKey(key) {
    if (key === "confirm") return interact();
    if (key === "back") {
      saveGame();
      return;
    }
    if (["up", "down", "left", "right"].includes(key)) tryMove(key);
  }

  function handleBattleKey(key) {
    const battle = game.battle;
    if (!battle) return;

    if (battle.textQueue.length > 0) {
      if (key === "confirm") consumeBattleText();
      return;
    }

    if (battle.finished) {
      finishBattle();
      return;
    }

    if (battle.menu === "main") {
      if (key === "left") battle.mainIndex = battle.mainIndex % 2 === 1 ? battle.mainIndex - 1 : battle.mainIndex + 1;
      if (key === "right") battle.mainIndex = battle.mainIndex % 2 === 0 ? battle.mainIndex + 1 : battle.mainIndex - 1;
      if (key === "up") battle.mainIndex = battle.mainIndex >= 2 ? battle.mainIndex - 2 : battle.mainIndex + 2;
      if (key === "down") battle.mainIndex = battle.mainIndex <= 1 ? battle.mainIndex + 2 : battle.mainIndex - 2;
      battle.mainIndex = clamp(battle.mainIndex, 0, 3);
      if (key === "confirm") selectBattleMain();
      return;
    }

    if (battle.menu === "moves") {
      const moveCount = battle.player.moves.length;
      if (key === "up") battle.moveIndex = (battle.moveIndex + moveCount - 1) % moveCount;
      if (key === "down") battle.moveIndex = (battle.moveIndex + 1) % moveCount;
      if (key === "back") battle.menu = "main";
      if (key === "confirm") useMove(battle.moveIndex);
      return;
    }

    if (battle.menu === "bag") {
      if (key === "back") battle.menu = "main";
      if (key === "confirm") usePotion();
    }
  }

  function update() {
    if (game.messageTimer > 0) game.messageTimer -= 1;
    if (game.screenFlash > 0) game.screenFlash -= 1;
    if (game.battle) {
      if (game.battle.playerShake > 0) game.battle.playerShake -= 1;
      if (game.battle.enemyShake > 0) game.battle.enemyShake -= 1;
      game.battle.animationTimer += 1;
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (game.state === "title") drawTitle();
    else if (game.state === "battle") drawBattle();
    else {
      drawMap();
      drawHud();
      if (game.state === "dialog") drawDialogBox(game.dialog.lines[game.dialog.index] || "", true);
      if (game.state === "choice") drawChoiceBox();
    }

    if (game.messageTimer > 0) drawToast(game.message);
    if (game.screenFlash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${game.screenFlash / 30})`;
      ctx.fillRect(0, 0, W, H);
    }
  }

  function drawTitle() {
    const time = performance.now() / 1000;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#321d18");
    grad.addColorStop(0.5, "#173647");
    grad.addColorStop(1, "#171923");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 24; i++) {
      const x = (i * 73 + time * 18) % (W + 90) - 45;
      const y = 66 + (i % 7) * 42;
      ctx.fillStyle = i % 2 === 0 ? "rgba(255,71,45,0.14)" : "rgba(118,214,255,0.11)";
      ctx.fillRect(x, y, 80, 18);
    }

    drawPixelText("LOGANMON", 111, 76, 5, "#f3f0de", "#261511");
    drawPixelText("Prototype V1", 214, 139, 2, "#ffb85c", "#321511");
    drawMonsterSilhouette("Ruby", 150, 215, 64);
    drawMonsterSilhouette("Rox", 288, 205, 76);
    drawMonsterSilhouette("Axeo", 430, 215, 64);

    const options = titleOptions();
    drawPanel(208, 322, 224, options.length * 34 + 32);
    options.forEach((option, index) => {
      const y = 344 + index * 34;
      if (index === game.titleIndex) drawPixelText(">", 226, y, 2, "#ffec8a", "#000");
      drawPixelText(option, 258, y, 2, index === game.titleIndex ? "#ffec8a" : "#fff", "#000");
    });

    drawPixelText("No external art yet - all placeholder sprites are code-drawn", 47, 444, 1, "#d7e0ee", "#000");
  }

  function drawMonsterSilhouette(name, x, y, size) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    drawMonsterSprite(name, x, y, size, true);
    ctx.restore();
  }

  function drawMap() {
    const map = currentMap();
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        drawTile(tileAt(map, x, y), x * TILE, y * TILE, x, y);
      }
    }

    for (const ball of (map.starterBalls || [])) {
      if (!game.flags.hasStarter) drawStarterBall(ball.x * TILE + 16, ball.y * TILE + 17);
    }

    for (const npc of (map.npcs || [])) drawNpc(npc);
    drawPlayer();
  }

  function drawTile(char, px, py, tx, ty) {
    const info = tileInfo(char);
    ctx.fillStyle = info.color;
    ctx.fillRect(px, py, TILE, TILE);
    ctx.fillStyle = info.edge;
    if (char === "g") {
      ctx.fillRect(px, py + 27, TILE, 5);
      ctx.fillStyle = "rgba(255,255,255,0.09)";
      for (let i = 0; i < 4; i++) {
        const gx = px + ((tx * 11 + ty * 7 + i * 9) % 26) + 2;
        const gy = py + ((tx * 5 + ty * 13 + i * 6) % 22) + 4;
        ctx.fillRect(gx, gy, 2, 7);
      }
      return;
    }
    if (["#", "L", "H", "G", "M", "N"].includes(char)) {
      ctx.fillRect(px, py + 24, TILE, 8);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(px + 3, py + 3, TILE - 6, 4);
      return;
    }
    if (char === "w") {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.fillRect(px + ((tx + ty) % 2) * 8 + 4, py + 12, 18, 3);
      ctx.fillRect(px + ((tx + ty) % 3) * 5 + 2, py + 22, 20, 3);
      return;
    }
    if (char === "b") {
      ctx.fillStyle = "#eee1ff";
      ctx.fillRect(px + 4, py + 4, 24, 10);
      ctx.fillStyle = "#5e3199";
      ctx.fillRect(px + 4, py + 14, 24, 13);
      return;
    }
    if (char === "C") {
      ctx.fillStyle = "#151a23";
      ctx.fillRect(px + 5, py + 5, 22, 16);
      ctx.fillStyle = "#79d7ff";
      ctx.fillRect(px + 8, py + 8, 16, 9);
      ctx.fillStyle = "#343b4a";
      ctx.fillRect(px + 10, py + 22, 12, 5);
      return;
    }
    if (char === "D" || char === "e") {
      ctx.fillStyle = "rgba(0,0,0,0.28)";
      ctx.fillRect(px + 8, py + 12, 16, 20);
      return;
    }
    if (char === "t") {
      ctx.fillStyle = "#b9824d";
      ctx.fillRect(px + 2, py + 7, 28, 18);
      ctx.fillStyle = "#5c381f";
      ctx.fillRect(px + 2, py + 22, 28, 5);
    }
  }

  function drawStarterBall(cx, cy) {
    ctx.fillStyle = "#000";
    ctx.fillRect(cx - 9, cy - 9, 18, 18);
    ctx.fillStyle = "#e33b3b";
    ctx.fillRect(cx - 8, cy - 8, 16, 8);
    ctx.fillStyle = "#f4f4f4";
    ctx.fillRect(cx - 8, cy, 16, 8);
    ctx.fillStyle = "#000";
    ctx.fillRect(cx - 8, cy - 1, 16, 2);
    ctx.fillStyle = "#fff";
    ctx.fillRect(cx - 2, cy - 2, 4, 4);
  }

  function drawNpc(npc) {
    drawCharacter(npc.x * TILE + 16, npc.y * TILE + 26, npc.color, npc.name[0] || "N", npc.dir || "down");
  }

  function drawPlayer() {
    drawCharacter(game.player.x * TILE + 16, game.player.y * TILE + 26, "#3f78e0", "L", game.player.dir);
  }

  function drawCharacter(cx, footY, color, letter, dir) {
    const x = cx - 9;
    const y = footY - 25;
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.fillRect(cx - 10, footY - 2, 20, 5);
    ctx.fillStyle = "#f4c38d";
    ctx.fillRect(x + 4, y, 10, 8);
    ctx.fillStyle = color;
    ctx.fillRect(x + 2, y + 8, 14, 13);
    ctx.fillStyle = "#1b1b1b";
    ctx.fillRect(x + 2, y + 21, 5, 4);
    ctx.fillRect(x + 11, y + 21, 5, 4);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(letter, cx, y + 15);
    ctx.fillStyle = "#111";
    if (dir === "down") {
      ctx.fillRect(x + 6, y + 4, 2, 2);
      ctx.fillRect(x + 11, y + 4, 2, 2);
    } else if (dir === "up") {
      ctx.fillRect(x + 4, y + 1, 10, 2);
    } else if (dir === "left") {
      ctx.fillRect(x + 5, y + 4, 2, 2);
    } else if (dir === "right") {
      ctx.fillRect(x + 12, y + 4, 2, 2);
    }
  }

  function drawHud() {
    drawPanel(8, 8, 214, 44);
    drawPixelText(currentMap().name, 18, 19, 1, "#fff", "#000");
    const partyText = game.party.length ? `${game.party[0].name} Lv.${game.party[0].level} HP ${game.party[0].hp}/${game.party[0].maxHp}` : "No Loganmon";
    drawPixelText(partyText, 18, 36, 1, "#e9f5ff", "#000");

    drawPanel(457, 8, 175, 60);
    drawPixelText(`Potions: ${game.inventory.potions}`, 468, 19, 1, "#fff", "#000");
    drawPixelText(`Logan Balls: ${game.inventory.balls}`, 468, 36, 1, "#fff", "#000");
    drawPixelText("Esc: Save", 468, 53, 1, "#e8dfa6", "#000");
  }

  function drawDialogBox(text, showArrow) {
    drawPanel(24, 338, 592, 118);
    drawWrappedText(text, 44, 361, 552, 18, "#fff", 16);
    if (showArrow && Math.floor(performance.now() / 450) % 2 === 0) {
      drawPixelText("v", 580, 426, 2, "#ffec8a", "#000");
    }
  }

  function drawChoiceBox() {
    drawDialogBox(game.choice.prompt, false);
    const startX = 380;
    const startY = 373;
    drawPanel(startX, startY - 12, 190, game.choice.options.length * 29 + 24);
    game.choice.options.forEach((option, index) => {
      const y = startY + index * 29;
      if (index === game.choice.index) drawPixelText(">", startX + 18, y, 2, "#ffec8a", "#000");
      drawPixelText(option, startX + 50, y, 2, index === game.choice.index ? "#ffec8a" : "#fff", "#000");
    });
  }

  function drawBattle() {
    const battle = game.battle;
    const bob = Math.sin(battle.animationTimer / 20) * 3;
    ctx.fillStyle = "#b8d4e8";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#82b36d";
    ctx.fillRect(0, 310, W, 84);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillRect(0, 0, W, 76);

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(94, 286, 174, 24);
    ctx.fillRect(382, 158, 174, 24);

    drawMonsterSprite(battle.player.name, 130 + shakeOffset(battle.playerShake), 196 + bob, 112, false, true);
    drawMonsterSprite(battle.enemy.name, 424 + shakeOffset(battle.enemyShake), 82 - bob, 96, false, false);

    drawBattleStatusBox(38, 62, battle.enemy, false);
    drawBattleStatusBox(376, 246, battle.player, true);

    drawPanel(0, 358, W, 122);
    if (battle.textQueue.length > 0) {
      drawWrappedText(activeBattleText(), 28, 384, 390, 22, "#fff", 18);
      drawPixelText("v", 590, 434, 2, "#ffec8a", "#000");
    } else if (battle.finished) {
      drawWrappedText("Press Enter to continue.", 28, 384, 390, 22, "#fff", 18);
    } else {
      drawBattleMenu();
    }
  }

  function shakeOffset(amount) {
    if (!amount) return 0;
    return (amount % 4 < 2 ? -1 : 1) * Math.min(6, amount);
  }

  function drawBattleStatusBox(x, y, mon, showExp) {
    drawPanel(x, y, 226, showExp ? 74 : 58);
    drawPixelText(`${mon.name} Lv.${mon.level}`, x + 14, y + 13, 1, "#fff", "#000");
    drawPixelText(formatTypes(mon.type), x + 14, y + 29, 1, "#d7e8ff", "#000");
    drawHpBar(x + 104, y + 38, 96, 9, mon.hp, mon.maxHp);
    drawPixelText(`${mon.hp}/${mon.maxHp}`, x + 115, y + 51, 1, "#fff", "#000");
    if (showExp) {
      ctx.fillStyle = "#293749";
      ctx.fillRect(x + 14, y + 64, 190, 4);
      ctx.fillStyle = "#72c7ff";
      const next = mon.level * 15;
      ctx.fillRect(x + 14, y + 64, Math.floor(190 * (mon.exp / next)), 4);
    }
  }

  function drawHpBar(x, y, w, h, hp, maxHp) {
    ctx.fillStyle = "#111";
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = "#4c5967";
    ctx.fillRect(x, y, w, h);
    const pct = maxHp ? hp / maxHp : 0;
    ctx.fillStyle = pct > 0.5 ? "#55d76e" : pct > 0.22 ? "#e8cd4a" : "#e85b4a";
    ctx.fillRect(x, y, Math.max(0, Math.floor(w * pct)), h);
  }

  function drawBattleMenu() {
    const battle = game.battle;
    if (battle.menu === "main") {
      const options = ["Fight", "Bag", "Ball", "Run"];
      drawWrappedText("What should Logan do?", 28, 385, 310, 22, "#fff", 18);
      drawPanel(406, 374, 202, 82);
      options.forEach((option, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = 426 + col * 86;
        const y = 395 + row * 30;
        if (index === battle.mainIndex) drawPixelText(">", x - 18, y, 2, "#ffec8a", "#000");
        drawPixelText(option, x, y, 2, index === battle.mainIndex ? "#ffec8a" : "#fff", "#000");
      });
      return;
    }

    if (battle.menu === "moves") {
      drawPanel(24, 374, 590, 82);
      battle.player.moves.forEach((moveKey, index) => {
        const move = MOVES[moveKey];
        const y = 392 + index * 22;
        if (index === battle.moveIndex) drawPixelText(">", 44, y, 2, "#ffec8a", "#000");
        drawPixelText(`${move.name}`, 76, y, 2, index === battle.moveIndex ? "#ffec8a" : "#fff", "#000");
        drawPixelText(`${move.type} Pow ${move.power}`, 360, y, 1, "#d7e8ff", "#000");
      });
      drawPixelText("Esc: Back", 502, 435, 1, "#e8dfa6", "#000");
      return;
    }

    if (battle.menu === "bag") {
      drawPanel(24, 374, 590, 82);
      drawPixelText("> Potion", 48, 394, 2, "#ffec8a", "#000");
      drawPixelText(`Owned: ${game.inventory.potions}`, 290, 397, 1, "#fff", "#000");
      drawPixelText("Heals 20 HP. Enter: Use. Esc: Back", 48, 428, 1, "#e8dfa6", "#000");
    }
  }

  function drawMonsterSprite(name, x, y, size, silhouette = false, back = false) {
    const dex = MONSTER_DEX[name];
    if (!dex) return;
    ctx.save();
    ctx.translate(x, y);
    const scale = size / 96;
    ctx.scale(scale, scale);
    ctx.fillStyle = silhouette ? "#111820" : dex.color;
    ctx.strokeStyle = "#151515";
    ctx.lineWidth = 4;

    if (dex.shape === "dog") drawDog(dex, silhouette, back);
    else if (dex.shape === "fox") drawFox(dex, silhouette, back);
    else if (dex.shape === "axolotl") drawAxolotl(dex, silhouette, back);
    else if (dex.shape === "bird") drawBird(dex, silhouette, back);
    else if (dex.shape === "mouse") drawMouse(dex, silhouette, back);
    else if (dex.shape === "worm") drawWorm(dex, silhouette, back);
    else if (dex.shape === "bug") drawBug(dex, silhouette, back);
    else if (dex.shape === "rock") drawRock(dex, silhouette, back);
    else if (dex.shape === "spark") drawSpark(dex, silhouette, back);
    else drawBlob(dex, silhouette, back);

    if (!silhouette) {
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "#111";
      ctx.fillText(name.slice(0, 3).toUpperCase(), 48, 89);
    }
    ctx.restore();
  }

  function monsterFill(dex, silhouette) {
    return silhouette ? "#111820" : dex.color;
  }

  function monsterAccent(dex, silhouette) {
    return silhouette ? "#111820" : dex.accent;
  }

  function ellipse(x, y, rx, ry) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  function poly(points) {
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function drawDog(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(48, 54, 27, 20);
    ellipse(39, 34, 20, 16);
    poly([[23, 25], [31, 5], [39, 26]]);
    poly([[48, 26], [60, 9], [58, 33]]);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[67, 45], [88, 28], [79, 59]]);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(31, 33, 5, 5);
  }

  function drawFox(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(48, 56, 25, 18);
    ellipse(42, 35, 19, 14);
    poly([[25, 29], [32, 7], [39, 29]]);
    poly([[46, 29], [59, 7], [58, 34]]);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[64, 54], [93, 36], [78, 69]]);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(34, 34, 5, 5);
  }

  function drawAxolotl(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(49, 57, 27, 18);
    ellipse(44, 37, 22, 15);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[25, 35], [8, 23], [19, 43]]);
    poly([[62, 35], [83, 23], [70, 43]]);
    poly([[63, 61], [88, 52], [76, 70]]);
    ctx.fillStyle = "#111";
    if (!silhouette) {
      ctx.fillRect(36, 36, 4, 4);
      ctx.fillRect(50, 36, 4, 4);
    }
  }

  function drawBird(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(47, 53, 24, 19);
    ellipse(54, 31, 16, 13);
    poly([[30, 51], [6, 36], [18, 64]]);
    poly([[64, 51], [88, 36], [76, 64]]);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[68, 31], [86, 37], [68, 42]]);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(57, 29, 4, 4);
  }

  function drawMouse(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(48, 58, 28, 17);
    ellipse(35, 40, 15, 13);
    ellipse(28, 29, 9, 9);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[72, 56], [92, 48], [84, 66]]);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(32, 38, 4, 4);
  }

  function drawWorm(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(28, 61, 15, 13);
    ellipse(43, 55, 16, 14);
    ellipse(59, 57, 16, 14);
    ellipse(74, 63, 15, 12);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    ellipse(42, 41, 9, 7);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(35, 51, 4, 4);
  }

  function drawBug(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(49, 58, 29, 18);
    ellipse(34, 39, 16, 14);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    ellipse(64, 40, 14, 12);
    ctx.strokeStyle = "#151515";
    ctx.beginPath();
    ctx.moveTo(26, 30);
    ctx.lineTo(15, 15);
    ctx.moveTo(39, 30);
    ctx.lineTo(49, 15);
    ctx.stroke();
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(30, 38, 4, 4);
  }

  function drawRock(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    poly([[25, 65], [34, 35], [55, 24], [77, 42], [72, 70], [45, 78]]);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[40, 45], [54, 35], [65, 47], [54, 55]]);
    ctx.fillStyle = "#111";
    if (!silhouette) ctx.fillRect(45, 54, 5, 5);
  }

  function drawSpark(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    poly([[50, 6], [62, 36], [88, 29], [68, 53], [80, 84], [49, 64], [21, 84], [31, 53], [9, 29], [37, 36]]);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    poly([[49, 25], [59, 46], [48, 44], [55, 66], [39, 42], [50, 44]]);
    ctx.fillStyle = "#111";
    if (!silhouette) {
      ctx.fillRect(39, 44, 5, 5);
      ctx.fillRect(56, 44, 5, 5);
    }
  }

  function drawBlob(dex, silhouette) {
    ctx.fillStyle = monsterFill(dex, silhouette);
    ellipse(48, 55, 28, 24);
    ctx.fillStyle = monsterAccent(dex, silhouette);
    ellipse(60, 45, 10, 9);
  }

  function drawPanel(x, y, w, h) {
    ctx.fillStyle = "#0f1724";
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = "#f4f4ef";
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
    ctx.fillStyle = "#1c2b42";
    ctx.fillRect(x + 8, y + 8, w - 16, h - 16);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 4, y + 4, w - 8, h - 8);
  }

  function drawToast(text) {
    const w = Math.max(150, text.length * 9 + 28);
    drawPanel((W - w) / 2, 80, w, 42);
    drawPixelText(text, (W - w) / 2 + 16, 96, 1, "#fff", "#000");
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight, color, fontSize) {
    ctx.font = `${fontSize}px monospace`;
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    const words = String(text).split(/\s+/);
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, y);
        y += lineHeight;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }

  function drawPixelText(text, x, y, scale, fill, shadow) {
    const size = 8 * scale;
    ctx.font = `bold ${size}px monospace`;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    if (shadow) {
      ctx.fillStyle = shadow;
      ctx.fillText(text, x + scale, y + scale);
    }
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }

  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
})();
