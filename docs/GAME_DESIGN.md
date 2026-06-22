# The Beast of Crystal Court — Game Design & Presentation Spec

This is the authoritative, plain-English description of the game: the story, the world, the systems,
and exactly how everything should look, be laid out, move, and feel. When building, follow this
document. If something here is missing or unclear, ask — do not invent it.

Names in brackets — `[PLAYER]`, `[FRIEND]`, `[BEAST]`, `[TRUE_NAME]`, `[TOWN]`, `[LANGUAGE]` — are
deliberately unset and must stay as placeholders until the author fills them in.

---

## 0. How we are building this (read first)

- **Stage 1 (now): finish the HTML/JS prototype.** Build the whole game inside the existing file
  `crystal-court-demo.html`. The author plays it to judge gameplay and story before any Python work.
- **`crystal-court-demo.html` is the source of truth. Follow it to a tee.** Do **not** change anything
  already in it. **Only ADD** new scenes/systems onto it as we go. The *only* change already made is
  that the friend's Linux-terminal typing was slowed for readability.
- **Images:** keep producing simple 1-bit stand-in/placeholder art (like the dithered classroom and
  the frozen video frame already in the file). The author will supply and drop in the **final images**.
- **Music:** the author will add **background music to certain scenes later**. Don't add audio; leave
  clear, labeled hooks where music will go.
- **Stage 2 (later, only after sign-off): port to Python** (pygame-ce + pygbag). See PROJECT_PLAN.

---

## 1. Premise

`[PLAYER]` is a young woman in her early 20s, curious and a little reckless. She tells classmates a
real local legend about Crystal Court, a shopping mall demolished years ago: on the right night, after
midnight, it reappears, running like it's still 1985 — shoppers, food court, theaters — and at dawn
it's gone again. A quiet classmate, **Howie**, overhears. Two weeks later he's missing, his car found
on the empty lot where the mall stood.

`[PLAYER]` and her friend `[FRIEND]` — a young man, a hacker who can find things that aren't meant to
be found — investigate, perform the ancient ritual that brings the mall back, and go in after Howie.
Inside is `[BEAST]`, an ancient creature that has fed on this gathering-ground for centuries. She is
the one who set this in motion, and the one who goes in. A girl saving a guy, her hacker friend
backing her up.

## 2. Characters

- **`[PLAYER]`** — early 20s woman, protagonist. Curious, brave, a bit reckless. Snarky in a
  Buffy-the-Vampire-Slayer register, warm underneath.
- **`[FRIEND]`** — a guy her age, her trusted hacker friend. Breaks into systems, finds data, builds
  tools. With her during the investigation and at the lot, but **cannot cross over** — only the one who
  gives blood in the ritual can. From inside she stays in contact by phone/text; he keeps feeding her
  information.
- **Howie** — the missing classmate; a wallflower. Late reveal: a retired demon hunter who tried to be
  a normal college kid, recognized what the legend really was, and went in to protect the town before
  `[PLAYER]` could. The creature caught him first. Saving him is how you win.
- **`[BEAST]`** — ancient, here for centuries. Collects people to **harvest their life energy**, an
  addiction it can never satisfy. Its true name `[TRUE_NAME]` is a late-game discovery.

## 3. World, creature, and rules

- **Crystal Court** was demolished in 2005 but appears frozen at its 1985 peak. The ground was a
  gathering place long before the mall — a fairground, a market — which is why the creature stays.
- The ancient **ritual** (older than the mall) opens the way into the creature's domain, which wears
  the mall's shape. When performed, the mall manifests in our world for **5 hours**, only in the dead
  of night. That window is the game's clock: get in, do the work, get out before it vanishes — anyone
  still inside when it fades is kept.
- The creature **lives in reflections** (windows, mirrors, the fountain, dark screens). In certain
  places — the atrium, the dead wings, anywhere its collection is densest — it **steps fully out** and
  hunts in the open. Glass-management helps but is not total safety.
- Its captives stand posed in storefront windows like **mannequins** — preserved, not aging, fully
  aware, **able only to move their eyes**. Some have been there decades.
