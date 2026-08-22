# Style system

Use this reference to design reusable style taxonomy, atoms, recipes and packages.

## Four layers

```text
StyleCategory   browsing and discovery only
StyleAtom       one observable, scoped visual or temporal rule
StyleRecipe     compatible atom composition with invariants and deltas
StylePackage    production-ready recipe + references + policy + compiler + validation
```

Do not make the category tree carry every combination. Store atoms independently and create recipes only for common, validated combinations. A user may still compose an unlisted combination at runtime.

## Atom domains

Use only the domains that affect the current target:

`medium`, `representation`, `character`, `culture`, `costume`, `production_design`, `linework`, `shading`, `color`, `lighting`, `composition`, `cinematography`, `performance`, `motion`, `temporal`, `postprocess`.

An atom must state:

- what it changes;
- observable invariants;
- bounded variables;
- forbidden or conflicting traits;
- compatible domains;
- whether it applies to image, video, or both;
- what evidence or references are needed.

Examples of useful atoms:

```text
medium.live_action
representation.naturalistic_photoreal
culture.china.song.southern_song_literati
costume.song.restrained_literati
linework.ink.fine_variable
shading.high_white_sparse_ink
lighting.soft_motivated_window
cinematography.reaction_first_progressive_reveal
performance.restrained_microexpression
temporal.contemplative_slow
```

“宋韵”“黑白漫画”“导演式” are not sufficient atoms. They must resolve into multiple scoped atoms.

## Recipe composition

A recipe selects atoms by role and declares:

- priority and scope;
- invariants that survive atom changes;
- allowed variation;
- forbidden combinations;
- whether the recipe is image-only, video-only or dual-medium;
- which child atoms override a parent recipe.

Example:

```yaml
recipe: song_poetic_monochrome_comic
atoms:
  - culture.china.song.southern_song_literati
  - medium.comic.monochrome
  - character.elegant_naturalistic
  - linework.ink.fine_variable
  - shading.high_white_sparse_ink
  - composition.scroll_like_negative_space
  - performance.restrained_microexpression
invariants:
  - historically_coherent_silhouette
  - high_negative_space
  - readable_identity_anchors
forbidden:
  - glossy_3d_surface
  - neon_palette
  - uncontrolled_anime_eye_scale
```

## StylePackage activation gate

Mark a package `active` only when it has:

1. a semantic definition and atom composition;
2. explicit image and, when relevant, temporal behavior;
3. a reference policy and rights status;
4. at least one positive validation case and one boundary or negative case;
5. a compiler profile that does not contain model secrets, endpoints or unsupported vendor flags;
6. a human decision if the package will be reused across a project.

Record this decision in `activationGate`: `status: approved`, `rightsResolved: true` and `validationPassed: true`. A draft package may be compiled for exploration, but it must not be presented as an approved reusable project style.

## Identity-preserving style conversion

When converting the same character across live action, hand-drawn animation, black-and-white comic or stylized 3D:

- preserve semantic identity anchors, personality, behavior and narrative role;
- translate the representation of those anchors for the medium;
- state which surface traits are intentionally reinterpreted;
- keep exact CharacterSpec and AppearanceState refs outside the StylePackage;
- review identity after conversion rather than assuming the style compiler preserved it.

Style is a renderer of approved semantics, not a replacement for those semantics.

Treat each representation family as a separate compile artifact, not a numerical blend. A photoreal approval does not implicitly authorize its anime, manga, illustration, stylized-3D or hybrid version. Each version binds the same identity anchors through an exact `RepresentationBinding`, protects AppearanceState, Scene geography and physical light, and receives its own review.

Within a compile, express priority as `required`, `strong` or `supporting`. Those levels communicate creative intent across adapters; they are not prompt weights, model flags or a request to expose provider-specific syntax.

## Realism at compile time

Do not encode “realism” as one opaque quality token. StylePackage may define the representation family and surface grammar; StyleCompile may instantiate a calibrated `realismProfile` for one target and shot scale. Keep anatomy fidelity, microdetail readability, material differentiation, natural asymmetry, optical imperfection, idealization and beauty retouch independently adjustable.

These are provider-neutral normalized creative-intent values. They describe how approved facts are rendered, not a person’s physical skin, a biometric measurement or a promise that a Provider will produce a realistic image. Stable surface facts remain in CharacterSpec and temporary visible skin state remains in CharacterAppearanceState.
