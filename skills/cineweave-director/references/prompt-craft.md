# Cinematic prompt craft

Use this checklist after the director and cinematography layers have made their decisions.

## Observation before adjectives

Start with one sentence that could be spoken by a director or photographer:

> 镜头站在哪里，以什么距离和高度观察谁；主体此刻正在做什么；画面先让观众看到什么；光线从哪里来。

If this sentence is missing, the Prompt is not ready for style language. “电影感、高级感、氛围感、真实感” may describe intent, but they cannot replace the observer position, subject state, composition, light direction, material response or physical evidence that produces the result.

## Construction order

Write the prompt in a stable, skimmable order:

1. canvas and aspect ratio;
2. World anchors and intended use;
3. observer position, crop and first visual read;
4. one primary subject or visual target;
5. dramatic action moment or visible subject state;
6. layout and depth layers;
7. camera and capture context;
8. materials, lighting and palette as separate controls;
9. realism anchors;
10. bounded style stack;
11. short, targeted negative constraints.

For CineWeave, this is a rendering of the structured `promptBlocks`, not a second source of truth. Do not introduce new World facts while making prose smoother.

## Concrete density

Prefer concrete nouns and visible relationships over generic praise. A complex frame usually needs several specific objects, two to four material or lighting constraints and a clear spatial relationship. Do not stack “masterpiece”, “ultra-detailed” or “8K” in place of a shot decision. Every important feeling should leave visible evidence in posture, gaze, framing, light, color, material or atmosphere.

## Capture context

Use one dominant capture frame: observer position, focal length when relevant, camera height, angle, focus and a plausible light source. Too many camera specifications create contradictions. For photorealism, describe how the image is captured and what physical evidence supports it. For non-photographic work, replace lens language with viewpoint, crop, layout and graphic hierarchy rather than forcing a fake camera specification.

## Layout and exact text

If the image contains a poster, title, label or storyboard grid:

- decide the canvas and regions before describing detail;
- keep required text verbatim and mark it as exact text;
- specify hierarchy, placement and readability;
- use a dedicated text constraint instead of hiding copy inside style adjectives.

## Variants

Keep the DirectingSpec stable. Change one variable at a time: lens, camera height, reveal timing, light ratio, cloud density, subject scale or palette—not all of them together. Record the changed variable in `allowedChanges`.
