# Comic and manga panel direction

Use this reference when the requested output is a manga/comic panel sequence,
page, strip or graphic storyboard.

## Ownership

- Story owns beat causality, dialogue and the state change between panels.
- Character owns identity, appearance and performance intent.
- Scene owns geography, contact surfaces, props and physical light.
- Style owns ink, shape, black-mass, screentone, effect, gutter and typography
  grammar.
- Director owns panel purpose, information order, blocking, viewpoint, crop,
  eyeline, action state and reading sequence.
- Production executes each panel separately, retries only failed panels and
  assembles the exact page deterministically.

Style may define a preference for narrow gutters or borderless emotional
panels. It must not decide that a story beat needs five panels. Director chooses
the minimum panel count needed to make information, pressure or state change.

## Panel sequence method

1. Bind an exact Story beat or state the bounded dramatic unit.
2. List the information the reader knows before and after each panel.
3. Give each panel one dominant readable state: reaction, preparation, action,
   impact, consequence or reveal.
4. Preserve geography, screen direction, eyelines, contact and prop state.
5. Use crop, scale, angle, overlap and negative space to control attention.
6. Add motion effects only when their direction and force are motivated.
7. Finish every panel as an independent generation task.
8. Assemble borders, gutters, bubbles, captions, sound effects and exact text
   after accepted panel images exist.

## Required boundaries

- Do not request a model to generate a complete final lettered page in one
  image call.
- Do not treat photographic depth of field as the default depth language.
  Manga may use overlap, scale, perspective, black-mass separation and edge
  density instead.
- Do not let speed lines conceal a weak pose or broken action direction.
- Do not let a style reference silently supply character identity or story
  content.
- Exact dialogue must remain authored text. Generated glyphs are not evidence
  that typography is correct.

## Review

Review panel purpose, reading order, silhouette, facial readability, eyeline,
occlusion, prop continuity, black/white hierarchy and negative space separately.
When one panel fails, preserve accepted panels and repair the smallest owner
variable before deterministic reassembly.
