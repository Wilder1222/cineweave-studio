<p align="center">
  <img src="assets/cineweave-studio-logo.png" alt="CineWeave Studio logo" width="160">
</p>

<h1 align="center">CineWeave Studio</h1>

<p align="center">
  Composable Codex Skills for story, character, scene, style, references, direction, image prompting and production control.
</p>

<p align="center">
  <a href="https://github.com/Wilder1222/cineweave-studio/actions/workflows/validate.yml"><img alt="Validation" src="https://img.shields.io/github/actions/workflow/status/Wilder1222/cineweave-studio/validate.yml?branch=main&style=flat-square&label=validation"></a>
  <img alt="Codex plugin" src="https://img.shields.io/badge/Codex-Plugin-1D6FFF?style=flat-square">
  <img alt="Version 2.5.1" src="https://img.shields.io/badge/version-2.5.1-14B8A6?style=flat-square">
  <img alt="License MIT" src="https://img.shields.io/badge/license-MIT-111827?style=flat-square">
</p>

<p align="center">
  <a href="#install-in-codex">Install</a> ·
  <a href="#nine-independent-skills">Skills</a> ·
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
| “I like this face direction, but I cannot describe the features.” | A provider-neutral semantic morphology spec with structural relations, locks, bounded variation and neutral three-view review. |
| “Keep this person recognizable as live action, Anime and Manga.” | Exact Character-to-Style `RepresentationBinding` artifacts and a six-family comparison fixture without mutating Canon. |
| “Turn this premise into a real scene.” | Dramatic question, causal beats, playable action, subtext and continuity facts. |
| “Use this courtyard in several shots.” | Versioned geography, material, weather, physical light and interaction constraints. |
| “I like this look but not the depicted person.” | A byte-bound reference asset, atomic style observation and explicit identity ignore rules. |
| “拆解这张人像并反推可复用提示词。” | Separate face-identity, skin-material, appearance, style and capture observations, then compile only the requested reusable contracts. |
| “Make this tea-house escape shootable.” | An `ActionSequenceSpec` with ordered beats, bound geography, physical-design checks, coverage, closed continuity and visible qualified-review risks. |
| “Make the shot feel intimate.” | Blocking, attention order, lens, depth, motivated shot lighting and a stable temporal end state. |
| “Write the actual image prompt.” | A reusable Chinese, English or bilingual PromptRecord with a visibility budget and testable constraints. |
| “Build a 3×3 sheet reliably.” | Independent tile tasks and deterministic external assembly with per-tile hashes. |

## Install in Codex

Install the immutable release tag:

```bash
codex plugin marketplace add Wilder1222/cineweave-studio --ref v2.5.1
codex plugin add cineweave-studio@cineweave-studio
```

Start a new Codex task after installation so the nine Skills are discovered.
Release tags are immutable; development on `main` is not the installation pin.

## Nine independent Skills

Every specialist works directly from a bounded brief and may also consume exact
upstream contract refs. The `$cineweave` router is optional.

| Skill | Owns | Typical outputs |
| --- | --- | --- |
| `$cineweave` | intake and acyclic workflow planning | `CreativeBrief`, `WorkflowPlan` |
| `$cineweave-story` | dramatic causality, script scenes and story continuity | `StoryBrief`, `BeatSheet`, `ScriptScene`, `ContinuityLedger` |
| `$cineweave-character` | identity exploration, semantic morphology, appearance, behavior and actor timing | exploration contracts, `CharacterMorphologySpec`, `MorphologyReview`, `CharacterSpec`, bindings and timelines |
| `$cineweave-scene` | geography, architecture, materials, physical light and interaction | `SceneSpec`, `SceneState`, `SceneLightState`, bindings and reviews |
| `$cineweave-style` | one-axis style exploration and visual/temporal representation grammar | style exploration contracts, `StylePackage`, `RepresentationBinding`, `StyleCompile`, `StyleLightGrammar` |
| `$cineweave-reference` | content-addressed media, atomic observations, suitability and exact role bindings | `ReferenceAsset`, `ReferenceObservation`, `ReferenceReview`, `ReferenceBindingSet` |
| `$cineweave-director` | action choreography, shot purpose, blocking, camera, shot light use and time | `ActionSequenceSpec`, `ShotSpec`, `ShotLightingPlan`, `TemporalSpec`, storyboard |
| `$cineweave-prompt` | general text-to-image prompt assets | `PromptRecord`, `ImagePrompt`, explicit reference transforms, hypotheses and one-variable repairs |
| `$cineweave-production` | recipes, deterministic board assembly, controls, evidence, capabilities, rights, execution intent and QA | `AssetRecipe`, `BoardAssemblyPlan`, capability/license profiles, `AdapterDescriptor`, `ExecutionRequest`, `ExecutionReceipt` |

