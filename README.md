<p align="center">
  <img src="assets/cineweave-studio-logo.png" alt="CineWeave Studio logo" width="160">
</p>

<h1 align="center">CineWeave Studio</h1>

<p align="center">
  Composable Codex Skills for story, character, scene, style, direction, image prompting and production control.
</p>

<p align="center">
  <a href="https://github.com/Wilder1222/cineweave-studio/actions/workflows/validate.yml"><img alt="Validation" src="https://img.shields.io/github/actions/workflow/status/Wilder1222/cineweave-studio/validate.yml?branch=main&style=flat-square&label=validation"></a>
  <img alt="Codex plugin" src="https://img.shields.io/badge/Codex-Plugin-1D6FFF?style=flat-square">
  <img alt="Version 2.3.1" src="https://img.shields.io/badge/version-2.3.1-14B8A6?style=flat-square">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-111827?style=flat-square">
</p>

<p align="center">
  <a href="#install-in-codex">Install</a> ·
  <a href="#eight-independent-skills">Skills</a> ·
  <a href="#how-composition-works">Architecture</a> ·
  <a href="#deterministic-local-runtime">Runtime</a> ·
  <a href="docs/roadmap.md">Roadmap</a>
</p>

---

## What it does

CineWeave turns an imprecise creative wish into small, editable artifacts. It
does not treat one giant prompt as story, character bible, set design, camera
plan and production record at the same time.

The key idea is simple:

> First state how the image is observed—subject, action, spatial relation,
> viewpoint, light and material response—then compile only the detail that can
> influence the requested frame.

That rule works for portraits, products, food, architecture, illustration and
cinematic frames. The prompt system is not limited to “cinematic content,” and
the director system no longer owns general prompt management.

| Start with | CineWeave returns |
| --- | --- |
| “I only know how the character should feel.” | Comparable identity directions under one neutral fixture—no automatic beauty score or identity lock. |
| “Turn this premise into a real scene.” | Dramatic question, causal beats, playable action, subtext and continuity facts. |
| “Use this courtyard in several shots.” | Versioned geography, material, weather, physical light and interaction constraints. |
| “I like this look but not the depicted person.” | Role-scoped style evidence with explicit preserve and ignore rules. |
| “Make the shot feel intimate.” | Blocking, attention order, lens, depth, motivated shot lighting and a stable temporal end state. |
| “Write the actual image prompt.” | A reusable Chinese, English or bilingual PromptRecord with a visibility budget and testable constraints. |
| “Build a 3×3 sheet reliably.” | Independent tile tasks and deterministic external assembly with per-tile hashes. |

## Install in Codex

Install the immutable release tag:

```bash
codex plugin marketplace add Wilder1222/cineweave-studio --ref v2.3.1
codex plugin add cineweave-studio@cineweave-studio
```

Start a new Codex task after installation so the eight Skills are discovered.
Release tags are immutable; development on `main` is not the installation pin.

## Eight independent Skills

Every specialist works directly from a bounded brief and may also consume exact
upstream contract refs. The `$cineweave` router is optional.

| Skill | Owns | Typical outputs |
| --- | --- | --- |
| `$cineweave` | intake and acyclic workflow planning | `CreativeBrief`, `WorkflowPlan` |
| `$cineweave-story` | dramatic causality, script scenes and story continuity | `StoryBrief`, `BeatSheet`, `ScriptScene`, `ContinuityLedger` |
| `$cineweave-character` | identity, appearance, behavior and actor timing | exploration contracts, `CharacterSpec`, `CharacterBinding`, `PerformanceTimeline` |
| `$cineweave-scene` | geography, architecture, materials, physical light and interaction | `SceneSpec`, `SceneState`, `SceneLightState`, bindings and reviews |
| `$cineweave-style` | medium and representational visual/temporal grammar | `StylePackage`, `StyleCompile`, `StyleLightGrammar` |
| `$cineweave-director` | shot purpose, blocking, camera, shot light use and time | `ShotSpec`, `ShotLightingPlan`, `TemporalSpec`, storyboard |
| `$cineweave-prompt` | general text-to-image prompt assets | `PromptRecord`, `ImagePrompt`, hypotheses and one-variable repairs |
| `$cineweave-production` | recipes, controls, evidence, capabilities, rights, execution intent and QA | `AssetRecipe`, capability/license profiles, `AdapterDescriptor`, `ExecutionRequest`, `ExecutionReceipt` |

### Start without prompt terminology

```text
Use $cineweave-character. I want an adult historical woman who feels restrained
but quietly warm. I do not know facial terminology. Give me four comparable
identity directions with the same neutral light, pose, hair and simple clothing.
Do not rank beauty or lock an identity.
```

### Develop story before shots

```text
Use $cineweave-story. A physician meets the person she once pushed away in a
rain-washed courtyard. Build one dramatic question and a causal short-film beat
sheet. Every beat needs an objective, conflict, choice, changed state and reason
for the next beat. Do not add camera directions.
```

### Direct the observed moment

```text
Use $cineweave-director. Stage the recognition beat at the courtyard threshold.
Define what the audience notices first, blocking and weight, relationship axis,
50mm perspective, focus, physical light use, the motivated camera curve and a
stable end state. Return a ShotSpec, not an image prompt.
```

