# CineWeave Creative Skills v1.1 architecture

## Design principle

CineWeave separates reusable creative facts, one-shot bindings, production recipes, execution capability and observed evidence.

```text
┌──────────────────────── Semantic asset plane ────────────────────────┐
│ CharacterSpec → AppearanceState → CharacterBinding                  │
│ SceneSpec     → SceneState      → SceneBinding                      │
│ InteractionConstraintSet                                             │
└──────────────────────────────┬───────────────────────────────────────┘
                               ↓
┌──────────────────────── Director plane ──────────────────────────────┐
│ narrative purpose → blocking → camera → storyboard/image prompt      │
└──────────────────────────────┬───────────────────────────────────────┘
                               ↓
┌────────────────────── Production-control plane ──────────────────────┐
│ AssetRecipe + ControlChannelSet + EvidenceBundle                     │
│ + CapabilityProfile + LicenseProfiles + ControlBenchmark             │
└──────────────────────────────┬───────────────────────────────────────┘
                               ↓
┌──────────────────────── Execution boundary ──────────────────────────┐
│ human-approved RenderPlan → adapter/interactive tool → real media     │
└──────────────────────────────┬───────────────────────────────────────┘
                               ↓
┌──────────────────────── Evidence plane ──────────────────────────────┐
│ Candidate Observation → ControlBench/Review → one-variable Repair    │
└──────────────────────────────────────────────────────────────────────┘
```

## Asset, state, binding and recipe

| Layer | Lifetime | Purpose |
|---|---|---|
| Spec | across shots and productions | immutable identity or geography plus declared variables |
| State | across a bounded appearance/environment period | assigns variables declared by its parent Spec |
| Binding | one shot | selects active anchors, behavior, spatial state and interaction |
| AssetRecipe | one production artifact class | decomposes generation into deterministic tasks and assembly |
| RenderPlan | one approved execution proposal | resolves refs, capabilities, rights, canvas and verification gates |

`CharacterSpec` and `SceneSpec` are reusable facts. `CharacterAppearanceState` and `SceneState` are controlled overlays. `CharacterBinding`, `SceneBinding` and `InteractionConstraintSet` are shot contracts. `AssetRecipe` does not change any of them; it determines how to produce and assemble an artifact.

## Four-skill ownership

### Character

Character owns who a subject is and how that exact identity performs:

- structural face, body and silhouette anchors;
- natural asymmetry and skin/body evidence;
- makeup, hair, costume construction, material, pairing and condition;
- behavior causality, emotion trajectory, micro-expression and motion fingerprint;
- reference planning, identity review and one-variable repair.

### Scene

Scene owns where the shot occurs and how the subject physically relates to it:

- geography, zones, paths, entrances, scale and architecture;
- time, weather, background layers, atmosphere and motivated lighting;
- contacts, support, weight, occlusion, prop relations and environment response;
- scene reference planning, review and one-variable repair.

### Director

Director owns why and how the audience sees the moment:

- dramatic question, beat and attention order;
- blocking, shot scale, angle, height, lens, focus and movement;
- storyboard continuity and frozen frame prompts;
- composition of exact Character, Scene and Interaction bindings;
- provider-neutral ReferenceSets and RenderPlans.

### Production

Production owns repeatability and execution readiness:

- task decomposition and deterministic assembly;
- hard, soft and advisory control priority;
- evidence role/scope/quality/rights;
- adapter capability matching and known limits;
- code, weight, dependency, asset and identity-rights gates;
- cross-contract ControlBench evaluation.

## Control precedence

1. World Canon, identity consent and publication rights;
2. locked CharacterSpec and SceneSpec facts;
3. approved AppearanceState and SceneState;
4. CharacterBinding, SceneBinding and InteractionConstraintSet;
5. Director shot purpose, blocking, camera and composition;
6. hard production controls;
7. soft production controls;
8. lighting/material supporting references;
9. advisory style references;
10. adapter implementation parameters.

A lower layer cannot silently overwrite a higher layer. A hard control must use `fallback.action = block`. Partial or experimental adapter support requires explicit review and cannot satisfy a hard control as though it were strong support.

## Evidence roles

An Observation is not a universal reference. EvidenceBundle assigns one explicit role and scope to every item, for example:

```text
face identity        → identity / face
body proportions     → identity / body
costume construction → appearance / costume
pose                  → performance / pose
depth                 → geometry / depth
mask                  → edit / mask
light direction       → lighting / lighting
scene geography       → scene / environment
```

A style image cannot satisfy identity evidence. A pose map cannot redefine body proportions. A composition reference cannot move locked geography. Evidence quality and rights are evaluated separately.

## Interaction model

`InteractionConstraintSet` makes character–environment coordination observable:

- contact points: body part, target, relation and pressure;
- support and body-weight distribution;
- acyclic occlusion order;
- prop ownership, grip and hand continuity;
- motivated light source, cast shadow and contact shadow;
- wind, rain, moisture, hair and garment response;
- acceptance checks and evidence requirements.

The system treats these constraints as reviewable requirements, not guaranteed model behavior. Failed interaction tasks route to a scoped repair rather than a global regeneration.

## Deterministic multi-panel production

Contact sheets, turnarounds, action boards and storyboards are generated as independent tasks:

```text
shared invariants
  + one task delta per tile
  + per-task acceptance check
  + failed-task-only retry
  + deterministic assembly
```

The image model does not draw labels, borders or the final grid. Assembly adds them after approved media exists. Passing tiles remain immutable.

## Capability and license gates

A CapabilityProfile describes adapter-class support such as:

- face or full-body identity;
- whole-body pose and expression control;
- multi-character capacity;
- virtual try-on;
- depth, segmentation, mask and relighting;
- maximum reference count;
- known limits.

It contains no endpoint, credential or account-specific parameter.

A LicenseProfile separately records code, model weights, base model, dependencies, assets, identity consent, commercial use, redistribution, publication and data handling. Public availability never implies commercial permission or likeness consent.

## Evidence loop

```text
ReferencePlan / AssetRecipe
          ↓ human-selected Observations
EvidenceBundle + Controls + Capability + Rights
          ↓ human-approved RenderPlan
Candidate Observation
          ↓ expected-versus-observed checks
ControlBench / CharacterReview / SceneReview
          ↓ one failed variable
CharacterRepair / SceneRepair / task retry
```

A Review is not a repair. A Repair is not proof of success. Candidate media remains immutable and every subsequent result receives new evidence identifiers.

## Cross-device operation

The GitHub plugin contains Skills, schemas, recipes, examples and tests. User-specific World facts, CharacterSpecs, SceneSpecs, rights records and media remain in CineWeave Web or approved creator storage. Another computer installs the same plugin, receives minimal exact refs and returns receipt-backed structured output.
