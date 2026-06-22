# Pending Changes — The Beast of Crystal Court

Things to do later, in no particular order.

---

## 1. Title screen — update the text
The current marquee reads "CRYSTAL COURT." Change it to reflect the full game title:
**The Beast of Crystal Court.**

Prompt for Claude Code when ready:
> Update the title screen in `crystal-court-demo.html` to display "The Beast of Crystal Court"
> in place of the current "CRYSTAL COURT" marquee text. Change nothing else.

---

## 2. Dialogue — personal edits
Review and rewrite dialogue directly in `crystal-court-demo.html`. The scripted beats for Scene 1
are in the `beats` array starting around line 190. Scene 2 dialogue is in the `s2flow` sequence.

*(Make these changes yourself in the file — no Claude Code prompt needed.)*

---

## 3. Terminal typing speed — split the difference
The original speed was 60 ms/character. The current slowed speed is 110 ms/character. Adjust to
something in between — try **80–85 ms** as a starting point, then play it back to judge.

Prompt for Claude Code when ready:
> In `crystal-court-demo.html`, change the terminal typing speed. Find the line with
> `await sleep(110)` inside the terminal character-by-character loop and change the value to 85
> (or whatever value I specify). Change nothing else in the file.

---

## 4. Split into three separate files (HTML / CSS / JS) — ✅ DONE (2026-06)
Done: the active build is now `beast-of-crystal-court-demo.html` + `style.css` + `game.js` (no inline
style/script). The original `crystal-court-demo.html` is kept untouched as a frozen reference. New work
goes in the split files; keep style/script external from here on.

Original request (for reference) — refactor the single `crystal-court-demo.html` into three clean files:
- `index.html` — structure only
- `style.css` — all styles
- `game.js` — all JavaScript/game logic

The layout, look, pacing, and all game behavior must be **identical** after the split.
No content changes — purely a code organization task.

Prompt for Claude Code when ready:
> Refactor `crystal-court-demo.html` into three files: `index.html`, `style.css`, and `game.js`.
> Move all `<style>` content into `style.css` and link it from the `<head>`. Move all `<script>`
> content into `game.js` and load it at the bottom of `<body>`. The resulting game must look and
> behave identically to the current single file. Change no content, logic, dialogue, timing, or
> visual output — only reorganize the code. Verify by opening `index.html` in a browser and
> playing through both scenes before calling it done.

---

## 5. Top-down polish — kitchen & movement (next session, 2026-06)
Author feedback on the first top-down build. All in `game.js`:

- **No follower.** Remove Lenny following River around — it feels weird. In the **kitchen, River is
  alone** (drop Lenny from that scene entirely). Do **not** add any narration explaining his absence —
  just don't have him there. (Reassess the loose-follow elsewhere too; don't make him trail.)
- **Don't telegraph the items.** Make finding the salt and pocketknife the player's job — remove the
  obvious hints (the intro "walk to the drawers — press ✦" line and any text that points at which
  drawers hold what). Let the player open drawers and discover them.
- **Collision feels mushy.** River walks partly *onto* cabinets/counters/table. She should be able to
  walk right **up to** them but not overlap them — tune the player's collision footprint vs. the sprite
  so she stops flush against solids (align the footprint to her feet / enlarge it to match the sprite).

General note: the build is "a good start"; it'll improve with real art later. These are polish, not a
redesign — make the minimal change for each; **do not overcorrect.**
