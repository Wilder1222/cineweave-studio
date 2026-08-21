# Text-to-image prompt layer

Use this reference when the creator wants a cinematic still, storyboard frame, Keyframe candidate or a prompt package for Codex interactive image generation. For portrait or character-reference requests, load `portrait-reference-craft.md` as the role/ownership layer before compiling these blocks. If a style package, fine-grained style or cross-image/video style continuity is requested, resolve `$cineweave-style` first and retain its exact binding.

## Prompt compilation order

Compile the prompt from decisions, not adjective accumulation:

1. World anchors: only supplied identity, era, geography, costume and Canon facts;
2. dramatic moment: the action beat and what changes in the frame;
3. CharacterBindings: preserve exact CharacterSpec/AppearanceState refs, visible identity anchors and current performance state;
4. SceneBinding: preserve exact SceneSpec/SceneState refs, active zones, geography anchors and camera topology;
5. subject and blocking: who is present, what they do and their spatial relation;
6. mise-en-scène: architecture, props, foreground obstruction, depth layers and scale anchors;
7. camera: shot scale, angle, height, focal length, focus target and composition;
8. light and material: motivated source, direction, exposure relationship, surface response, palette and atmosphere;
9. cinematic realism: plausible anatomy, fabric behavior, physically coherent perspective, atmospheric depth and controlled lens behavior;
10. compiled StylePackage directives: medium, representation, costume, lighting, palette and post-process channels in their declared scope;
11. technical constraints: framing, aspect ratio or capture intent when supplied;
12. targeted negatives: likely failure modes for this shot.

The concise prompt is a compact rendering of the same decisions. The expanded prompt may explain relationships, but must not introduce new World or character facts.

## Character prompt blocks

When a CharacterBinding is present, keep these concerns separate:

- `characterIdentity`: only immutable anchors visible at this shot scale;
- `characterBody`: proportion, silhouette, center of gravity and dominant side when visible;
- `characterPerformance`: current action arc and observable behavior;
- `wardrobe`: current controlled appearance state;
- `subject`: a concise human-readable summary of the complete subject.

Do not pour close-up skin details into a wide shot or repeat head-to-body ratio in a face close-up. A style reference must not overwrite identity, and a pose reference must not redefine body proportions.

## Scene prompt blocks

When a SceneBinding is present, keep these concerns separate:

- `sceneGeography`: active anchors, zones, paths, entrances, exits and scale;
- `sceneArchitecture`: placed structures, support and construction;
- `sceneMaterials`: visible material identity, aging and physical response;
- `sceneLighting`: motivated sources, direction, exposure and shadows;
- `sceneAtmosphere`: weather, visibility and particle direction;
- `spatialContinuity`: camera axis, side, screen direction, prop placement and zone relations.

A style or composition reference must not rewrite SceneSpec geography.

## StyleCompile handoff

`styleBinding` is optional for a purely local Prompt, but required when the request names an exact StylePackage or asks for repeatable fine-grained style behavior. For an image target, use the StyleCompile visual channels in the `style` prompt block and preserve the exact package/compile refs in the binding. For a video target, keep `motion` and `temporal` directives separate from image appearance; a static style image cannot be presented as evidence for camera movement, editing rhythm, dynamic light or secondary motion.

Style directives are advisory to locked CharacterSpec, AppearanceState, SceneSpec, SceneBinding, InteractionConstraintSet and Director camera decisions. If a style package conflicts with one of those facts, expose the conflict and preserve the higher-priority fact rather than flattening the conflict into prose.

## Cinematic realism

“Cinematic” is not a substitute for a shot design. “Realistic” is not a substitute for physical evidence. Prefer:

- a motivated key or backlight with a readable falloff;
- coherent shadow direction and contact shadows;
- skin, hair, textile, stone, metal and wood with distinct material response;
- believable atmospheric perspective and scale;
- natural asymmetry, restrained expression and imperfect but intentional environment detail;
- lens depth and motion cues that match the selected focal length;
- a controlled palette rather than a global color filter.

Avoid generic stacks such as “8k, ultra-detailed, award-winning, masterpiece” unless explicitly requested and they do not replace camera, light, material or identity decisions.

## Negative constraints

Negatives should name the failure to prevent: duplicated limbs, identity drift, face-geometry drift, body-proportion drift, dominant-side flip, costume mutation, pose reference overwrite, impossible light, plastic skin, game-render ornament, floating architecture, unreadable action, over-wide lens distortion or accidental text. Do not use a long universal negative list that suppresses useful detail.

## Provider boundary

Keep the prompt package provider-neutral. Do not include vendor-specific model names, hidden parameters or claims of generation. A prompt package is a Codex-owned draft until the user reviews the result and imports real media.
