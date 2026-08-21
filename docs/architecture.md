# CineWeave Studio v2.2 architecture

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
Immutable local artifact + exact-hash human approval
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
| recipes, evidence, capability, rights and QA | `cineweave-production` | creative facts or provider claims |

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
- Project verification detects tampering, orphan approval refs and version/hash
  conflicts.
- Board assembly embeds independently produced tiles and emits provenance with
  per-tile hashes and explicit partial failures.

The runtime is local and dependency-free. It does not execute paid providers or
replace the human approval boundary.

## Contracts and portable bundles

The canonical manifest owns 54 contract kinds. Each Skill declares its portable
subset in `skills/<skill>/contracts.json`. Bundle construction copies only the
needed schemas and recipes and rewrites local references, so a specialist bundle
does not depend on the repository layout.

Old 2.0 contract schemas remain valid where their data shape did not break.
New 2.2 contracts use `contractVersion: 2.2.0`; the suite and plugin version are
2.2.0. This is additive contract evolution, not a silent rewrite of old artifacts.

## Verification model

Release validation covers:

- official Skill and plugin structure;
- unique route and contract ownership;
- every schema/example pair;
- cross-contract semantic positive and negative cases;
- activation, indirect, incomplete, negative and edge behavior definitions;
- workflow DAG and output-owner consistency;
- canonicalization, immutable writes, concurrent conflicts and approvals;
- deterministic partial board assembly;
- standalone bundles, links, security and distributable media rights.

See [research decisions](research/2026-08-21-v2.2-runtime-and-skill-boundaries.md)
and [roadmap](roadmap.md).
