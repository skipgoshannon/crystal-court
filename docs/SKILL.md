---
name: beast-of-cc-html
description: How to build and extend The Beast of Crystal Court inside crystal-court-demo.html. Use this whenever working on that HTML prototype — adding or editing scenes, dialogue, the phone/texting view, the Linux terminal, the top-down/parser views, canvas pixel art, transitions, sounds, or pacing. It documents the file's existing helpers, CSS, art system, and timing so new work matches what's already there. Consult it before writing any code in this file, even for small changes.
---

# Building The Beast of Crystal Court (HTML prototype)

This game is a single self-contained file, `crystal-court-demo.html`. New scenes are added by **reusing
the helpers that already exist in it** so everything stays consistent. Read `docs/GAME_DESIGN.md` for
*what* to build (story, layout, pacing intent); use this skill for *how* to build it in the file.

## Non-negotiable constraints
- **1-bit only: pure black (`#000`) and white (`#f3f3f3`). No color. No glow. No shadows-as-glow.**
  All shades come from **dithering** (see the `dith()` helper), never gray fills or gradients.
- **Never run player input as code.** No `eval`, no `new Function`, no `exec`. The parser matches a
  known vocabulary with plain string handling only.
- **No browser storage.** No `localStorage`/`sessionStorage`. Keep all game state in plain JavaScript
  variables/objects in memory.
- **No new libraries or CDNs.** The only external resource is the Google Fonts link already in `<head>`
  (Press Start 2P, VT323). Everything else is vanilla JS/CSS/Canvas.
- **Stay inside the existing structure:** one IIFE `(() => { ... })()` holds all logic; helpers live
  inside it. Add new functions there; don't introduce frameworks or build steps.
- **Stand-in art is expected.** Make simple 1-bit placeholder art with the canvas helpers; the author
  supplies final images later.

## File anatomy (where things are)
- `<head>` `<style>` — all CSS, including the design tokens `--w` (white `#f3f3f3`), `--dim`
  (`#9a9a9a`), `--ln` (hairline `#555`). Body background is `#000`.
- `<body>` markup — `#wrap` holds `.topbar`, `#scene1`, `#scene2`; then the fixed overlays
  `#titleScreen` and `#card` (transition).
- `<script>` IIFE — helpers, the `room()` canvas art, the `beats` array (Scene 1 dialogue), `scene1()`,
  `scene2()`, and the boot block (`#startBtn` creates the AudioContext and starts Scene 1).

## Core helpers (reuse these — don't reinvent)
- `$(sel)` — `document.querySelector` shorthand.
- `sleep(ms)` — `await sleep(ms)` to pause. Honors reduced motion (caps long waits). Use it for pacing.
- `blip(freq=200, dur=.05, type='square', gain=.02)` — a short retro sound. Safe no-op until audio is
  unlocked by the Start button. Call it sparingly on actions/typing.
- `dith(ctx, d)` — returns a cached 1-bit Bayer pattern at density `d` (0..1). Use as a fill:
  `ctx.fillStyle = dith(ctx, .12); ctx.fillRect(...)`. Higher `d` = lighter/denser white.
- `waitGo(el)` — show a continue prompt element and resolve on Enter/tap/click:
  `await waitGo($('#cont2'))`. Uses the shared `waiter` mechanism.
- `transition(text)` — black full-screen card with centered Press-Start-2P text; fades in, holds
  ~1.6 s (or Enter), fades out. Use between major scene changes, e.g. `await transition("LATER")`.

## Canvas pixel-art conventions
- Canvases are small and scaled up crisp: logical size **240×135**, CSS `image-rendering:pixelated`.
- Draw with integers. `R(x,y,w,h)` is the integer `fillRect` shorthand used in `room()`.
- Two inks only (`#000`, `#f3f3f3`); for any midtone use `dith(cx, density)` as the fill style.
- `fig(x, y, scale)` draws a 1-bit human silhouette (black body, thin white rim) — reuse it for people;
  scale ~0.78 (far) to ~1.18 (near) for crude depth.
- `room()` is the worked example: fill black, lay a faint dithered wall, bright white windows, a
  light-falloff floor built from descending dither bands, outlined desks, then `fig()` people. Model
  new location art on this approach: blacks, whites, dither bands, simple rectangles.
- New scene art: add its own `<canvas width="240" height="135">` and a draw function shaped like
  `room()`; call it when the scene starts.

