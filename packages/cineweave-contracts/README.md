# CineWeave Contracts

`cineweave-contracts` is the versioned exchange layer for CineWeave Studio.
It contains the canonical schemas, examples, recipes and ownership manifest used
by every independent CineWeave Skill.

The package is the source of truth during development. `scripts/build-skill-bundles.mjs`
materializes only the contracts required by each Skill into a portable bundle, so
specialist Skills remain usable without the `$cineweave` router.

## Layout

- `contracts/manifest.json` — ownership, routes, contract and recipe index.
- `schemas/` — provider-neutral JSON exchange contracts.
- `examples/` — one valid example per contract.
- `recipes/` — built-in deterministic production recipes.
- `references/` — shared contract semantics.

Contracts are immutable inputs and outputs. A Skill may compose exact contract
references, but it must not silently mutate an upstream asset or infer a missing
locked fact.

## Zero-prompt character discovery

The Character domain also contains `CharacterExplorationBrief`,
`CharacterOptionSet` and `CharacterPreferenceFeedback`. Together they let a
user start from a feeling or simple cards, compare controlled directions and
explicitly converge toward a draft identity. Technical quality checks remain
separate from subjective preference; no contract creates a universal beauty
score, infers biometrics or auto-locks identity.

`recipes/character-exploration-board-4up.json` defines the corresponding
independent candidate Tile plan. It is an AssetRecipe only: execution stays
provider-neutral and human-approved.
