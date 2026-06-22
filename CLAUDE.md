# CLAUDE.md — The Beast of Crystal Court

> This file loads at the start of every Claude Code session. Keep it short and high-signal.
> Deep detail lives in `docs/GAME_DESIGN.md`, `docs/PROJECT_PLAN.md`, and `docs/CLAUDE_CODE_WORKFLOW.md`.

## What this project is
**The Beast of Crystal Court** is an 8-bit, **black-and-white (1-bit)** horror game.
It is ~70–75% interactive text/parser and ~25–30% top-down (Zelda-style) movement and simple combat.

This is a **two-stage** project:
1. **FIRST GOAL — finish the HTML/JS prototype.** Build the entire game in the existing HTML file so
   the author can see progress, change things, and play different parts. We stay in HTML until the
   author is satisfied with the game and the story.
2. **LATER — port to Python.** Only after the author signs off, rebuild in **Python + pygame-ce** for a
   desktop download (macOS, Windows, Linux) and a **pygbag** web/PWA build for itch.io. Do not start
   this stage until told.

## ⚑ Working on the HTML prototype (the current stage)
- **The existing file `crystal-court-demo.html` is the source of truth. Follow it to a tee.**
- **Do not change anything already in that file. Only ADD to it as we build forward.** The single
  change already made is that the friend's Linux-terminal typing was slowed for readability; no other
  edits to existing content.
- **Images:** keep making simple 1-bit stand-in/placeholder art (as in the current file). The author
  supplies the final images and will drop them in.
- **Music:** the author will add background music to certain scenes later. Don't add audio files;
  leave clear hooks/placeholders where music will go.
- Match the current look and pacing exactly (see `docs/GAME_DESIGN.md`).

## Golden rules (read every session)
1. **Never assume. Ask first.** If anything is ambiguous or not written in the design docs — story,
   names, mechanics, layout, pacing, art — **stop and ask** before writing code. Don't invent.
2. **Plan before building.** For any non-trivial task, enter **plan mode** (Shift+Tab), propose the
   plan, and wait for approval. Re-plan the moment something goes sideways.
3. **Read before you edit.** Never change a file you have not opened and read.
4. **Evidence before claims.** Never say it works until you've actually run it this turn and seen it.
5. **Small steps.** One scoped task at a time. Don't touch files or content outside the task.
6. **Placeholders, not invention.** Unset names stay bracketed: `[PLAYER]`, `[FRIEND]`, `[BEAST]`,
   `[TRUE_NAME]`, `[TOWN]`, `[LANGUAGE]`. Never fill these in yourself.

## Visual identity (both stages)
- **Pure 1-bit: black and white only. No color. No glow.**
- **Dithered (Bayer) shading** for the pixel-art scenes.
- Reference register: *World of Horror* and *Repose*.
- Fonts: "Press Start 2P" (title/UI) and "VT323" (body); monospace for the terminal view.
- Full-bleed (the game fills the screen).

## Tech stack (LATER / Python stage — do not change without asking)
- **Python 3.12** (pygbag no longer works on 3.11; 3.12 is required). Use a virtualenv.
- **pygame-ce** (community edition), NOT legacy `pygame`.
- **pygbag** for the web/PWA build; **PyInstaller** for desktop; **pytest** for logic tests.
- Pin every version in `requirements.txt`. No other dependencies without asking.
- When this stage starts: **async-first loop** (`await asyncio.sleep(0)` per frame, pygbag-style),
  and **separate logic from rendering** so logic is testable. Assets: PNG/WEBP images, **OGG** audio.

## Security & safety (non-negotiable, both stages)
- **The text parser must NEVER call `eval()`/`exec()`/`os.system()` (or JS `eval`) on player input.**
  Parse commands with plain string matching only.
- **Saves use JSON, never `pickle`** (and no browser `localStorage` in the HTML artifact — keep state
  in memory). Validate anything loaded.
- **No telemetry, no analytics, no network calls.** Single-player, offline. The pygbag service worker
  may cache only our own local assets.
- **No secrets in the repo.** Add only trusted, pinned packages; flag each addition.

## Where the detail lives
- `docs/GAME_DESIGN.md` — authoritative look, layout, pacing, story, systems (read this before building).
- `docs/PROJECT_PLAN.md` — the phased roadmap (HTML prototype first, Python later).
- `docs/CLAUDE_CODE_WORKFLOW.md` — how we work, safety settings, review subagent, skills.

## When unsure
Ask. A 10-second question is cheaper than an hour of rework.