### Start without prompt terminology

```text
Use $cineweave-character. I want an adult historical woman who feels restrained
but quietly warm. I do not know facial terminology. Give me four comparable
identity directions with the same neutral light, pose, hair and simple clothing.
Do not rank beauty or lock an identity.
```

### Semantically sculpt and verify a character

```text
Use $cineweave-character. Keep the current adult identity direction, make the
eye opening moderately longer and slightly less vertically open, preserve the
jaw and nose, and explore only nearby eye-shape variants. Express the edit as
semantic axes and structural relations—not provider weights or biometric
measurements. Then plan a neutral front, three-quarter and profile review; do
not lock identity until I approve the review.
```

### Explore style without changing Canon

```text
Use $cineweave-style. Keep the exact character, appearance, scene, action,
camera and physical light. Compare four representation directions along one
axis only: natural-human, naturalistic Anime, cinematic Manga and painterly
illustration. Return a StyleOptionSet for human preference; do not activate a
StylePackage automatically.
```

### Bind one character across representations

```text
Use $cineweave-style. Map this exact CharacterSpec into the approved Anime
StylePackage. The eyes may be simplified and the iris modestly enlarged, but
preserve their long shape, spacing, upward outer-corner direction and subtle
asymmetry. Return a RepresentationBinding; do not rewrite CharacterSpec.
```

The contract package includes complete provider-neutral examples for
[`Natural Human`](packages/cineweave-contracts/examples/style-package.json),
[`Anime`](packages/cineweave-contracts/examples/style-package-anime.json) and
[`Manga`](packages/cineweave-contracts/examples/style-package-manga.json), plus
deterministic family fixtures in the
[`recipe catalog`](packages/cineweave-contracts/recipes/catalog.json).

### Bind a reference without contamination

```text
Use $cineweave-reference. Ingest this image once, then create one observation
for palette and light only. Ignore the depicted person's identity, costume,
pose, background content and composition. Keep rights unresolved and block
production promotion until an exact LicenseProfile is approved.
```

### Decompose a portrait before compiling its prompt

```text
Use $cineweave-reference to ingest and review this portrait, then create separate
face_identity, skin_surface, skin_material, makeup, hair, capture, lighting, composition and
style/palette observations only where visible. Keep lens metadata inferred and
rights unresolved. Hand stable identity to CharacterSpec, the visible skin and
styling state to CharacterAppearanceState, representation to StyleCompile and
viewpoint to ShotSpec; bind the exact targets before Prompt compiles the image.
```

The complete dependency example is
[`workflow-plan-portrait-reference.json`](packages/cineweave-contracts/examples/workflow-plan-portrait-reference.json).

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

### Choreograph action before shots

```text
Use $cineweave-director with these exact ScriptScene, CharacterBindings,
PerformanceTimelines, SceneBinding and InteractionConstraintSets. Break the
tea-house protection and window escape into ordered action beats, physical
checks, coverage requirements and closed continuity. Flag weapons, height and
water for qualified review. Return ActionSequenceSpec before choosing lenses.
```

The complete dependency example is
[`workflow-plan-action-sequence.json`](packages/cineweave-contracts/examples/workflow-plan-action-sequence.json).

### Compile any image domain

```text
Use $cineweave-prompt to create a reusable Chinese product-photography prompt
for a celadon teapot. Describe viewpoint, silhouette, support surface, contact
shadow, reflection cards and glaze roughness. Remove empty “premium/8K” wording,
keep one primary target and make variants change one hypothesis each.
```

## How composition works

```text
natural language + optional untrusted media
                       │
                optional $cineweave
                       │
            CreativeBrief + WorkflowPlan
                       │
          ┌────────────┼─────────────┐
          ▼            ▼             ▼
       Story       Reference     Character / Scene
                       │             │
                       └──────┬──────┘
                              ▼
                            Style
                              ▼
                    Action / Shot Director
                              ▼
                            Prompt
                              ▼
                          Production
                              ▼
             immutable artifacts + reference blobs
                              ▼
           exact-request human approval when needed
                              ▼
              trusted registered adapter runtime
                              ▼
             verified output + execution receipt
```

This is a default dependency direction, not a requirement to invoke every
Skill. A product prompt can go directly to Prompt; a script rewrite can go
directly to Story; a reference suitability review can go directly to Reference;
a rights audit can go directly to Production.

