# Asset recipes

An AssetRecipe is not a prose prompt. It is a repeatable production task graph with shared invariants, one primary delta per task, deterministic assembly, failed-task-only retry and acceptance rules.

## Recipe policy

1. Choose one output purpose: identity, morphology, style exploration, representation fixture, expression, turnaround, action, appearance, scene state, establishing frame, cross-representation sheet or storyboard board.
2. Lock shared identity, appearance, scene, camera, background and lighting facts before defining task deltas.
3. Generate each contact-sheet tile independently.
4. Change one primary semantic variable per task. Numeric intensity and concealment may refine that same variable.
5. Assemble with deterministic layout code, never by asking an image model to render labels and a complete grid in one pass.
6. Retry failed tasks only and keep accepted tasks immutable.
7. A recipe plans production; it does not prove generation.

Built-in recipes live in the [contract recipe catalog](../../../packages/cineweave-contracts/recipes/catalog.json).

## Character development sheets

For a reusable character workflow, keep these artifacts distinct:

- a hero portrait tests face presentation, appearance and capture style;
- a full-body frame tests silhouette, proportions, garment weight and ground contact;
- `recipe.character-turnaround-3view` tests front/side/back construction;
- `recipe.character-expression-sheet-3x3` tests bounded performance variation.

The last two recipes share the exact identity and appearance inputs but use different one-variable task deltas. A combined delivery may place their accepted outputs on one deterministic canvas, but must retain each recipe/task provenance, preserve tile resolution and retry failed tasks only. Labels, borders and layout are assembly concerns, never image-model content requirements.

## Character exploration board

`recipe.character-exploration-board-4up` comes before identity lock. It accepts
a `CharacterExplorationBrief`, a `CharacterOptionSet` and production controls;
an EvidenceBundle is optional for a first zero-prompt round because no image
evidence should be invented. Each of the four tiles selects one option and
keeps the brief's framing, camera, light, background, grooming, wardrobe and
expression fixed. The only task delta is the option selection.

The board is a comparison surface, not a one-pass image prompt and not a score
sheet. Assemble independent tiles deterministically, retry only failed tiles,
then route quality review and user selection back to `$cineweave-character`
`character_converge`. Do not automatically convert a selected option into a
locked CharacterSpec.

## Morphology and style exploration

`recipe.character-morphology-neutral-3view` validates one semantic morphology
checkpoint in neutral front, three-quarter and profile views. Grooming,
wardrobe, expression, camera family, background and light remain fixed. The
view is the only task delta. A passing board still needs human approval before
identity lock.

`recipe.style-exploration-board-4up` performs the orthogonal experiment. It
holds exact CharacterSpec, AppearanceState, SceneSpec, action, framing, camera,
background and physical light constant. Each tile selects one option on the
single axis declared by StyleExplorationBrief and StyleOptionSet. The board may
support preference feedback; it cannot auto-activate a StylePackage.

## Representation-family fixtures

`recipe.natural-human-fixtures-3up` tests neutral close, warm backlight and
natural full-body conditions. It covers anatomy, regional surface variation,
eyes/lips, hair, motivated light, optical falloff, weight and contact.

`recipe.anime-character-fixtures-3up` tests neutral close, expression medium
and action full body under one exact anime RepresentationBinding and
StyleCompile. It covers identity translation, bounded geometry, eye design,
hair masses, line hierarchy, cel shading, palette and background integration.

`recipe.manga-character-fixtures-3up` tests neutral ink, dramatic medium and one
action panel under one exact manga binding and compile. It covers identity
contour, ink hierarchy, black mass, screentone, silhouette, negative space and
motivated motion effects. Exact text, bubbles and page furniture are assembled
after accepted panels exist.

These recipes are not interchangeable. HumanRealismBench must not reject anime
for omitting pores, and MangaBench must not require photographic bokeh.

## Cross-representation sheet

`recipe.cross-representation-character-6up` compares photoreal, anime, manga,
illustration, stylized-3D and scope-based hybrid candidates. All six use one
neutral expression, pose, view, framing, appearance, scene content and physical
light. Only `representation.family` changes, and every family must have an exact
RepresentationBinding plus StyleCompile.

Review semantic facial relations, signature silhouette, distinctive marks,
hair identity, body rhythm and gesture fingerprint. Pixel similarity alone is
not sufficient evidence. Retry one failed tile and preserve every accepted
tile before deterministic reassembly.
