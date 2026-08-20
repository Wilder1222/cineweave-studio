# General text-to-image Prompt management

Use this reference whenever the creator wants to create, import, organize, normalize, compare, version, reuse, review or repair a text-to-image Prompt. Cinematic directing is one domain profile, not the default shape of every Prompt.

## Prompt as a managed asset

Do not treat a Prompt as one disposable string. A managed Prompt has:

- a stable `promptId`, human title, version and lifecycle status;
- a broad domain such as portrait, product, fashion, architecture, landscape, food, character, fantasy, illustration, editorial, social, abstract, technical or cinematic;
- one purpose and one primary visual target;
- positive and negative prompt text plus inspectable semantic blocks;
- variables for reusable slots instead of copied prompt forks;
- semantic reference bindings using Observation IDs, not raw paths or private URLs;
- bounded variants with a one-variable change note;
- evaluation criteria, known risks and the next experiment;
- provenance and a change log so the parent is never silently overwritten.

The canonical storage contract is [`../../../schemas/prompt-record.schema.json`](../../../schemas/prompt-record.schema.json). It is separate from the cinematic [`image-prompt-output.schema.json`](../../../schemas/image-prompt-output.schema.json), which remains the richer shot-design package for film and storyboard work.

## Management operations

Choose the smallest operation that matches the request:

- `create`: build a new PromptRecord from an intent;
- `import`: preserve the user's original text, then normalize it into semantic blocks;
- `normalize`: clarify ordering, remove duplication and identify contradictions without changing intent;
- `update`: create a new version and append a change log;
- `fork`: create a child Prompt for a new target while preserving the parent reference;
- `compare`: explain differences between versions or variants;
- `review`: score clarity, target focus, reference fit, controllability and risk;
- `compose`: fill variables and produce a ready-to-use positive/negative pair;
- `repair`: change the smallest variable associated with an observed failure;
- `archive`: make a Prompt unavailable for default reuse without deleting its history.

Never overwrite a prior version and never claim that a Prompt produced a successful image. A Prompt is a design and management artifact; generated media requires a separate human-gated RenderPlan and verified Draft import.

## Reference gallery routing

When a creator asks whether a reference image is suitable, which category to use, or how to reproduce a visual treatment, read [`prompt-gallery.md`](prompt-gallery.md) first and then one matching category. Keep the gallery index small and high-signal; do not paste every example into the active context. Score a reference for the declared purpose and role, preserve source and rights metadata, and separate what to preserve, borrow and exclude. If the bundled gallery has no relevant case, use a user-supplied or rights-cleared reference and say that the gallery is inconclusive.

For any domain, make the observation order explicit when it affects the result: canvas or layout, target and arrangement, observer viewpoint and crop, light/color/material behavior, bounded style grammar, then technical and negative constraints. Put exact visible text in quotes with placement and typography instructions. For an edit, state `change only X; preserve Y` and keep camera, identity and layout invariants visible.

## Director-first translation

The same observation-first compiler applies to every Prompt domain. The camera may be literal in a cinematic or photographic Prompt, or it may be an observer viewpoint and layout decision in a product, illustration or abstract Prompt.

Translate abstract intent through this chain:

`emotion or quality word → visible effect → observer/camera decision → composition and subject state → light/color/material behavior → physical proof → targeted negative`

Use these as translations, not as mandatory vocabulary:

| Vague input | Observable Prompt decision |
|---|---|
| “电影感” | one capture moment, explicit shot scale or viewpoint, focus relationship, depth layers and motivated light |
| “高级感” | one clear primary target, controlled negative space, restrained palette, clean silhouette and deliberate material response |
| “氛围感” | time/weather, light direction, atmosphere density, color relationship and the subject's readable state |
| “真实感” | believable anatomy or geometry, contact and cast shadows, perspective scale, material-specific highlights and natural asymmetry |
| “唯美” | calm pose or gaze, selected palette, soft but motivated light, controlled bloom and an explicit exclusion of plastic skin |
| “史诗感” | scale anchor, low/high viewpoint when justified, layered depth, architectural or environmental proportion and a readable subject-to-world ratio |

