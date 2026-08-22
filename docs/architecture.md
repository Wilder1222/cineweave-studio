# CineWeave Studio v2.5 architecture

## Design contract

Every specialist is **standalone first, composable second**. Standalone means it
can accept a direct brief and return its smallest owned artifact. Composable
means it can consume exact upstream kind/ID/version/hash refs without hidden
chat state, implicit “latest” resolution or circular artifact dependencies.

The optional `$cineweave` Skill is an intake router, not a creative super-Skill.

## Layers

```text
Intent and optional untrusted reference media
              ↓
Optional CreativeBrief / WorkflowPlan
              ↓
ReferenceAsset → atomic Observation / Review / BindingSet
              ↓
Story ─ Character ─ Scene ─ Style
              ↓
Director ActionSequenceSpec → ShotSpec / ShotLightingPlan / TemporalSpec
              ↓
PromptRecord / ImagePrompt
              ↓
Production recipes, evidence, capabilities and rights
              ↓
AdapterDescriptor + exact ExecutionRequest artifact
              ↓
Exact-request approval when external effects are requested
              ↓
Trusted registered adapter + verified ExecutionReceipt
              ↓
Candidate observation → review → one-variable repair
```

The dependency direction is selective. A bounded task bypasses unrelated
layers. A workflow is a DAG of route invocations, so a Skill may appear in two
phases without an artifact referencing its own downstream output.

## Ownership matrix

| Domain | Owner | Does not own |
| --- | --- | --- |
| intake and workflow | `cineweave` | specialist artifacts |
| story causality and continuity | `cineweave-story` | shots or image prompts |
| semantic morphology, identity, stable surface baseline, appearance state and actor behavior | `cineweave-character` | medium, camera or scene geography |
| geography, materials, interaction and physical light | `cineweave-scene` | post-process look or shot source selection |
| style exploration, RepresentationBinding, visual/temporal grammar and realism treatment | `cineweave-style` | canonical identity, physical skin/material state, geography or source placement |
| reference bytes, observations, suitability and role bindings | `cineweave-reference` | character/scene/style design, rights grants or provider execution |
| action beats, sequence coverage and continuity, blocking, camera, shot light use and time | `cineweave-director` | story causality, persistent identity, scene geography, stunt-safety approval or general prompt library |
| text-to-image prompt assets | `cineweave-prompt` | story causality or shot invention when a ShotSpec is required |
| recipes, evidence, capability, rights, execution intent and QA | `cineweave-production` | creative facts, credentials, endpoints or claims that execution succeeded |

## Separations with high leverage

### Reference evidence

`ReferenceAsset` binds one exact local byte sequence. `ReferenceObservation`
binds one role and one full, spatial, temporal, spatiotemporal or mask selector.
`ReferenceReview` judges suitability for a declared purpose.
`ReferenceBindingSet` orders exact observations, resolves role conflicts and
applies rights gates for exact target contracts. Character, Scene, Style,
Director and Prompt consume these records without taking ownership of ingest or
silently treating one upload as identity, costume, pose and style at once.

For portrait decomposition, the common evidence split is:

```text
face_identity  → CharacterSpec identity
skin_surface   → CharacterSpec stable baseline
skin_material  → CharacterAppearanceState current state
makeup / hair  → CharacterAppearanceState
capture        → ShotSpec viewpoint and focus hypothesis
palette/style/surface_style → StyleCompile representation and realism treatment
all accepted observations → exact post-target ReferenceBindingSet → ImagePrompt
```

Static capture evidence describes visible perspective and focus cues. Focal
length, aperture, hardware and motion remain inferred unless trusted metadata
or declarations establish them. Normalized skin/realism values are creative
intent, not biometric or physical measurements, provider controls or quality
guarantees.

SHA-256 answers “are these the same bytes?” only. Content-credential trust,
copyright, license scope, likeness consent, training, publication and
redistribution remain separate evidence and policy decisions.

### Identity, appearance and representation

V2.5 treats character design as three orthogonal spaces:

```text
CharacterMorphologySpec → CharacterSpec identity
                                  ×
                    CharacterAppearanceState
                                  ×
                         StylePackage
                                  ↓
                    RepresentationBinding
                                  ↓
          photoreal / anime / manga / illustration / 3D / hybrid
```

Morphology axes and structural relations are provider-neutral design intent,
not biometric measurements, landmarks, embeddings, blendshapes or model
weights. A neutral front/three-quarter/profile MorphologyReview plus an exact
human approval is required before identity lock.

StylePackage defines a representation model, abstraction budget and
scale-dependent detail budget. RepresentationBinding then states which exact
Character anchors survive, how each scope may transform and what is forbidden.
It can reinterpret Canon but cannot mutate it. Natural Human, Anime and Manga
therefore share Character and Scene facts while using different surface,
linework, shading, depth, performance and evaluation grammar.

Family fixtures generate each candidate independently. Natural Human uses
neutral-close, warm-backlight and full-body tests; Anime uses neutral,
expression and action tests; Manga uses ink, dramatic and action-panel tests.
Cross-representation review holds the fixture constant and changes only the
representation family. Findings remain dimension-level PASS/WARN/FAIL records,
never one beauty, realism or universal style score.

### Light

```text
SceneLightState        physical source, position, direction, falloff, shadow
StyleLightGrammar      contrast, rolloff, color treatment, grain, halation
ShotLightingPlan       which approved source serves what function in this shot
```

This prevents a color grade from moving a window and prevents a SceneSpec from
owning bloom.

### Performance and time