### Compile any image domain

```text
Use $cineweave-prompt to create a reusable Chinese product-photography prompt
for a celadon teapot. Describe viewpoint, silhouette, support surface, contact
shadow, reflection cards and glaze roughness. Remove empty “premium/8K” wording,
keep one primary target and make variants change one hypothesis each.
```

## How composition works

```text
natural language + declared reference roles
                     │
              optional $cineweave
                     │
          CreativeBrief + WorkflowPlan
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
      Story      Character      Scene
        └────────────┼────────────┘
                     ▼
                   Style
                     ▼
                  Director
                     ▼
                   Prompt
                     ▼
                 Production
                     ▼
          immutable local artifact store
                     ▼
        exact-request human approval
          (external execution only)
                     ▼
        trusted registered adapter runtime
                     ▼
       verified output + execution receipt
```

This is a default dependency direction, not a requirement to invoke every
Skill. A product prompt can go directly to Prompt; a script rewrite can go
directly to Story; a rights audit can go directly to Production.

Three boundaries prevent common drift:

- Scene places physical light sources; Style defines how light is represented;
  Director chooses how existing sources function in one shot.
- Character defines actor behavior timing; Director aligns camera timing without
  rewriting the performance.
- Director defines the shot; Prompt compiles the shot and other exact facts into
  model-facing language.

Composition uses exact kind, ID, version and content hash. No Skill silently
resolves “latest” or relies on hidden conversation state.

## Deterministic local runtime

V2.3.1 includes a dependency-free Node.js runtime for immutable local
artifacts, exact dependency graphs, hash-bound approval gates, safe project
transfer, deterministic board assembly and trusted adapter execution with
byte-verifiable receipts.

```bash
npm test
node packages/cineweave-runtime/bin/cineweave.mjs init ./demo --id project.demo --name "Demo"
node packages/cineweave-runtime/bin/cineweave.mjs put ./demo ./story-brief.json --id story.demo --version 1
node packages/cineweave-runtime/bin/cineweave.mjs verify ./demo
node packages/cineweave-runtime/bin/cineweave.mjs graph ./demo
node packages/cineweave-runtime/bin/cineweave.mjs gate ./demo ./story-envelope.json --require-current
node packages/cineweave-runtime/bin/cineweave.mjs export ./demo ./demo-transfer
node packages/cineweave-runtime/bin/cineweave.mjs bundle-verify ./demo-transfer
node packages/cineweave-runtime/bin/cineweave.mjs import ./demo-transfer ./demo-copy
node packages/cineweave-runtime/bin/cineweave.mjs adapters
```

Artifacts are canonicalized with RFC-8785-compatible JSON rules and stored
under `.cineweave/`. One kind/ID/version can bind to only one content hash.
Approvals reference that exact hash.

`graph` reports resolved, missing and same-version hash-mismatched refs. An old
exact ref remains valid but is labeled superseded when a newer version exists.
`gate` never transfers approval from one version to another; optional policies
can also require current dependencies and dependency approvals. Export creates
a directory bundle with a manifest and byte hash for every file. Import rejects
links, unsupported paths, unexpected files, digest changes and existing target
stores before atomically installing the verified `.cineweave` directory. A
bundle is local transfer evidence—not permission to redistribute its content.

The core ships one zero-cost, network-free SVG fixture adapter for deterministic
tests. Contracts cannot provide commands, module paths, endpoints or credential
values. External adapters must be registered as trusted code, match their
declared implementation hash, receive approval for the exact stored request and
be explicitly enabled by the caller. Every attempt and its cost is retained in
an immutable `ExecutionReceipt`.

Multi-panel outputs are assembled after independent tile generation:

```bash
node packages/cineweave-runtime/bin/assemble-board.mjs --manifest board.json --out board.svg --allow-partial
```

The assembler records every tile hash and failed tile ID. It never asks an
image model to invent the grid, labels and all panels in a single pass.

## Verification

The V2.3.1 gate validates 60 contracts and 57 uniquely owned routes, all
schema/example pairs, semantic positive and negative cases, 24 static behavior
cases, a 10-case live-evaluation replay set, 29 deterministic runtime tests,
standalone bundles, reference links, rights boundaries and distributable assets.

```bash
npm test
npm run validate
npm run evals:live -- --plan --model <model>
```

CI runs on Windows and Linux. See [release policy](docs/release.md),
[architecture](docs/architecture.md), [language policy](docs/language-policy.md)
and [V2.2 → V2.3 migration](docs/migration/v2.2-to-v2.3.md).

## Repository map

```text
skills/                         eight independently invocable Codex Skills
packages/cineweave-contracts/   schemas, examples, ownership and recipes
packages/cineweave-runtime/     immutable store and deterministic board tools
tests/                          runtime, behavior, activation and workflow tests
scripts/                        release, bundle, semantic and security checks
docs/                           architecture, research, roadmap and migration
```

## Scope and license

The core remains provider-neutral and human-gated. It does not include paid
model adapters, credentials or bundled user/third-party reference media. MIT
licensed; see [LICENSE](LICENSE).

Built by [Wilder1222](https://github.com/Wilder1222).
