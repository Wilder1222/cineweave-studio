# CineWeave exchange contract v1.1

This file defines the boundary between independently installed CineWeave Codex Skills, CineWeave Web, production-control records and later execution adapters.

## Responsibility split

### CineWeave Web

Web is the factual workspace. It may:

- store supplied World facts and Canon;
- store versioned CharacterSpec, AppearanceState, SceneSpec and SceneState records;
- store InteractionConstraintSet, AssetRecipe instances, controls, evidence, capability and license records;
- store Observation metadata and resolve approved media access;
- import structured Skill payloads after schema, scope and rights validation;
- record Skill receipts, content hashes and human decisions;
- compare Candidate media and create new versions or locks after explicit user action.

Web must not:

- invent creative facts omitted by a Skill payload;
- choose character identity, scene geography, interaction, camera or performance through silent deterministic defaults;
- treat a prompt, recipe, reference plan or RenderPlan as proof of generation;
- mark a repair successful without new verified Candidate evidence;
- assume commercial permission, model-weight rights or likeness consent.

### Codex Skills

- `cineweave-character` owns reusable character identity, structured styling, shot performance and evidence-based character review/repair.
- `cineweave-scene` owns reusable geography, architecture, environment state, character–environment interaction and scene review/repair.
- `cineweave-director` owns narrative intent, blocking, camera, storyboard, prompt assembly, ReferenceSet and provider-neutral RenderPlan composition.
- `cineweave-production` owns deterministic AssetRecipes, prioritized controls, scoped evidence, adapter capability descriptions, license/identity-rights gates and ControlBench suites.

Skills do not install or update themselves, call paid Providers, expose credentials, mutate Canon, overwrite locked assets or claim media results without evidence.

### Execution adapters

Adapters translate an approved RenderPlan into a host-native tool or explicitly approved external execution. They may consume an adapter-specific implementation configuration, but they must not invent CharacterSpec, SceneSpec, bindings, Canon, rights or director decisions. Provider receipts remain separate from Skill receipts.

## Receipt contract

Payloads that require a Skill receipt use:

```json
{
  "repository": "https://github.com/owner/repository",
  "ref": "v1.1.0",
  "commit": "40-character-git-sha",
  "contentHash": "sha256:<sha256-of-loaded-skill-content>",
  "installedBy": "codex-environment",
  "environmentId": "optional-device-id",
  "usedAt": "2026-08-20T12:00:00.000Z"
}
```

A Skill receipt proves provenance of the reasoning contract. It is not an execution receipt, publication license, identity consent record, asset lock or Canon mutation. Example values are fixtures only.

## Exact asset references

Dependent character artifacts bind:

```json
{
  "characterId": "char.example",
  "version": 1,
  "contentHash": "sha256:<exact-character-spec-hash>"
}
```

Dependent scene artifacts use analogous `sceneId`, `version` and `contentHash`. AppearanceState, SceneState, interaction, controls, evidence, capability and license records use exact stable IDs and versions where defined. Never use “latest” in an execution or import contract.

## Character contracts

### CharacterSpec

`character-spec.schema.json` records narrative core, immutable face/body/silhouette anchors, controlled appearance variables, motion fingerprint, emotional leakage, behavior states, reference policy, rights, validation and provenance.

A CharacterSpec is not a portrait, biometric template, generated-media receipt or identity test result.

### CharacterReferencePlan

`character-reference-plan.schema.json` orders identity, body, expression, motion and appearance reference tasks. Every task has one semantic role and scope, preserve contract, controlled changes, negatives and approval status. It may reference an approved AssetRecipe but never claims generation.

### CharacterAppearanceState

`character-appearance-state.schema.json` assigns only variables declared by an exact CharacterSpec. v1.1 may structure:

- base, brow, eye, cheek, lip and finish makeup;
- hair length, structure, parting, fringe, texture, volume, finish and accessories;
- costume style, silhouette, construction, components, layering, fit and pairing;
- palette, material response, condition and movement response.

A state cannot redefine structural face/body identity. A locked state is never overwritten.

### CharacterBinding

`character-binding.schema.json` is one-shot performance. It selects visible anchors and may record:

- objective, obstacle, stakes and relationship target;
- perception, appraisal, strategy and suppressed impulse;
- emotion start/peak/end, intensity and concealment;
- brow, eyelid, gaze, mouth, jaw and tear-state micro-expression;
- posture, hands, breath, voice and environment response;
- start, trigger, peak and end of the action arc.

Personality labels must be compiled into observable behavior rather than sent as unsupported abstract control.

### CharacterReview and CharacterRepair

CharacterReview compares expected character, body, appearance, expression, action and continuity against supplied Candidate Observation evidence. A blocking failure prevents acceptance. CharacterRepair changes one variable, preserves passing criteria, requires approval and never claims success.

## Scene contracts

### SceneSpec

`scene-spec.schema.json` records orientation, immutable geography, zones, connections, entrances/exits, scale anchors, architecture, support logic, materials, aging, props, camera axes, camera anchors, controllable variables, rights and provenance. It is not a background prompt or generated location.

### SceneReferencePlan

`scene-reference-plan.schema.json` plans geography, architecture, scale, material, lighting, state and interaction references in an order that prevents mood images from replacing spatial facts. It may reference AssetRecipes but never claims generation.

### SceneState

`scene-state.schema.json` assigns declared variables without moving locked geography. v1.1 may structure:

- absolute or narrative time context;
- weather, season, occupancy, damage and dynamic elements;
- foreground, midground, background and horizon state;
- source direction, hardness, falloff, subject/background exposure, rim, bounce and contact-shadow expectations.

### SceneBinding