`CharacterBinding` establishes the shot objective and observable performance.
`PerformanceTimeline` owns timed gaze, face, breath, posture and residual state.
`TemporalSpec` owns camera path, focus, edit and environmental timing while
referencing—not rewriting—the actor timeline.

### Action choreography

`ActionSequenceSpec` sits between exact Story/Character/Scene facts and shot
breakdown. It owns ordered physical beats, participant movement through bound
zones, coverage requirements and entry/change/exit continuity. It references
Character motion fingerprints and PerformanceTimelines without rewriting actor
behavior, and it references Scene zones and InteractionConstraintSets without
inventing geography or contact rules.

ShotSpec may bind an exact ActionSequenceSpec plus selected action beat IDs.
Lens, exact camera position and temporal curves remain shot-level decisions.
Action risk flags make qualified-review needs visible; the design artifact is
never a stunt plan or safety approval.

### Direction and prompts

`ShotSpec` decides purpose, blocking, attention, camera and composition.
`PromptRecord` manages reusable image language in any domain. `ImagePrompt`
compiles an exact shot when one exists. Prompt detail is limited by framing,
visibility, compatibility and control value.

## Runtime

`packages/cineweave-runtime` stores artifacts under `.cineweave/`.

- JSON is parsed strictly: duplicate keys, invalid Unicode, non-finite numbers
  and non-JSON whitespace are rejected.
- Canonical hashes are object-order independent.
- One kind/ID/version has one immutable content hash, including concurrent writes.
- Approval records bind exact artifact hashes and are independently hashed.
- ArtifactGraph discovers contract refs structurally inside payloads, supports
  dependency/dependent closures and distinguishes missing refs, same-version
  hash mismatches and valid-but-superseded refs.
- Approval gates evaluate the latest decision for one exact artifact; approval
  never transfers to a newer version. Current-version and dependency-approval
  policies are explicit opt-ins.
- Project bundles list every allowed store file with a byte hash and reject
  links, traversal, unknown or unexpected files and existing target stores.
  V2.5 continues bundle format 1.1 with exact reference blobs; import verifies a staged
  project before atomically installing its store.
- Reference ingestion allow-lists PNG, JPEG, WebP, MP4/M4V, MOV and WebM,
  compares extension with a bounded signature/container probe, limits bytes and
  image dimensions and stores generated non-executable content-addressed names.
  It does not decode content, scan malware, inspect embedded metadata or infer
  rights.
- Idempotency claims bind one key to one exact `ExecutionRequest`.
- Adapter implementations come from a trusted in-process registry and must
  match the hash declared by their `AdapterDescriptor`.
- External execution is denied unless the exact request is approved and the
  caller explicitly enables external effects.
- Every adapter attempt, retry cost and output byte hash is retained in an
  immutable `ExecutionReceipt`.
- Project verification detects tampering, orphan approval refs and version/hash
  conflicts, idempotency drift and execution-output mutation.
- Board assembly embeds independently produced tiles and emits provenance with
  per-tile hashes and explicit partial failures.

The core runtime is local and dependency-free. It ships no paid provider,
credential or network adapter. A plugin extension may register one, but cannot
bypass the exact-request approval, explicit caller enablement, budget or receipt
boundaries.

## Contracts and portable bundles

The canonical manifest owns 70 contract kinds. Each Skill declares its portable
subset in `skills/<skill>/contracts.json`. Bundle construction copies only the
needed schemas and recipes and rewrites local references, so a specialist bundle
does not depend on the repository layout.

Old 2.0, 2.2, 2.3.0, 2.3.1 and 2.4.0 contract schemas remain valid where their
data shape did not break. V2.5 adds new semantic contracts without rewriting
older artifacts; suite/runtime envelopes use `contractVersion: 2.5.0` while
domain contracts retain the earliest compatible version. ProjectBundle format
1.1 carries reference blobs and remains compatible with V2.4 bundles; the
runtime also verifies and imports legacy V2.3.1 format 1.0 bundles.

## Verification model

Release validation covers:

- official Skill and plugin structure;
- unique route and contract ownership;
- every schema/example pair;
- cross-contract semantic positive and negative cases;
- action-beat ordering, participant/zone resolution, coverage and risk links,
  continuity closure and no implied stunt-safety approval;
- activation, indirect, incomplete, negative and edge behavior definitions;
- workflow DAG and output-owner consistency;
- canonicalization, immutable writes, concurrent conflicts and approvals;
- graph closures, stale refs, exact gate decisions, cycles and missing/hash-
  mismatched dependencies;
- project-bundle round trips, V2.2 compatibility, tamper detection, duplicate
  entries, unexpected files and traversal/backslash rejection;
- reference-media extension/signature mismatch, malformed ISO-BMFF/WebM,
  bounded dimensions, deduplication, blob tamper/orphan detection, selectors,
  role authority, rights gates and exact bundle transfer;
- deterministic partial board assembly;
- trusted-adapter matching, idempotent execution, exact-request authorization,
  retry-cost accounting and output-byte verification;
- live-evaluation definitions plus a deterministic replay corpus covering every
  Skill and a should-not-activate case;
- standalone bundles, links, security and distributable media rights.

See [V2.5 identity and representation decisions](research/2026-08-22-v2.5-identity-and-representation-foundation.md),
[V2.4 reference decisions](research/2026-08-22-v2.4-reference-assets-and-bindings.md),
[V2.3.1 graph and bundle decisions](research/2026-08-21-v2.3.1-artifact-graph-and-project-bundles.md),
[V2.3 execution decisions](research/2026-08-21-v2.3-execution-and-live-evals.md)
and [roadmap](roadmap.md).