Key boundaries prevent common drift:

- Reference binds exact bytes and one role per observation; downstream Skills
  decide how accepted evidence affects their own domain.
- Portrait surface semantics stay split: CharacterSpec protects stable baseline
  facts, CharacterAppearanceState records the current visible skin state, and
  StyleCompile controls realism/retouch representation at the requested scale.
- Identity, appearance and representation remain three independent spaces:
  semantic morphology defines the person, AppearanceState defines the current
  construction and condition, and RepresentationBinding translates protected
  anchors into one visual medium without mutating Canon.
- Scene places physical light sources; Style defines how light is represented;
  Director chooses how existing sources function in one shot.
- Character defines actor behavior timing; Director aligns camera timing without
  rewriting the performance.
- ActionSequenceSpec arranges exact Story, Character and Scene facts into beats,
  coverage and sequence continuity; it does not rewrite those facts or imply
  stunt-safety approval.
- Director defines the shot; Prompt compiles the shot and other exact facts into
  model-facing language.

Composition uses exact kind, ID, version and content hash. No Skill silently
resolves “latest” or relies on hidden conversation state.

## Deterministic local runtime

V2.5.1 packages the V2.5.0 dependency-free Node.js runtime for immutable local
artifacts, bounded content-addressed reference ingestion, exact dependency
graphs, hash-bound approval gates, safe project transfer, deterministic board
assembly and trusted adapter execution with byte-verifiable receipts.

```bash
npm test
node packages/cineweave-runtime/bin/cineweave.mjs init ./demo --id project.demo --name "Demo"
node packages/cineweave-runtime/bin/cineweave.mjs put ./demo ./story-brief.json --id story.demo --version 1
node packages/cineweave-runtime/bin/cineweave.mjs verify ./demo
node packages/cineweave-runtime/bin/cineweave.mjs graph ./demo
node packages/cineweave-runtime/bin/cineweave.mjs gate ./demo ./story-envelope.json --require-current
node packages/cineweave-runtime/bin/cineweave.mjs reference-ingest ./demo ./reference.png --source-class user_upload
node packages/cineweave-runtime/bin/cineweave.mjs reference-verify ./demo ./reference-asset-envelope.json
node packages/cineweave-runtime/bin/cineweave.mjs export ./demo ./demo-transfer
node packages/cineweave-runtime/bin/cineweave.mjs bundle-verify ./demo-transfer
node packages/cineweave-runtime/bin/cineweave.mjs import ./demo-transfer ./demo-copy
node packages/cineweave-runtime/bin/cineweave.mjs adapters
```

Artifacts are canonicalized with RFC-8785-compatible JSON rules and stored
under `.cineweave/`. One kind/ID/version can bind to only one content hash.
Approvals reference that exact hash.

Reference ingestion allow-lists PNG, JPEG, WebP, MP4/M4V, MOV and WebM,
requires extension/signature agreement, limits bytes and image dimensions and
stores generated non-executable blob names without retaining source paths or
original filenames. This is a bounded byte probe—not media decoding, malware
scanning, provenance authentication or a license grant. Embedded metadata is
preserved but uninspected until a separate privacy review.

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

The current source gate validates 71 contracts, 68 uniquely owned routes and 15 built-in
deterministic recipes. It also validates every schema/example pair, semantic
positive and negative cases, 37 static behavior cases, validated modern and legacy
evaluation fixtures, a 13-case deterministic live-evaluation replay set and 38 runtime
tests, plus standalone Skill bundles, reference links, rights boundaries,
media-ingestion threats and distributable assets.

```bash
npm test
npm run validate
node scripts/run-live-skill-evals.mjs --plan --model <model>
```

CI runs on Windows and Linux. See [release policy](docs/release.md),
[architecture](docs/architecture.md), [language policy](docs/language-policy.md)
and the [V2.5 identity and representation research note](docs/research/2026-08-22-v2.5-identity-and-representation-foundation.md).

## Repository map

```text
skills/                         nine independently invocable Codex Skills
packages/cineweave-contracts/   schemas, examples, ownership and recipes
packages/cineweave-runtime/     immutable store, reference blobs and deterministic tools
tests/                          runtime, behavior, activation and workflow tests
scripts/                        release, bundle, semantic and security checks
docs/                           architecture, research, roadmap and migration
```

## Scope and license

The core remains provider-neutral and human-gated. It does not include paid
model adapters, credentials or bundled user/third-party reference media. MIT
licensed; see [LICENSE](LICENSE).

Built by [Wilder1222](https://github.com/Wilder1222).