`scene-binding.schema.json` locates one shot in exact scene/state refs, zone, path, camera anchor, scale, light and atmosphere. It may embed or reference an InteractionConstraintSet.

### InteractionConstraintSet

`interaction-constraint-set.schema.json` records observable character–environment relationships:

- body-part contact target and relation;
- support surface and body-weight distribution;
- acyclic occlusion order;
- prop relation, ownership, hand and grip continuity;
- motivated key source, cast shadow and contact shadow;
- wind, precipitation, moisture, hair, garment and surface response;
- evidence requirements and acceptance checks.

These constraints express what must be checked. They do not guarantee that a model can satisfy the interaction in one pass.

### SceneReview and SceneRepair

SceneReview checks geography, architecture, scale, state, light, interaction and continuity. SceneRepair changes one variable only and preserves passing facts.

## Director contracts

### ImagePrompt

`image-prompt-output.schema.json` remains a provider-neutral design package. It may consume exact CharacterBinding, SceneBinding, InteractionConstraintSet and production refs. v1.1 prompt blocks can separate:

```text
characterIdentity
characterBody
characterPerformance
wardrobe
sceneGeography
sceneArchitecture
sceneMaterials
sceneLighting
sceneAtmosphere
sceneInteraction
spatialContinuity
camera/style/technical
```

The prompt must not introduce new World facts or silently resolve missing rights/capability data.

### Storyboard

`storyboard-output.schema.json` owns sequence logic. Every shot keeps camera, action, performance, light, sound/edit and frame prompt, while continuity may separately preserve screen direction, eyeline, axis, character state, scene state, emotion, props and interaction. Shot production context references exact recipes, controls, evidence, capability and rights when available.

### ReferenceSet

`reference-set.schema.json` maps Observation IDs to semantic roles and scopes. v1.1 may link EvidenceBundle and LicenseProfile refs. It never carries private paths, signed URLs or secrets.

### RenderPlan

`render-plan.schema.json` prepares a later human-approved execution and may reference:

- AssetRecipe and recipe task IDs;
- ControlChannelSet;
- EvidenceBundle;
- CapabilityProfile and capability match;
- LicenseProfiles;
- exact Character/Scene/Interaction and Prompt refs;
- canvas, budget, variant count, preflight and postflight checks.

A hard capability mismatch, missing required evidence role or unresolved rights issue blocks readiness. The RenderPlan contains no endpoint, token, hidden vendor flag or claim of generation.

## Production-control contracts

### AssetRecipe

`asset-recipe.schema.json` defines a repeatable artifact recipe:

- one output type and owner Skill;
- required exact inputs;
- shared invariants;
- independent task list with one controlled delta per task;
- acceptance criteria and retry policy;
- deterministic assembly plan;
- human approval gates.

For a contact sheet, turnaround, action sheet, appearance board or storyboard board, tasks are generated separately. The model does not draw the entire grid, labels or borders in one pass. Passing tasks remain immutable and failed tasks may be retried independently.

### ControlChannelSet

`control-channel-set.schema.json` assigns controls as:

- `hard`: must be satisfied; fallback action is `block`;
- `soft`: preferred but may allow bounded, declared compromise;
- `advisory`: style or aesthetic guidance below facts and bindings.

Each channel has scope, source, priority, enforcement, acceptance check and fallback. Style never outranks identity, appearance, geography, behavior or interaction.

### EvidenceBundle

`evidence-bundle.schema.json` binds Observation IDs to one explicit role and scope, with quality, rights profile and purpose. Face, body, costume, pose, depth, mask, material, light and scene evidence remain distinct. A single image cannot silently serve incompatible roles.

### CapabilityProfile

`capability-profile.schema.json` describes provider-neutral support levels, limits and evidence requirements. It may identify an adapter class, but includes no endpoint, credential or account parameter. `partial` and `experimental` support require review and cannot satisfy a hard requirement as strong support.

### LicenseProfile

`license-profile.schema.json` records code, weights, base model, dependencies, assets, identity consent, commercial use, redistribution, publication and data handling separately. Unknown rights remain unknown. Public visibility or open-source code does not automatically grant model-weight, asset or likeness rights.

### ControlBenchmark

`control-benchmark.schema.json` defines repeatable test cases across character, appearance, scene, interaction, storyboard, capability and rights. Machine checks may assist review, but Candidate evidence and human decisions remain explicit.

## Capability and rights gate

Before an adapter executes a planned task:

1. resolve every hard control;
2. resolve required evidence roles;
3. match hard requirements against CapabilityProfile;
4. resolve every code/weight/dependency/asset/identity LicenseProfile relevant to the intended use;
5. block when commercial publication, identity consent or required data handling remains unresolved;
6. require explicit human approval.

No default converts unknown rights into allowed rights.

## Candidate and review contract

Generated or edited media becomes evidence only after real bytes, dimensions and content hash are verified. Candidate media is immutable. Review cites Observation IDs and expected-versus-observed checks. A new attempt produces a new Candidate/Observation and does not rewrite the failed one.

## Migration contract

Migration is non-destructive. The v1.0-to-v1.1 utility may add the target contract version and preserve supplied data, but it does not invent structured styling, interaction, recipes, controls, evidence, capability or rights. Migration reports include source/output hashes, warnings, blocking issues and schema-check status.

## Prohibited exchange data and claims

- API keys, access tokens, cookies, private keys or credentials;
- private absolute paths or signed URLs;
- unapproved private media copied into a public Skill repository;
- invented Observation IDs, content hashes, rights or Provider receipts;
- claims that a recipe, prompt or RenderPlan generated media;
- claims that a repair succeeded without new Candidate evidence;
- silent replacement of locked character identity, scene geography or approved state;
- adapter-specific endpoint and account configuration in provider-neutral core contracts.
