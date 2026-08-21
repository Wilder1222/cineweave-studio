# Asset recipes

An AssetRecipe is not a prose prompt. It is a repeatable production task graph with shared invariants, one primary delta per task, deterministic assembly, failed-task-only retry and acceptance rules.

## Recipe policy

1. Choose one output purpose: identity, expression, turnaround, action, appearance, scene state, establishing frame or storyboard board.
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
