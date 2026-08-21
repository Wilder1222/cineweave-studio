# Portrait and character-reference craft

Use this module when a creator asks how to reproduce a portrait reference, wants a character-style Prompt, needs to judge a portrait reference, or wants Chinese and English Prompt variants. Convert the reference into observable evidence and role-scoped decisions; do not copy a long descriptive paragraph into every Prompt.

## Ownership boundary

- A one-off or reusable portrait Prompt belongs to `$cineweave-prompt`.
- Reusable face, body, likeness, identity anchors or a stable character DNA belong to `$cineweave-character` and must become a CharacterSpec or CharacterBinding.
- Reusable makeup, hair, costume and accessory states belong to `$cineweave-character` as an AppearanceState. Director consumes the exact state and does not silently rewrite it.
- Director owns shot purpose, blocking, camera and shot-light use. Scene owns
  physical light state; Style owns representational treatment; Prompt owns
  assembly, versioning, scoped negatives and acceptance checks.
- If the source is a real person, recognizable character or copyrighted production, require supplied permission status. Do not infer a right to copy the face, signature or authorial style.

## Decompose the reference before writing a Prompt

Record visible evidence, confidence and intended transfer for each applicable layer:

| Layer | Observe | Mapping or handoff |
|---|---|---|
| `identity` | face geometry, feature relationships, skin surface, asymmetry, body silhouette and distinctive marks | `CharacterSpec`/`CharacterBinding` when reusable; otherwise scoped identity reference |
| `appearance` | makeup placement, hair construction, loose strands, ornaments, costume silhouette and garment construction | `AppearanceState`/character handoff; use `wardrobe` only when supplied to the shot |
| `performance` | torso direction, head turn, gaze, mouth, hands, breath, weight shift and frozen action | `characterPerformance`, `actionMoment` and observable emotion cues |
| `composition` | crop, subject scale, foreground shoulder or obstruction, first visual read and negative space | `shotDesign.composition`, `prompt.blocks.composition` |
| `capture` | viewpoint, camera height, distance, focal-length hypothesis, focus target, depth and optical softness | `camera` block; mark inferred lens details as hypotheses unless supplied |
| `lighting` | motivated source, direction, key/fill/rim relation, falloff, exposure and shadow consistency | `lighting` or `sceneLighting` block |
| `materials` | skin, hair, silk, satin, metal, beads, flowers and wall response to light | `materials`, `sceneMaterials` and realism anchors |
| `palette_grade` | hue relationship, saturation, contrast, grain, halation and sharpening level | bounded `style`, `technical` and negative constraints |
| `environment` | background structure, location clues, atmosphere and scale | `sceneBinding`/environment block; never infer World geography |

For every statement, ask: “Could a reviewer point to this in the image?” If not, label it as an inference or leave it unknown. A painterly highlight is evidence of a visual treatment, not proof of a real light source or photographic skin.

## Emotion-to-observation compiler

Keep the feeling in the intent, then give it visible consequences. Use these as hypotheses, not fixed formulas:

| Intent | Observable candidates |
|---|---|
| 清冷、疏离 | held or direct gaze, restrained mouth, turned shoulders, limited gesture, quiet negative space, controlled contrast |
| 警觉 | eyes lead the turn, torso lags behind the face, chin remains slightly guarded, partial occlusion or asymmetry |
| 被打断、回头 | body faces away, face returns toward the observer, hand or breath freezes at the capture moment |
| 温柔、亲近 | relaxed eyelids, open shoulders, gentle contact, softer shadow transition and reduced spatial barrier |
| 神秘 | incomplete information, controlled occlusion, selective focus, restrained palette and one unresolved visual area |

Do not write “冷艳、神秘、高级” as the only performance direction. State what the viewer sees first, how the subject is holding the body and which light, crop or material behavior carries the mood.

## Portrait Prompt recipe

Use this order and omit irrelevant layers:

1. canvas and crop;
2. observer position and first visual read;
3. subject state and action moment;
4. identity and appearance anchors;
5. light direction and exposure relationship;
6. material response and physical skin/hair evidence;
7. palette and bounded grade;
8. camera and focus hypothesis;
9. targeted negatives and preserve contract.

For a close portrait, phrases such as “head-and-shoulders crop”, “shoulder as foreground depth layer”, “focus on the nearer eye”, “soft directional window light with restrained fill” and “low-contrast film response” are useful only when they serve the stated composition. `85mm`, `3:4`, `35mm grain` or `halation` are capture hypotheses, not universal quality tokens; keep them only when the user requests or the reference provides enough evidence.

For skin and textile realism, specify physical evidence: fine pores, peach fuzz, small tonal variation, natural under-eye texture, irregular satin sheen, real folds, worn edges, distinct metal reflections and contact shadows. Avoid “flawless”, “porcelain”, “perfectly symmetrical”, “ultra-detailed” and other words that suppress natural variation.

If exact text is present, quote it and specify placement, hierarchy and typography separately from portrait style. Do not hide copy inside a mood paragraph.

## Multi-reference separation

Prefer separate references when the creator wants both identity and a new treatment:

1. `identity`: face/body/likeness anchors; route persistent identity to `$cineweave-character`.
2. `appearance`: makeup, hair, costume and accessories; route reusable states to `$cineweave-character`.
3. `capture_style`: crop, camera, light, palette and grade; Director-owned style/camera evidence.
4. `environment_material`: location, background, textile or surface behavior when needed.

Bind one role and scope per input. Declare `preserve`, `borrow` and `exclude`. A style or capture reference cannot replace identity; an appearance reference cannot change body proportions; a lighting reference cannot relocate the subject. Do not expose provider-specific “reference strength” numbers in the provider-neutral Prompt core. Express priority through role, scope, preserve contract and allowed transforms; put adapter-specific weights in a later capability-aware RenderPlan if supported.

## Character DNA handoff

When the user wants an original character to remain recognizable across clothes, poses and scenes, route a compact handoff rather than keeping a prose-only identity block:

- face: geometry, feature relationships, surface and natural asymmetry;
- body: silhouette, proportions, center of gravity and dominant side;
- appearance variables: makeup, hair, wardrobe and accessory states;
- performance: posture, gaze, face, hands, breath and signature gestures;
- rights: source class, likeness consent and redistribution status.

The Director may describe how these bindings are observed in a shot, but the owning Character Skill decides which traits are immutable, controlled or forbidden to change.

## Failure-driven negatives

Choose only failures likely for this reference: plastic or waxy skin, over-smoothed face, copied likeness, exaggerated symmetry, makeup becoming theatrical, accessory duplication, stiff pose, crossed pupils, malformed hands, hair penetrating the face, costume redesign, impossible light, over-sharpened HDR, unreadable exact text or an unmotivated background. Do not attach a universal negative list to every portrait.
