# CineWeave Contracts 2.3.1

`cineweave-contracts` is the canonical exchange layer for CineWeave Studio. Its
manifest records 60 contract kinds, one owner per contract and one owner per
Skill route.

## Domains

- Router: CreativeBrief and WorkflowPlan.
- Story: StoryBrief, BeatSheet, ScriptScene and ContinuityLedger.
- Character: exploration, identity, appearance, binding, PerformanceTimeline,
  review and repair.
- Scene: geography, state, physical SceneLightState, interaction and repair.
- Style: StylePackage, reference policy, StyleCompile and StyleLightGrammar.
- Director: proposals, ShotSpec, ShotLightingPlan, TemporalSpec, storyboard,
  reference review and render planning.
- Prompt: PromptRecord, ImagePrompt, PromptHypothesis, DraftBrief and PromptRepair.
- Production: recipes, controls, evidence, capability, rights, adapter
  descriptors, exact execution requests, receipts and benchmarks.
- Runtime: project, artifact, exact dependency graph, approval, safe project
  bundle, board-provenance and Skill-evaluation records.

## Layout

- `contracts/manifest.json` — suite version, ownership and route index.
- `schemas/` — provider-neutral JSON Schema contracts.
- `examples/` — a valid example for every manifest contract.
- `recipes/` — deterministic production recipes.
- `references/` — shared semantics.

Each Skill declares its portable subset in `skills/<skill>/contracts.json`.
`scripts/build-skill-bundles.mjs` copies only that subset and rewrites local
links. A specialist therefore remains usable without `$cineweave` or the source
repository layout.

## Evolution policy

Artifacts are immutable. Additive 2.2, 2.3.0 and 2.3.1 schemas do not rewrite
valid 2.0, 2.2 or 2.3.0 payloads.
A dependent artifact references exact kind, ID, version and content hash; it
never means “latest.” Breaking data-shape changes require a new contract version
and a non-destructive migration report.

Schema validity is necessary but not sufficient. Semantic tests also enforce
causal beats, non-overlapping performance phases, physical/style light
separation, source-bound shot lighting, ordered temporal events, one-variable
repair, deterministic grids, execution authorization/cost integrity, artifact-
graph summaries, safe bundle manifests and evaluation-summary consistency.