## Text & dialogue patterns
- **Scene 1 style (one line at a time, replacing):** `renderBeat(b)` clears `#log` and shows a single
  beat — `{you:"..."}` renders as `YOU: "..."`, `{narr:"..."}` as narration. Each new beat **replaces**
  the previous (no scroll buildup). Drive it like `scene1()` does: loop the `beats`, `blip`, then
  `await waitGo($('#cont1'))`. To add Scene 1 dialogue, edit the `beats` array.
- **Narration in Scene 2:** `s2narr("...")` sets the single centered narration line under the stage;
  `s2narr("")` clears it.

## Scene 2 view system (one stage, three views)
- `showView('phone' | 'terminal' | 'video')` shows exactly one stage view and hides the others. Always
  switch views through this function.
- **Phone / texting:**
  - `setBar("Feed")` / `setBar("[FRIEND]")` sets the phone's top label.
  - `await youMsg("...")` — the player's outgoing bubble (right). Built-in pacing: ~340 ms before,
    ~640 ms after.
  - `await frMsg("...")` — the friend's reply (left). Shows an animated "typing…" indicator for
    `min(1600, 750 + text.length*30)` ms, then the bubble, then ~560 ms. Keeps texting unhurried —
    don't remove these delays.
  - News/article cards use the `.newscard` markup pattern (see the missing-student card in `scene2()`).
- **Terminal (the hack):**
  - `await cmd("ssh ...")` types a command char-by-char at **110 ms/char** with a blinking cursor, then
    pauses ~340 ms. (110 is the author's chosen readable speed — keep terminal typing readable.)
  - `out("...")` prints command output (supports `\n`). Put `await sleep(500..700)` between commands so
    it reads like a real session.
  - The terminal bar shows `[FRIEND]@rig — bash`; the prompt is `[FRIEND]@rig:~$ `.
- **Video:** `drawVid()` renders a 1-bit dithered still to `#vid`, then `showView('video')`; narrate
  with `s2narr(...)`; advance with `waitGo`; return with `showView('phone')`.

## Choices
- `await chips(["Option A","Option B"])` renders tappable buttons and resolves to the chosen **index**
  (0-based). Use for texting replies and simple branches. Branches may differ in path/flavor but the
  game must stay winnable. **Chips are for conversation/branches — not for the adventure parser.**

## The parser & top-down views (planned — follow GAME_DESIGN §13–14)
- Exploration/puzzle scenes use a **typed** verb–noun parser, **not** menus. Illustrated: an image
  (canvas) on **top**, the text and the typed-input line **underneath**.
- Inside the mall is a **top-down** view; reaching a point of interest opens either a text-overlay
  (which can deep-dive into a Scene-1/Scene-2-style framed view) or the typed parser. Build these with
  the same ink/dither/`fig()` art rules and the same `showView`-style single-view switching.
- Parser rule restated: match known words; never evaluate input as code; reply in-character to unknown
  commands without listing the answers.

## Input model
- A single shared `waiter` drives "press Enter / tap to continue." `Enter` and taps on the scene (not on
  a chip/button) advance. Reuse `waitGo()` rather than adding new key listeners.

## Pacing reference (keep new content consistent with these)
- Continue beats: gate on `waitGo`, let the player set the speed.
- Texting: 340/640 (you), typing-indicator + 560 (friend) — as above.
- Terminal: 110 ms/char, 340 after each command, 500–700 between commands.
- Transitions: ~650 ms fade-in, ~1600 ms hold (skippable), ~450 ms fade-out.
- Everything honors `prefers-reduced-motion` via `sleep()` and the `reduce` flag — keep using `sleep()`.

## Adding a new scene — the shape to follow
1. If it needs art, add a `<canvas width="240" height="135">` and a draw function like `room()`.
2. Write an `async function sceneN(){ ... }` that uses `s2narr`/`renderBeat`, `showView`, `youMsg`/
   `frMsg`/`cmd`/`out`/`chips`, `blip`, `sleep`, and `waitGo`.
3. Chain it from the end of the previous scene (e.g. call `sceneN()` where `scene2()` currently ends),
   optionally via `await transition("...")`.
4. Keep state in module-level variables inside the IIFE (inventory, flags, the clock). No storage APIs.
5. Test by opening the file in a browser and playing to the new part before declaring it done.