- **Active dread:** once it notices `[PLAYER]`, it begins "preparing her spot" — an empty display in
  her size, then her clothes, then a mannequin with her face — visible while the clock runs.

## 4. The three rituals (keep these distinct)

1. **Summoning** (outside, before entering): after midnight and before dawn, under the moon; a sigil
   drawn in salt and ash over the old atrium footprint; an **ancient token** Howie used (police logged
   it but left it on the ground — `[PLAYER]` finds it); an **incantation** found in an old book on the
   Internet Archive (`[FRIEND]` finds it; she writes it down and carries it in); a few drops of her own
   blood from a pocketknife. Because the way opens only for whoever gives blood, **only `[PLAYER]`
   crosses.**
2. **The kill** (inside; needs both weapons): a **pure silver blade** from the sporting-goods store
   (clue scrawled on a shopping bag in the food court) **paralyzes** the creature; the **iron** stake
   beneath the atrium fountain **kills** it when driven in while speaking `[TRUE_NAME]` (the kill
   incantation, found in Howie's notebook). Both required; both always findable.
3. **Closing the portal** (final act): the sealing incantation is on a **missing page** from Howie's
   notebook; found inside; performed at the atrium circle to shut the portal for good.

## 5. Structure — four short games

Solved in order. Each has multiple solutions and some branching, but **every path stays winnable** and
always leads into the next game. Save often; save especially before any choice.

1. **Investigate & open the door** — learn what happened, reconstruct the ritual, gather its parts,
   perform it. (The current demo's Scenes 1–2 set this up.)
2. **Inside: survive, reach Howie, learn the enemy** — survive the reflections, find Howie, learn the
   creature can be killed and how (silver + iron + true name).
3. **Get the weapons and free Howie** — find the silver blade and the iron stake; **free Howie**.
   **The Howie/mannequin beat (important):** she finds Howie posed in a storefront like a mannequin.
   She talks to him, tells him she's there to save him. He can't move or speak — but **his eyes move**,
   the one thing captives can do, and he looks **down toward his pocket**. That guides `[PLAYER]` to
   notice a **small notebook** there. The notebook holds the beast's name, its origin, the kill
   incantation, and more (with a page missing — the sealing incantation, found later). His real name
   breaks his claim and frees him.
4. **Kill it and get out** — silver to paralyze, iron + true name to kill, which collapses the domain
   and seals the door; escape before the 5-hour clock ends.

**No human sacrifice, ever.** The only loss state is the clock running out (reload from a save).

---

# PRESENTATION SPEC

How the game looks and behaves on screen. The current playable file establishes the target; reproduce
it exactly and add to it.

## 6. Visual identity

- **Pure 1-bit: black and white only. No color. No glow. No neon.**
- **Dithering (ordered/Bayer)** provides all shading — light across a floor is dither bands fading from
  light to dark, not a gray gradient.
- **Reference register:** *World of Horror* and *Repose*. High contrast, stark, textured 1-bit.
- **Fonts:** "Press Start 2P" (title, marquee, small UI labels); "VT323" (body/narration); plain
  monospace for the terminal view. Bundle fonts locally.
- **Full-bleed:** the game fills the whole screen; never a small panel in a big empty page.
- **Art is authored by the designer** (a 30-year illustrator). Use simple 1-bit **stand-in** art for
  now; the author drops in final images. Don't invent finished art; ask before any new visual idea.

## 7. Animation policy

Mostly **static**. Motion is reserved for: the terminal typewriter, the texting "typing…" indicator,
blinking cursors, **transitions** (fades, the "TWO WEEKS LATER" blackout), and the top-down Zelda
sections (movement/combat). Everything else holds still. Respect `prefers-reduced-motion`.

## 8. Global UI conventions

- **Advancing text:** Enter or tap/click to continue; a blinking `[ ENTER ▸ ]` prompt shows when input
  is awaited.
- **Touch parity:** everything is playable by touch (the game targets a mobile PWA later). Zelda
  sections get on-screen controls; the typed parser uses the device on-screen keyboard on mobile.
- **Pacing matters.** Text never feels rushed or dumped. Honor the per-scene timings below.

## 9. Title screen

Black screen. The game's title in Press Start 2P, white, with a tagline in gray, and a blinking
`▶ PRESS START`. (Note: the current file's marquee reads "CRYSTAL COURT"; the game's full title is
**The Beast of Crystal Court** — leave the on-screen text as-is unless the author asks to update it.)
Pressing start begins Scene 1 and is the user gesture that lets audio start.

## 10. Scene 1 — Classroom (setup; NO parser here)

Pure setup, **no text-entry box**. Player presses Enter/taps to move through it.

- **Top of screen:** a 1-bit pixel-art classroom rendered in dither — three bright windows on the back
  wall, light falling across the floor in dither bands, desks as white line-art, figures as black
  silhouettes with a thin white rim. `[PLAYER]` and two friends toward the front; the quiet guy (Howie)
  alone near the back door.
- **Bottom of screen:** a text box showing **one line at a time**. Each new line **replaces** the
  previous (older dialogue disappears — it does NOT accumulate or scroll). The line is centered.

**Scripted beats — use this EXACT wording (it's what's in the current file). Enter/tap between each:**

1. *(narration)* Bio let out ten minutes ago. The lecture hall is nearly empty — you, two friends in no hurry to leave, and a quiet guy in the back taking his time with his books.
2. **YOU:** "Okay, you two have to hear this. The old mall — Crystal Court, the one they tore down?"
3. **YOU:** "Supposedly, after midnight, it comes back. The whole place lights up like it's still 1985 — the shoppers, the food court, the theaters, all of it. You can walk right in."
4. **YOU:** "And then at dawn it just… disappears again. Like it was never there."
5. **YOU:** "We should go check it out sometime. For fun."
6. *(narration)* The girl beside you already has her keys out. "No way. You are not getting me out there at night — that place was creepy when it was OPEN."
7. *(narration)* The other one doesn't look up from his phone. "That stuff isn't real."
8. **YOU:** "Whatever. You guys are lame."
9. *(narration)* They go back to their screens. You grab your bag and head for the door.
10. *(narration)* The quiet guy in the back still hasn't left — books half in his arms, just listening. He catches you looking and ducks out the door ahead of you. You don't think about it again.

On the final beat, one more Enter triggers the transition to Scene 2.

## 11. Transition — "TWO WEEKS LATER"

The screen goes fully **black**; **TWO WEEKS LATER** appears centered (Press Start 2P); holds ~1.5–1.8s
(or Enter/tap to skip); fades; then Scene 2 appears. This is the model for transition cards generally.

## 12. Scene 2 — Dorm, phone, and the hack

Full-screen; shows **one "stage" view at a time**. Layout top-to-bottom: **[ stage view ] →
[ narration ] → [ choices / ENTER prompt ]**. The stage cycles among three views; only one visible:

**A) Phone view.** A **small, centered** phone box (not stretched across). Its screen **scrolls
internally** as content grows — the box must **not** keep getting taller. Used for the news-feed card
(missing-person article) and the **texting** with `[FRIEND]`. Texting pacing:
- player's sent messages appear after ~300 ms, then ~600 ms pause;
- before each of `[FRIEND]`'s replies, a **"typing…" indicator** (three dots) shows for ~750 ms +
  ~30 ms/character, then the message appears. Deliberately unhurried; don't speed it up.
- texting reply choices are tappable chips. **(This is texting, not the adventure parser. The
  adventure scenes use typed commands — see §13. Do not turn the parser into menus.)**

**B) Terminal view (the hack).** When `[FRIEND]` starts hacking, the phone gives way to a **full,
Linux-style terminal**: thin title bar, white-on-black monospace, a prompt like `[FRIEND]@rig:~$ `
followed by a command that **types out character by character with a blinking block cursor**, then the
output prints below. **Typing speed:** the author has slowed this for readability (now ~110 ms/char);
keep it readable — do not speed it back up. The hack runs as real-feeling commands/output (SSH tunnel
to the police archive, `cat` the case file, `ls` the phone evidence, `file` the unposted video) with
short pauses between commands. When the video appears, a **Return to the phone** button shows beneath.

