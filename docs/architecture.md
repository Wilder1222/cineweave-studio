# CineWeave Studio v2 architecture

## Core rule

Every CineWeave Skill is **standalone first, composable second**.

Standalone means it can accept a direct user brief and optional references,
then return its own smallest contract. Composable means it can consume exact,
versioned outputs from other Skills without relying on hidden chat memory,
implicit global state or a circular handoff.

## Layers

```text
Intent layer
  natural language + declared reference roles
          ↓
Optional router
  CreativeBrief + WorkflowPlan
          ↓
Specialist asset layer
  Character | Scene | Style | Director | Production
          ↓
Contract layer
  exact refs, version, content hash, locks, rights and evidence
          ↓
Human-approved execution boundary
          ↓
Candidate observation → review → one-variable repair
```

The router is an ergonomic entry point, not an orchestrator that owns every
creative decision. It plans work; it does not create a character, scene, style,
shot or production artifact itself.

## Ownership and handoffs

| Domain | Owner | Direct starting point | Typical composed input |
|---|---|---|---|
| intake and workflow | `cineweave` | vague multi-domain request | optional exact refs |
| character exploration, identity and performance | `cineweave-character` | feeling, cards or character brief | CreativeBrief, CharacterOptionSet, StyleCompile |
| geography and interaction | `cineweave-scene` | scene brief | CharacterBinding, StyleCompile |
| representation and reference policy | `cineweave-style` | style brief/reference set | CharacterSpec, SceneSpec, CreativeBrief |
| shot language and prompt assembly | `cineweave-director` | one-off image or storyboard request | bindings, StyleCompile, controls |
| repeatability and quality gates | `cineweave-production` | recipe or rights/QA request | approved creative contracts |

The strict precedence is:

1. rights, consent and supplied Canon;
2. locked character and scene facts;
3. approved appearance and scene states;
4. shot bindings and interaction constraints;
5. director decisions;
6. hard and soft production controls;
7. style and adapter details.

Lower-priority layers may not overwrite higher-priority facts.

## Zero-prompt character exploration

Character development may start from a feeling rather than facial terminology.
The `cineweave-character` Skill owns the sequence below; the optional router
only creates the editable `CreativeBrief` and directed workflow.

```text
feeling / six simple cards
        ↓
CharacterExplorationBrief
        ↓
CharacterOptionSet (one variable per candidate round)
        ↓
Director prompt compilation + Production deterministic candidate board
        ↓
QualityGate + user CharacterPreferenceFeedback
        ↓
explicit draft CharacterSpec → neutral evidence → human lock
```

`QualityGate` checks anatomy, age alignment, representation fit, artifacts and
declared rights. It is intentionally separate from `CharacterPreferenceFeedback`:
the product records what the user prefers in a bounded option set and never
issues a universal beauty score, silently infers biometrics or auto-locks an
identity. Style and presentation remain lower-priority render inputs, not
identity facts.

## Contract package and portable bundles

The source contract package lives at `packages/cineweave-contracts`.

```text
packages/cineweave-contracts/
├── contracts/manifest.json
├── schemas/
├── examples/
├── recipes/
└── references/
```

Each Skill declares its needed contract kinds in `skills/<skill>/contracts.json`.
`scripts/build-skill-bundles.mjs` materializes a temporary bundle with only those
schemas and recipes under `resources/`. The build rewrites package-local schema
and recipe links, then validates that no repository contract path remains.

This provides one source of truth during development and portable specialist
Skill bundles during distribution.

## Composition rules

`WorkflowPlan` describes a directed acyclic graph. Each step names:

- specialist Skill and route;
- standalone or composed invocation mode;
- required and produced contracts;
- explicit dependencies;
- a human selection or approval gate when appropriate.

The workflow is deliberately not an execution engine. It does not invoke paid
providers, create media, mutate Canon or grant rights. It is a visible plan a
user or future product runtime can execute safely.

## V2 verification

The release gate verifies:

- package metadata and V2 contract ownership;
- all schema/example pairs and deterministic recipes;
- each Skill's independent contract interface;
- single-owner routes and no legacy Director brief route;
- direct-activation and composition fixture coverage;
- no cycles in workflow examples;
- source links and generated portable bundles;
- semantic, evidence, capability, rights and privacy controls.
