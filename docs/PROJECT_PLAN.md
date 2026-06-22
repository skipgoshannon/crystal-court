# The Beast of Crystal Court — Project Plan & Roadmap

A phased plan Claude Code can follow. Build in order; finish and verify each step before the next.
Nothing here authorizes inventing content — story, names, art, and dialogue come from the author and
`docs/GAME_DESIGN.md`.

## Vision
A finished, atmospheric 1-bit horror game (~70–75% text/parser, ~25–30% top-down action). Built in
**two stages**: first a complete **HTML/JS prototype** the author can play and tune, then a **Python**
port for desktop download and a pygbag web/PWA build. For fun and learning; no deadline, no budget.

---

# STAGE 1 — Finish the HTML/JS prototype (do this FIRST)

**This is the first and current goal.** Build the entire game inside the existing
`crystal-court-demo.html`. The author plays the prototype to judge gameplay and story before any Python
work begins. **Do not start Stage 2 until the author signs off.**

**Ground rules for Stage 1:**
- `crystal-court-demo.html` is the source of truth. **Follow it to a tee. Do not change existing
  content. Only ADD.** The single change already made: the friend's terminal typing was slowed (~110
  ms/char) for readability — keep it readable.
- Use simple 1-bit **stand-in** images; the author supplies final art.
- The author adds **background music later** — leave labeled hooks, add no audio files.
- Keep the look/pacing identical to what's there (see `docs/GAME_DESIGN.md`). No color, no glow.
- No browser storage (`localStorage`); keep game state in memory.
- Never `eval` player input in the parser; match a known vocabulary with plain string handling.

**Stage 1 steps:**
- **S1.1 — Finish Game 1 (investigate & open the door).** Continue from the library hook: research the
  legend, reconstruct the summoning ritual, gather its parts, perform it outside the lot.
- **S1.2 — Mall entry + top-down system.** On entry, switch to the **top-down, Zelda-style map** of the
  interior, with movement and area transitions, plus the **two interaction modes**: (A) text-overlay
  with optional deep-dive into a Scene-1/Scene-2-style framed view; (B) the **illustrated parser**
  (image on top, words beneath). See `docs/GAME_DESIGN.md` §14.
- **S1.3 — Game 2 (inside: survive, reach Howie, learn the enemy).** Reflections behavior; the
  **Howie/mannequin beat** — his eyes move toward his pocket, leading `[PLAYER]` to the notebook.
- **S1.4 — Game 3 (weapons + free Howie).** Silver blade and iron stake; free Howie via his real name.
- **S1.5 — Game 4 (kill it & close the door).** Silver paralyze → iron + true name kill → seal portal
  → escape before the 5-hour clock ends.
- **S1.6 — Prototype polish.** Save points (in-memory), pacing pass, transition cards, music/sfx hooks
  placed, reduced-motion support.
- **Sign-off gate:** the author plays the full prototype and confirms the game and story are right.

---

# STAGE 2 — Port to Python (LATER, only after sign-off)

Rebuild the finished prototype as a Python game for a **desktop download (macOS, Windows, Linux)** and a
**pygbag web/PWA** build for itch.io, from one codebase.

**Stack:** **Python 3.12** (pygbag no longer supports 3.11), **pygame-ce**, **pygbag** (web/PWA),
**PyInstaller** (desktop), **pytest** (logic tests). Pin all versions.

**Hard constraints (Stage 2):** async-first loop (`await asyncio.sleep(0)` per frame, pygbag-style)
from day one; **logic separated from rendering** so it's testable; images PNG/WEBP, audio **OGG**;
1-bit look preserved.

**Stage 2 steps:**
- **S2.0 — Setup & guardrails.** Repo structure, venv, pinned `requirements.txt`, `.gitignore`,
  `.claude/settings.json` permissions + reviewer subagent. A minimal async `main.py` that runs on
  desktop AND packages with pygbag — verify both before moving on.
- **S2.1 — Core engine.** Scene/state machine (pure logic) + renderer; Bayer dithering, single-line
  replacing text box, transition cards, terminal renderer (char-by-char + blinking cursor, readable
  speed), input (key/tap), audio bootstrap, pixelated scaling, local fonts.
- **S2.2 — Port the prototype scenes** faithfully (Scenes 1–2 and everything built in Stage 1).
- **S2.3 — Parser system (illustrated).** Forgiving verb–noun parser (safe matching), room/item/state
  model, characterful responses; unit-tested.
- **S2.4 — Top-down mode.** Tile movement, collisions, area transitions, simple combat, reflections;
  desktop keyboard AND on-screen touch controls (d-pad + action) for the PWA.
- **S2.5 — Content parity / the four games**, matching the signed-off prototype.
- **S2.6 — Audio & polish.** OGG sfx/ambience (author-supplied music), pacing pass, accessibility.
- **S2.7 — Packaging.** Web: `pygbag --archive main.py`; confirm it runs in desktop AND mobile
  browsers; add a PWA manifest + service worker that caches only our own assets. Desktop: PyInstaller
  bundles built on each OS (note macOS signing/notarization for later distribution).

---

## Definition of done (every step)
- It runs and the author can see/play the new part.
- Stage 2 additionally: runs with `python main.py` AND builds/runs under `pygbag`; logic covered by
  passing pytest where testable.
- No color, no glow; matches `docs/GAME_DESIGN.md` look and pacing.
- No `eval`/`exec` on input; saves JSON (no pickle); no network/telemetry; deps pinned.
- Claude Code has actually run it and seen it work before calling it done.

## Scope — out (for now, unless the author says otherwise)
Networking/multiplayer; controllers beyond keyboard + touch; localization; achievements; any backend
or accounts; procedural generation.

## Open decisions (author only)
Names (`[PLAYER]`, `[FRIEND]`, `[TRUE_NAME]`, `[TOWN]`, `[LANGUAGE]`); captive-release mechanic; final
confrontation choreography; full dialogue/props; per-room parser vocab; which points of interest use
Mode A vs Mode B; final images and music.

## Risks & mitigations
- *Drift from the current HTML* → follow it to a tee; add-only; the prototype is the spec for Stage 2.
- *Async refactor pain (Stage 2)* → build async-first from S2.0.
- *Web/desktop drift (Stage 2)* → test both each step; one codebase.
- *Unwinnable states* → required items always reachable; check each game.
- *Scope creep* → the four-game structure is the spine; new ideas go to a backlog, not mid-build.
- *AI assumptions* → plan mode + "ask, don't assume" + these docs as the source of truth.
