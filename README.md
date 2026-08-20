# CineWeave Creative Skills v1.1

A GitHub-installable Codex Skill suite for controlled character development, styling, scene construction, character–environment interaction, cinematic direction and production verification.

CineWeave keeps creative reasoning in Codex while CineWeave Web remains the factual workspace for World context, versioned assets, Observation IDs, Candidate media, provenance, rights and human decisions. The repository contains methods, contracts, recipes, examples and local validation; it does not contain a creator's private World database or execute paid generation.

## Four Skills, one production contract

| Skill | Owns | Does not own |
|---|---|---|
| `cineweave-character` | CharacterSpec, neutral reference planning, structured makeup/hair/costume states, body identity, behavior causality, emotion, micro-expression, shot performance, character review and one-variable repair | scene geography, camera coverage, Provider execution |
| `cineweave-scene` | SceneSpec, time/weather/light/background states, geography-first references, shot SceneBinding, character–environment interaction constraints, scene review and one-variable repair | reusable character identity, narrative coverage, Provider execution |
| `cineweave-director` | narrative intent, blocking, camera language, storyboards, image prompts, ReferenceSets, RenderPlans and cross-domain orchestration | redefining reusable character or scene facts, assuming adapter capability or rights |
| `cineweave-production` | deterministic AssetRecipes, hard/soft/advisory ControlChannels, scoped EvidenceBundles, provider-neutral CapabilityProfiles, LicenseProfiles and ControlBench suites | creative Canon, character/scene facts, Provider calls or media-result claims |

The stable flow is:

```text
CharacterSpec ─> AppearanceState ─> CharacterBinding ─┐
                                                     ├─> Director ─> Storyboard / ImagePrompt
SceneSpec ─────> SceneState ──────> SceneBinding ─────┘                  │
                                      │                                 ↓
                                      └─> InteractionConstraintSet   Production
                                                                        │
                         AssetRecipe + ControlChannels + EvidenceBundle  │
                         + CapabilityProfile + LicenseProfiles ──────────┘
                                                                        ↓
                                                              human-gated RenderPlan
                                                                        ↓
                                                               Candidate Observation
                                                                        ↓
                                                               ControlBench / Review
                                                                        ↓
                                                               one-variable Repair
```

## Why v1.1 exists

A long prompt cannot reliably carry identity, styling, geography, interaction, cinematic logic, adapter limitations and rights at once. v1.1 therefore adds a production-control plane:

- a contact sheet is a task graph, not a single image prompt;
- identity, body, costume, pose, scene and light references have explicit roles and scopes;
- invariants become hard controls, intended variation becomes soft controls and style preference becomes advisory controls;
- hard capability mismatch or unresolved commercial/identity rights blocks execution;
- character–scene contact, support, occlusion, lighting and wind response become reviewable constraints;
- ControlBench evaluates character, appearance, scene, interaction, storyboard and rights separately.

## Install

```bash
codex plugin marketplace add https://github.com/Wilder1222/cineweave-director.git
codex plugin add cineweave-director@cineweave-director
```

After a repository update:

```bash
codex plugin marketplace upgrade cineweave-director
codex plugin add cineweave-director@cineweave-director
```

The plugin manifest discovers all Skills under `skills/`.

## Example requests

### Character identity and styling

```text
Use $cineweave-character to design a versioned CharacterSpec for a restrained
Chinese-fantasy inspector. Lock structural face/body anchors, natural
asymmetry, dominant side and motion fingerprint. Then create one approved
AppearanceState with structured makeup, hair, costume construction, materials,
pairing and movement response.
```

### Observable performance

```text
Use $cineweave-character to bind char.shen-yanqiu@1 to this threatened shot.
Her goal is to protect the child, fear intensity is 0.38, concealment is 0.82,
and the visible performance must specify appraisal, suppressed impulse,
posture, gaze, micro-expression, hands, breath and voice.
```

### Scene state and interaction

```text
Use $cineweave-scene to create a storm-pressure SceneState for the locked
cloud-palace corridor, preserving geography. Then create an
InteractionConstraintSet: right hand rests on pillar_01, feet are supported by
floor_stone, the pillar occludes part of the left sleeve, and side wind affects
hair and garment differently.
```

### Deterministic expression sheet

```text
Use $cineweave-production with recipe.character-expression-sheet-3x3. Generate
nine independent tasks that share exact CharacterSpec and AppearanceState
invariants, vary only expression state and intensity, retry failed tiles only,
and assemble the approved tiles into a deterministic 3x3 contact sheet.
```

### Director orchestration

```text
Use $cineweave-director to combine the supplied CharacterBinding, SceneBinding
and InteractionConstraintSet into a four-shot sequence and one keyframe
ImagePrompt. Preserve emotional, prop, interaction, screen-direction and light
continuity, then prepare a provider-neutral RenderPlan referencing the approved
recipe, controls, evidence, capability and license profiles.
```

## Built-in AssetRecipes

The recipe catalog is [`recipes/catalog.json`](recipes/catalog.json). v1.1 ships seven production presets:

