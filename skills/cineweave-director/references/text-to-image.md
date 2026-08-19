# Text-to-image prompt layer

Use this reference when the creator wants a cinematic still, storyboard frame, keyframe candidate or a prompt package for Codex interactive image generation.

## Prompt compilation order

Compile the prompt from decisions, not adjective accumulation:

1. World anchors: only supplied identity, era, geography, costume and Canon facts;
2. dramatic moment: the action beat and what changes in the frame;
3. subject and blocking: who is present, what they do and their spatial relation;
4. mise-en-scène: architecture, props, foreground obstruction, depth layers and scale anchors;
5. camera: shot scale, angle, height, focal length, focus target and composition;
6. light and material: motivated source, direction, exposure relationship, surface response, palette and atmosphere;
7. cinematic realism: plausible anatomy, fabric behavior, physically coherent perspective, atmospheric depth and controlled lens behavior;
8. restrained style stack: one primary visual grammar with only the support styles required by the intent;
9. technical constraints: framing, aspect ratio or capture intent when supplied;
10. targeted negatives: likely failure modes for this shot.

The concise prompt is a compact rendering of the same decisions. The expanded prompt may explain relationships, but must not introduce new World facts.

## Cinematic realism

“Cinematic” is not a substitute for a shot design. “Realistic” is not a substitute for physical evidence. Prefer:

- a motivated key or backlight with a readable falloff;
- coherent shadow direction and contact shadows;
- skin, hair, textile, stone, metal and wood with distinct material response;
- believable atmospheric perspective and scale;
- natural asymmetry, restrained expression and imperfect but intentional environment detail;
- lens depth and motion cues that match the selected focal length;
- a controlled palette rather than a global color filter.

Avoid generic stacks such as “8k, ultra-detailed, award-winning, masterpiece” unless they are explicitly requested and do not replace camera, light or material decisions.

## Negative constraints

Negatives should name the failure to prevent: duplicated limbs, identity drift, costume mutation, impossible light, plastic skin, game-render ornament, floating architecture, unreadable action, over-wide lens distortion or accidental text. Do not use a long universal negative list that suppresses useful detail.

## Provider boundary

Keep the prompt package provider-neutral. Do not include vendor-specific model names, hidden parameters or claims of generation. A prompt package is a Codex-owned draft until the user reviews the result and imports real media.
