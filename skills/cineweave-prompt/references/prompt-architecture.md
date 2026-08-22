# Prompt architecture

## The observation sentence

Start with one sentence that fixes the image's perceptual logic:

`The camera observes [subject] at [decisive visible moment] from [viewpoint], so [attention order and spatial relation] are readable.`

This sentence is useful for photography, illustration, product images and architecture. “Camera” may mean a literal lens or the chosen visual viewpoint of a non-photographic medium.

## Layer order

Compile only the layers that matter:

1. purpose and primary target;
2. subject identity, stable surface baseline or object structure;
3. current visible state, including makeup and baseline-relative skin/material condition;
4. current action and performance;
5. environment and subject–environment relation;
6. viewpoint, framing, composition and depth;
7. physical light sources, shadow behavior and exposure relation;
8. material response and surface condition;
9. representational medium, realism and retouch treatment;
10. canvas, aspect ratio and delivery constraints;
11. targeted failure prevention.

Facts outrank style. Identity and geometry outrank decoration. A negative constraint cannot repair a contradictory positive prompt.

When a `RepresentationBinding` is supplied, compile canonical identity through its scale-aware mapping before applying StyleCompile wording. Preserve its semantic anchors and forbidden transformations; never bypass it with a generic “more anime” or “more realistic” rewrite.

## Detail budget

For every detail ask:

- Is it visible at this framing?
- Does it distinguish the desired result?
- Does it conflict with another instruction?
- Is it locked, preferred or free?
- Is the model likely to allocate attention to it?

Remove details that fail these checks. A close portrait may need facial structure, skin zones, gaze, hair contact and key light, but not precise leg musculature. A full-body action frame may need silhouette, joint load and garment movement, but not pore-level detail. An architectural wide shot needs massing and circulation before small ornament.

For portraits, keep four sources traceable even when the final sentence reads fluently: CharacterSpec owns stable identity and surface baseline, CharacterAppearanceState owns the current skin/makeup condition, RepresentationBinding owns medium-specific anchor translation, and StyleCompile owns realism/retouch representation. A style adjective cannot rewrite either Character source.

## Chinese compilation pattern

```text
镜头从略低于眼平的位置，以自然透视观察雨后檐下的成年女性。她刚听见身后脚步，眼神先向右后方移动，头部只转到三分之四角度；前景湿木柱形成窄框，中景人物与门槛保持清晰承重，后景庭院被雨雾压低。北向漫射天光是主光，廊下暖灯只提供局部反射；丝麻衣料、湿木和石地具有不同粗糙度与高光。低饱和月白、茶褐与青灰，克制写实，不磨皮，不使用无来源的全局辉光。
```

The value comes from viewpoint, timing, depth, source light and material response—not from adding “8K, masterpiece, cinematic.”

## Concise versus expanded

The concise form carries the decisive controls. The expanded form may add scoped identity, geometry, material and validation blocks. If expansion only repeats synonyms, keep the concise form.