| Recipe | Output | Execution strategy |
|---|---|---|
| `recipe.character-expression-sheet-3x3` | nine-expression contact sheet | nine independent tiles, deterministic 3×3 assembly |
| `recipe.character-turnaround-3view` | front/side/back turnaround | three locked full-body tasks, deterministic row assembly |
| `recipe.character-action-sheet-2x3` | six-pose action sheet | six pose tasks sharing identity/appearance |
| `recipe.character-appearance-sheet-2x2` | four approved looks | one controlled AppearanceState per task |
| `recipe.scene-establishing-frame` | reusable scene establishing frame | one geography-first task |
| `recipe.scene-state-sheet-2x2` | four scene states | shared SceneSpec, state-only deltas |
| `recipe.storyboard-sequence-4up` | four-shot storyboard board | shot-specific tasks, deterministic assembly |

Labels, borders and metadata belong to deterministic assembly, not image generation. A failed tile may be regenerated without replacing passing tiles.

## Contract families

The ownership index is [`contracts/manifest.json`](contracts/manifest.json). The suite currently owns 24 versioned exchange contracts across four Skills.

### Character

- [`character-spec.schema.json`](schemas/character-spec.schema.json)
- [`character-reference-plan.schema.json`](schemas/character-reference-plan.schema.json)
- [`character-appearance-state.schema.json`](schemas/character-appearance-state.schema.json)
- [`character-binding.schema.json`](schemas/character-binding.schema.json)
- [`character-review.schema.json`](schemas/character-review.schema.json)
- [`character-repair.schema.json`](schemas/character-repair.schema.json)

### Scene

- [`scene-spec.schema.json`](schemas/scene-spec.schema.json)
- [`scene-reference-plan.schema.json`](schemas/scene-reference-plan.schema.json)
- [`scene-state.schema.json`](schemas/scene-state.schema.json)
- [`scene-binding.schema.json`](schemas/scene-binding.schema.json)
- [`interaction-constraint-set.schema.json`](schemas/interaction-constraint-set.schema.json)
- [`scene-review.schema.json`](schemas/scene-review.schema.json)
- [`scene-repair.schema.json`](schemas/scene-repair.schema.json)

### Director

- character/scene/interaction-aware [`image-prompt-output.schema.json`](schemas/image-prompt-output.schema.json)
- continuity-aware [`storyboard-output.schema.json`](schemas/storyboard-output.schema.json)
- expanded [`reference-set.schema.json`](schemas/reference-set.schema.json)
- production-aware [`render-plan.schema.json`](schemas/render-plan.schema.json)
- the existing proposal, PromptRecord, hypothesis, DraftBrief and verified media contracts retained by Director.

### Production control

- [`asset-recipe.schema.json`](schemas/asset-recipe.schema.json)
- [`control-channel-set.schema.json`](schemas/control-channel-set.schema.json)
- [`evidence-bundle.schema.json`](schemas/evidence-bundle.schema.json)
- [`capability-profile.schema.json`](schemas/capability-profile.schema.json)
- [`license-profile.schema.json`](schemas/license-profile.schema.json)
- [`control-benchmark.schema.json`](schemas/control-benchmark.schema.json)

New v1.1 payloads emit `contractVersion: "1.1.0"`. The expanded v1 contracts accept `1.0.0` where applicable; new production and interaction fields remain optional for older records. Locked assets are never overwritten.

## Local validation

Run the complete dependency-free release gate:

```bash
node scripts/run-release-checks.mjs
```

Validate a single schema/example pair:

```bash
node scripts/validate-output.mjs \
  schemas/asset-recipe.schema.json \
  examples/asset-recipe.json
```

Run semantic and negative tests:

```bash
node scripts/validate-v1-semantics.mjs --self-test
node scripts/validate-control-bench.mjs --self-test
```

The release gate checks JSON and Node syntax, schema/example pairs, route ownership, recipe catalog integrity, semantic invariants, negative cases, backward compatibility, non-destructive migration, secrets, signed URLs, private paths and unfinished placeholders.

## Migration from v1.0

```bash
node scripts/migrate-v1-to-v1.1.mjs input.json \
  --out migrated-copy.json \
  --report migration-report.json \
  --schema schemas/character-appearance-state.schema.json
```

The migration writes a copy, never overwrites the source and never invents structured styling, production refs, interaction constraints, evidence or rights. See [`MIGRATION.md`](MIGRATION.md).

## Boundaries

- Core schemas and RenderPlans remain Provider-neutral.
- CapabilityProfiles describe support levels, not endpoints, secrets or account parameters.
- Unknown commercial rights, weight licenses or identity consent remain unresolved and may block execution.
- A Skill receipt proves reasoning provenance; it is not a Provider receipt or permission to publish.
- A recipe, prompt, reference plan or RenderPlan is not evidence that media was generated.
- Candidate media stays immutable; review cites Observation evidence and repair changes one variable.
- User-specific CharacterSpecs, SceneSpecs and private media stay in CineWeave Web or approved storage, not this public repository.
