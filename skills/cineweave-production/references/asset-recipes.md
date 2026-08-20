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

Built-in recipes live under `recipes/` and are indexed by `recipes/catalog.json`.
