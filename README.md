# Loganmon Prototype V1

This is a playable HTML5 canvas prototype for Loganmon. It uses only local files and has no external dependencies.

## How to run

Open `index.html` in a browser.

If your browser blocks local files for any reason, run a small local server from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Controls

- Arrow keys or WASD: move/select
- Enter or Space: confirm/interact
- Escape: save in overworld, back in battle menus

## Current V1 content

- Title screen with New Game, Continue, and Controls
- Logan's room with PC Potion pickup
- Mine Valley
- Grandpa's lab
- Starter selection: Ruby, Rox, or Axeo
- Lilly chooses the advantage starter
- First Lilly battle
- Logandex, 5 Logan Balls, and 5 Potions after starter battle
- Route 1 with grass encounters
- Wild Raven and Silverfiche
- Catching with Logan Balls
- Red Geyser with Logan Center, Logan Mart placeholder, Red Gym guard, and V1 guide NPC
- Basic save/load using browser localStorage
- Placeholder procedural sprites and fake battle animations

## What is intentionally placeholder

- No real hand-drawn sprites yet
- No music or sound yet
- No imported tilesets yet
- Only the first tiny playable slice is implemented
- No Stone City, Red Forest, Stone Gym, full party UI, storage, or full trainer routes yet

## Recommended V2

1. Add Route 2 South.
2. Add Red Forest.
3. Add Stone City.
4. Add Stone Gym and Grok.
5. Add more early Loganmon: Worm, Cater, Kak, Meta, Buzz, Rockie, Sandy, Ava.
6. Replace placeholder sprites for Logan, Lilly, Grandpa, Ruby, Rox, Axeo, Raven, and Silverfiche.
