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
- enough concrete nouns and observable constraints;
- no contradictory camera, light, material or style instructions;
- variable names actually explain the intended experiment;
- references are scoped and rights/identity concerns are visible;
- negative constraints target likely failures rather than listing generic quality words;
- provider-neutral core contains no secrets, endpoints, task IDs or unsupported claims.

If a Prompt fails, record the observed failure and repair one variable at a time. Keep the parent version intact.