Keep the original feeling in `purpose` or a style label if useful, but do not let it stand in for the decisions that create the feeling. The positive Prompt must be ready for a reviewer to visualize without relying on the adjective alone.

## Observation-ready checklist

Before activating a Prompt, confirm:

- the observer or camera position, crop or layout is stated when it affects the result;
- the primary target and the first visual read are unambiguous;
- the subject has a visible state, action, pose or arrangement;
- foreground, subject and background relationships are described when depth matters;
- the light source or graphic hierarchy is concrete rather than merely “beautiful”;
- materials have observable behavior such as sheen, translucency, roughness, grain, steam or reflection;
- each important emotion has at least one visible consequence;
- negative constraints remove a likely failure instead of repeating generic quality slogans.

## Domain profiles

Use domain to select the relevant vocabulary. Do not force camera or dramatic language into a non-cinematic Prompt.

| Domain | Add when relevant | Do not add by default |
|---|---|---|
| `cinematic` | shot purpose, lens, blocking, motivated light, continuity | generic “cinematic” adjectives |
| `portrait` | identity anchors, expression, pose, skin/hair, wardrobe | invented biography |
| `product` | product geometry, material, hero angle, surface cleanliness | narrative action that obscures the item |
| `fashion` | silhouette, fabric, styling, pose, editorial space | random props and unrelated scenery |
| `architecture` / `interior` | scale, structure, perspective, materials, circulation | portrait-only language |
| `landscape` | geography, atmospheric depth, season, terrain and light | unsupported World facts |
| `food` | ingredients, plating, texture, steam, surface and lens distance | impossible garnish or duplicate utensils |
| `character` / `fantasy` | identity, costume, prop, silhouette and world cues | unbounded lore presented as fact |
| `illustration` / `anime` | line, shape language, rendering method and palette | live-action realism requirements unless requested |
| `editorial` / `social` | audience, layout, hierarchy, crop and readable text | hidden text or brand claims |
| `abstract` / `technical` | transformation rule, geometry, diagram or material logic | literal subject assumptions |

## Assembly order

For a general Prompt, assemble in this order and omit blocks that do not serve the intent:

1. output goal and primary target;
2. subject, identity and state;
3. action or arrangement;
4. composition, crop and spatial hierarchy;
5. environment or supporting objects;
6. lighting, color and atmosphere;
7. material, finish and rendering behavior;
8. bounded style grammar;
9. technical constraints and exact text when needed;
10. targeted negative constraints.

The cinematic profile adds professional shot language between composition and lighting. A product or illustration Prompt does not need a lens, camera movement or physical realism block merely because the Skill can express them.

## Variables and variants

Use `{{variableName}}` slots for values that should change repeatedly. Each variable must state its type, meaning and default or allowed values. Keep a variant focused on one experiment, such as:

- change only the background;
- change only the palette temperature;
- change only the crop or aspect ratio;
- change only the material finish;
- change only the subject action.

Do not create ten near-identical Prompt strings when one template and a bounded variant set explains the difference.

## Reference binding

Every reference input receives one explicit semantic role: `identity`, `composition`, `lighting`, `style`, `material`, `background`, `mask` or `reference`. State what is preserved, what may transform and what must be excluded. A style reference must not silently replace identity; a lighting reference must not rewrite the subject; a composition reference must not change World geography.

## Review rubric

Before activating a Prompt, review:

- one primary visual target;
- clear domain and intended output use;
- observation-ready camera/viewpoint, composition, subject state and visual consequences;
- enough concrete nouns and observable constraints;
- no contradictory camera, light, material or style instructions;
- variable names actually explain the intended experiment;
- references are scoped and rights/identity concerns are visible;
- negative constraints target likely failures rather than listing generic quality words;
- provider-neutral core contains no secrets, endpoints, task IDs or unsupported claims.

If a Prompt fails, record the observed failure and repair one variable at a time. Keep the parent version intact.
