# CineWeave Studio v2.3.1 architecture

## Design contract

Every specialist is **standalone first, composable second**. Standalone means it
can accept a direct brief and return its smallest owned artifact. Composable
means it can consume exact upstream kind/ID/version/hash refs without hidden
chat state, implicit “latest” resolution or circular artifact dependencies.

The optional `$cineweave` Skill is an intake router, not a creative super-Skill.

## Layers

```text
Intent and declared reference roles
              ↓
Optional CreativeBrief / WorkflowPlan
              ↓
Story ─ Character ─ Scene ─ Style
              ↓
Director ShotSpec / ShotLightingPlan / TemporalSpec
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
| identity, appearance and actor behavior | `cineweave-character` | medium, camera or scene geography |
| geography, materials, interaction and physical light | `cineweave-scene` | post-process look or shot source selection |
| representational visual and temporal grammar | `cineweave-style` | identity, geography or physical source placement |
| blocking, camera, shot light use and time | `cineweave-director` | persistent identity or general prompt library |
| text-to-image prompt assets | `cineweave-prompt` | story causality or shot invention when a ShotSpec is required |
| recipes, evidence, capability, rights, execution intent and QA | `cineweave-production` | creative facts, credentials, endpoints or claims that execution succeeded |

## Three separations with high leverage

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
  Import verifies a staged project before atomically installing its store.
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

The canonical manifest owns 60 contract kinds. Each Skill declares its portable
subset in `skills/<skill>/contracts.json`. Bundle construction copies only the
needed schemas and recipes and rewrites local references, so a specialist bundle
does not depend on the repository layout.

Old 2.0, 2.2 and 2.3.0 contract schemas remain valid where their data shape did
not break. Adapter, execution and evaluation-run records retain their declared
`contractVersion: 2.3.0`; V2.3.1 adds ArtifactGraph and ProjectBundleManifest
contracts while the suite, runtime and plugin version move to 2.3.1. Existing
project manifests and immutable artifacts are not rewritten.

## Verification model

Release validation covers:

- official Skill and plugin structure;
- unique route and contract ownership;
- every schema/example pair;
- cross-contract semantic positive and negative cases;
- activation, indirect, incomplete, negative and edge behavior definitions;
- workflow DAG and output-owner consistency;
- canonicalization, immutable writes, concurrent conflicts and approvals;
- graph closures, stale refs, exact gate decisions, cycles and missing/hash-
  mismatched dependencies;
- project-bundle round trips, V2.2 compatibility, tamper detection, duplicate
  entries, unexpected files and traversal/backslash rejection;
- deterministic partial board assembly;
- trusted-adapter matching, idempotent execution, exact-request authorization,
  retry-cost accounting and output-byte verification;
- live-evaluation definitions plus a deterministic replay corpus covering every
  Skill and a should-not-activate case;
- standalone bundles, links, security and distributable media rights.

See [V2.3.1 graph and bundle decisions](research/2026-08-21-v2.3.1-artifact-graph-and-project-bundles.md),
[V2.3 execution decisions](research/2026-08-21-v2.3-execution-and-live-evals.md)
and [roadmap](roadmap.md).