**C) Video view.** Choosing to view the clip shows it full on the stage — a 1-bit dithered still of a
dark lot with Howie's face lit by his phone — narration beneath ("…his mouth starts to move — the clip
freezes on the first frame"), then it returns to the phone.

**Scene 2 flow:** phone narration (dorm, midnight) → news-feed card → text `[FRIEND]` (slowed texting)
→ choice (real police report / check online first; both converge) → `[FRIEND]` agrees → **switch to
full terminal**, hack types out until the unposted video is found → **Return to the phone** → friend
mentions the video → choice **View the video / Not yet** (view → video view → back to phone) →
conversation continues → they decide to **meet at the campus library at 9 the next morning** →
**END OF SCENE 2.**

## 13. The typed parser (Scott Adams style) — illustrated

The exploration/puzzle parts use a **typed command parser**, not menus. The player must **think of
solutions and type them** (`look`, `examine token`, `take knife`, `use iron`, `go north`). Figuring
things out is the fun; menus would make it a story, not a game. **Do not replace the parser with
selectable menus.**

- **These scenes are illustrated.** Each location shows an **image of the scene on top and the text /
  parser input underneath** (image on top, words below). Use 1-bit stand-in art for now.
- Simple, forgiving **verb–noun** parser (synonyms; ignore filler words). **Never `eval`/`exec` player
  input** — match a known vocabulary with plain string handling.
