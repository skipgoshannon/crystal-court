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

## 4. Split into three separate files (HTML / CSS / JS)
Refactor the single `crystal-court-demo.html` into three clean files:
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
