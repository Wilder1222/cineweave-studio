# Cinematic prompt craft

Use this checklist after the director and cinematography layers have made their decisions.

## Construction order

Write the prompt in a stable, skimmable order:

1. canvas and aspect ratio;
2. World anchors and intended use;
3. one primary subject or visual target;
4. dramatic action moment;
5. layout and depth layers;
6. camera and capture context;
7. materials, lighting and palette as separate controls;
8. realism anchors;
9. bounded style stack;
10. short, targeted negative constraints.

For CineWeave, this is a rendering of the structured `promptBlocks`, not a second source of truth. Do not introduce new World facts while making prose smoother.

## Concrete density

Prefer concrete nouns and visible relationships over generic praise. A complex frame usually needs several specific objects, two to four material or lighting constraints and a clear spatial relationship. Do not stack “masterpiece”, “ultra-detailed” or “8K” in place of a shot decision.

## Capture context

Use one dominant capture frame: focal length, camera height, angle, focus and a plausible light source. Too many camera specifications create contradictions. For photorealism, describe how the image is captured and what physical evidence supports it.

## Layout and exact text

If the image contains a poster, title, label or storyboard grid:

- decide the canvas and regions before describing detail;
- keep required text verbatim and mark it as exact text;
- specify hierarchy, placement and readability;
- use a dedicated text constraint instead of hiding copy inside style adjectives.

## Variants

Keep the DirectingSpec stable. Change one variable at a time: lens, camera height, reveal timing, light ratio, cloud density, subject scale or palette—not all of them together. Record the changed variable in `allowedChanges`.
