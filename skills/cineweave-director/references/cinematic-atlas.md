# Cinematic reference atlas

Use this file as the routing index for visual examples and prompt patterns. Do not load every case by default. Choose one category for a normal request and at most two or three for a deliberate hybrid.

## Categories

| Category | Use when | Primary decisions |
|---|---|---|
| `cinematic-still` | A single live-action-looking frame or Keyframe candidate | shot purpose, lens, light, material, frozen action |
| `cinematic-reveal` | The visual information is delayed or discovered | occlusion, parallax, camera path, reveal peak |
| `portrait-realism` | Identity, performance or costume is primary | face/identity anchors, focal length, skin and textile response |
| `portrait-character-design` | A stylized or fantasy character portrait is the visual source | identity anchors, adornment, costume, palette, close-up gesture; do not treat painterly marks as photographic evidence |
| `architecture-scale` | Architecture or landscape carries the dramatic weight | scale anchors, lens distortion, depth layers, atmospheric perspective |
| `storyboard-frame` | A frame belongs to a sequence or board | shot size, duration, transition, continuity, frame prompt |
| `reference-edit` | A supplied observation should guide an edit or inpaint | reference roles, preserve contract, mask semantics |
| `chinese-visual-language` | The brief needs restrained Chinese visual grammar | silhouette, textile construction, palette, architecture, negative space |

## Loading policy

1. Read this index first.
2. Load the smallest matching reference module.
3. Use `prompt-craft.md` for a weak prompt, dense layout, exact text, complex scene or prompt repair.
4. Use `reference-editing.md` whenever a reference image, observation set or mask is involved.
5. Do not treat a gallery pattern as a World fact, Canon fact or tested generation result.

## Case metadata

Future atlas entries should preserve:

- stable case ID and category;
- intended use and route;
- shot language or layout pattern;
- visual invariants and allowed variations;
- `original`, `official`, or `adapted` source type;
- source URL and attribution when the case is not original;
- safety, copyright and identity notes.

The atlas is a teaching reference, not a prompt dump. Prefer a small set of high-signal CineWeave cases over a large generic image library.

## Included recommended cases

- [`portrait-character-design/dark-fantasy-portrait-user-upload.json`](atlas/portrait-character-design/dark-fantasy-portrait-user-upload.json): a user-supplied dark-fantasy portrait. Use it primarily for `identity` and character-design evidence; use it only as a supporting `style` or palette reference for cinematic-realistic image generation. Its rights status is unverified, so do not redistribute or publish the asset without confirming permission.

When an atlas case is selected, read its metadata before adding it to a `ReferenceSet`. Keep one explicit semantic role per input, state the preserve contract, and separate stylized character evidence from photographic camera or realism evidence.