- Characterful responses to unrecognized input that nudge without listing answers.
- The command box is one line; on mobile it raises the on-screen keyboard (expected).
- Keep an internal map of rooms/items/state so puzzles can gate on progress — never so hard the game
  becomes unwinnable.

## 14. Inside the mall — top-down (Zelda-style) and the two interaction modes

**Immediately after `[PLAYER]` gains entry to the mall, the view becomes a top-down, Zelda-style map of
the mall interior.** She walks from place to place; screen transitions move between areas. Controls:
desktop arrow keys / WASD + an action key; mobile/PWA on-screen **d-pad + action button(s)** (both
exist). Keep movement/collision/combat in testable logic modules.

When she reaches a **point of interest**, it triggers **one of two interaction modes** — both are used
in the game, at different times (the author picks per location):

- **Mode A — text overlay, with optional deep-dive.** A **box overlay of text** describes the thing.
  If the player chooses to **investigate** it, the screen changes to a **framed "scene" presentation**
  like **Scene 1** (the framed scene-with-text-box look) — or, if she's texting `[FRIEND]` outside,
  like **Scene 2** (we may see his **computer/terminal screen** again, or just the **phone
  conversation**). After the beat, it returns to the top-down map.

- **Mode B — parser.** The **typed parser** comes up and asks what to do next; the player types a
  command. This view is **illustrated**: an **image of the scene on top, the words/parser underneath**
  (per §13). After resolving, it returns to the top-down map.

So inside the mall, the loop is: explore top-down → reach a point of interest → enter Mode A or Mode B
→ resolve → back to the map.

## 15. The clock and saves

- The 5-hour in-world window times the inside sections; running out is the loss state.
- The player can **save frequently** (offer it before choices). Saves use JSON (never pickle); in the
  HTML build, keep state in memory (no browser storage).

## 16. Audio (author adds later)

- The author will add **background music to certain scenes later**, and final sound effects. For now,
  keep the sparse retro UI blips already in the file and **leave clear, labeled hooks** where music and
  final sfx will go. Don't add audio files. (In the Python build, all audio is OGG.)

## 17. Things not yet decided (do NOT invent — ask the author)

- The names: `[PLAYER]`, `[FRIEND]`, `[TRUE_NAME]`, `[TOWN]`, `[LANGUAGE]`.
- Exactly how captives are released (tied to the energy-harvest motive — to be designed).
- The precise choreography of the final confrontation and its branches.
- Full dialogue, in-game props (police report, news article, notebook pages), per-room parser
  vocabulary, and which points of interest use Mode A vs Mode B.
- Final images (author-supplied) and background music (author-added).
