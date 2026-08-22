# Visual Representation System

The Visual Representation System (VRS) keeps canonical facts independent from
the medium used to show them.

```text
Character / Appearance / Scene / Performance
                    ↓
          Representation Model
          + Abstraction Budget
          + Style Atoms / Package
          + RepresentationBinding
                    ↓
             StyleCompile
```

Natural Human Rendering, Anime Character Rendering, Manga Graphic Rendering,
Illustration, Stylized 3D and Hybrid are representation families inside Style.
They are not additional Skills and they do not own character identity.

## Representation foundation

A production StylePackage should define these fields together:

- `representationModel`: family plus geometry, surface, light, depth, visual
  and temporal grammar;
- `abstractionBudget`: `literal`, `restrained`, `moderate`, `high` or
  `symbolic` treatment for geometry, proportion, feature abstraction,
  silhouette, surface, material, colour, light, line, depth, motion,
  expression, physics and detail;
- `detailBudgetByScale`: what remains controllable in close-up, medium,
  full-body and wide views;
- `identityTranslationPolicy`: canonical anchors to preserve, transformations
  allowed by the medium and transformations that are forbidden.

These are provider-neutral semantics. Adapter weights, embeddings, landmarks
and mesh morph targets belong to capability-aware adapter bindings.

## RepresentationBinding

`RepresentationBinding` binds one exact CharacterSpec, optional
CharacterMorphologySpec and one exact StylePackage. Each mapping rule names:

- one scope such as eyes, face geometry, surface, silhouette, hair, costume or
  performance;
- source semantics and preserved anchor IDs;
- a medium-specific representation rule and abstraction level;
- allowed and forbidden transformations;
- the shot scales where the rule remains visible.

The same StylePackage can serve many characters through different bindings.
Do not create a character-specific copy of the whole style. An active binding
requires exact refs, cross-representation review and human approval.

## Controlled style exploration

When the creator has a feeling but no style terminology:

1. create one `StyleExplorationBrief` with fixed Character, Appearance, Scene,
   action, camera and physical light;
2. create two to six options that vary one axis only;
3. generate every option independently and assemble deterministically;
4. separate technical eligibility from user preference;
5. record editable `StylePreferenceFeedback` and either explore the next axis
   or draft a StylePackage.

Do not auto-activate a style and do not use a universal style/beauty score.
Named creators or works are input aliases only; resolve them into observable
medium, geometry, line, surface, shading, colour, depth, motion and postprocess
grammar.

## Family grammar

### Photoreal / NHR

Prioritize literal anatomy, regional surface variation, differentiated
materials, motivated light, optical depth and restrained postprocess.

### Anime

Define feature abstraction, eye constraints, hair mass grouping, line
hierarchy, cel layers, designed palette, expression amplification and temporal
pose grammar. Omit photographic pores unless the package is explicitly hybrid.

### Manga

Define ink hierarchy, black/white rhythm, screentone or hatching, negative
space, readable silhouettes and effect language. Director owns panel count,
order and dramatic information; Style owns borders, gutters, ink and graphic
grammar. Exact dialogue and sound-effect text are assembled deterministically.

### Illustration and stylized 3D

Illustration controls mark-making, paper/paint surface, edges, ornament and
planar depth. Stylized 3D controls volume, virtual material appearance, light and
camera treatment. A 3D-looking image is not a mesh, rig or glTF asset.

### Hybrid

Hybrid style is scope-based: state geometry, eyes, skin, hair, costume,
background, light and motion separately. Do not encode an unexplained
“50% style A + 50% style B” as canonical semantics.

## Compatibility and review

Atoms declare compatibility, conflicts and inheritance deltas. Physical Scene
light can be represented graphically, but style cannot move the source.
Photographic pore detail conflicts with flat cel skin unless a scoped hybrid
rule resolves it. Photographic bokeh conflicts with deliberately flat graphic
depth unless Director and Style explicitly scope the layers.

Review by family-specific dimensions and use PASS/WARN/FAIL findings. A failed
hair silhouette, ink hierarchy or cel-shadow layer is repaired in that one
owned variable while passing identity, camera, colour and composition remain
unchanged.
