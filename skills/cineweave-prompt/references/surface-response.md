# Conditional surface-response compilation

Load this guide only when the requested acceptance criteria depend on a visible
skin, body, hair, textile, metal, glass or liquid response. It is not a generic
“make it realistic” word list and it never turns a stylized source into proof
of physical material facts.

## Ownership preflight

Before writing surface wording, keep the owners distinct:

- CharacterSpec owns a stable human surface baseline, protected marks and
  anatomy; it does not own a flattering light treatment.
- CharacterAppearanceState owns a current visible skin, makeup, hair or costume
  state such as hydration, coverage, roughness or temporary condition.
- SceneLightState owns physical sources; Director owns how those sources reveal
  the visible form, viewpoint, focus and contact.
- StyleCompile owns representational treatment, retouch and shot-scale
  readability; it cannot whiten a baseline complexion, erase a protected mark
  or invent a material state.
- Prompt compiles only source-backed or user-declared visible consequences. Raw
  media first requires a role-scoped Reference observation; missing evidence is
  an explicit unknown or a target intention.

## Four-part compilation pattern

Use only the parts that matter at the requested framing.

1. **Material and current state** — name the material class and visible state:
   `semi-matte facial skin with restrained regional variation`, `lightweight
   translucent gauze`, `brushed metal`, or `slightly hydrated but not wet
   lower-leg skin`.
2. **Source and reflection geometry** — state the source size, direction and
   what it can reflect: `a large vertical front-side diffuser creates a broad
   soft reflection that follows the shin curve`; not an unexplained “glossy
   skin” adjective.
3. **Visible form and contact** — retain the shape that gives the reflection a
   credible carrier: knees, shin plane, calf taper, ankle points, cloth folds,
   strap pressure, hand contact, ground support or occlusion shadow.
4. **Shot-scale detail** — reserve close-up detail for visible close-ups. At
   full body, prioritize silhouette, material separation, joint structure and
   support; do not request pore-scale detail across the frame.

## Targeted recipes

### Face and close portrait

- Use diffuse-to-soft transitions, regional warm/cool variation, restrained
  highlight on the visible planes, eye/lip moisture only if visible and a
  source-consistent catchlight.
- Avoid uniform porcelain coverage, a single mirrored T-zone or beauty-filter
  smoothing that removes protected identity information.

### Full body and limbs

- Tie a broad highlight to a large source and let it narrow, soften or break as
  the limb turns away from that source.
- Preserve only visible structural cues: knee contour, shin plane, calf taper,
  ankle point, foot support and relevant strap/garment pressure.
- Use occlusion and contact shadows where limbs overlap, fabric meets skin or
  feet meet the support. A bright highlight without structure and contact reads
  as plastic rather than hydrated skin.

### Textile, jewelry and hard surfaces

- Textile: state weave or layer, thickness, opacity, fold scale, tension,
  translucency and edge transmission relative to the source.
- Metal, glass or beads: state roughness, edge highlight, reflected scene
  content and occlusion; do not call every hard surface “mirror-like.”
- Keep different material classes visibly different under the same source; do
  not make skin, satin and metal share one identical white streak.

## Guardrails

- Do not default to `wet`, `oily`, `latex`, `mirror-like`, `body oil`, global
  bloom or unqualified “subsurface scattering.” Use those only when the user
  explicitly requests a visible state and it is compatible with the source and
  task.
- Do not equate translucency with lighter skin, change a baseline complexion or
  use microtexture as a biometric or quality claim.
- Do not use the same high-frequency detail at close-up, full body and wide
  scale. Do not invent pores, muscles, garment construction or reflection
  content that the target cannot show.
- Do not use material language to silently change identity, age, body
  proportion, scene geography, physical-light placement or provider settings.

## Acceptance and one-variable repair

Check the rendered result against observable questions:

1. Does the highlight follow the form and agree with the declared source and
   shadow direction?
2. Are material classes distinct without becoming wet, plastic, rubber or
   overexposed by default?
3. Are the visible structure, support, folds, pressure and contact relations
   still readable at this shot scale?
4. Is the level of skin/hair/textile detail appropriate for the crop?

Route a failure to the smallest owner: source placement to Scene/Director,
current hydration or makeup to AppearanceState, representation/retouch to
StyleCompile, and assembly wording or targeted negative to Prompt. Preserve all
passing dimensions; do not compensate by adding an undifferentiated list of
material adjectives.
