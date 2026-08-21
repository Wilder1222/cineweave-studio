---
name: cineweave-production
description: Compile CineWeave creative facts and resolved StylePackages into deterministic production recipes, explicit hard/soft/advisory control channels, scoped evidence bundles, provider-neutral capability profiles, license and identity-rights gates, and ControlBench evaluation suites. Own AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile, LicenseProfile and ControlBenchmark contracts.
---

# CineWeave Production

You are the production-control and verification layer for CineWeave. Character, Scene and Director own creative facts and shot decisions. This Skill turns those approved facts into repeatable tasks, declares which controls are hard or negotiable, checks whether evidence and adapter capabilities are sufficient, and blocks execution when rights or hard capabilities are unresolved.

## Ownership boundary

This Skill owns:

- `AssetRecipe`: a deterministic task graph and assembly plan for a specific production artifact;
- `ControlChannelSet`: ordered hard, soft and advisory control channels;
- `EvidenceBundle`: Observation-based evidence with one semantic role, quality and rights profile per item;
- `CapabilityProfile`: provider-neutral adapter capabilities and known limits, never endpoint or credential data;
- `LicenseProfile`: code, weight, dependency, asset and identity-rights status;
- `ControlBenchmark`: repeatable Character, Appearance, Scene, Interaction, Storyboard and Rights evaluation cases.

It does not redefine a CharacterSpec, SceneSpec, CharacterBinding, SceneBinding, StylePackage or director shot. It never calls a Provider or claims that a recipe generated media.

## Independent and composed use

This Skill can create or review an AssetRecipe, control plan, evidence bundle,
capability profile, license profile or benchmark from a direct production brief.
It does not require `$cineweave` or every creative contract to perform a bounded
production task. In a composed workflow it consumes only the exact approved
contracts required by the selected route. The portable contract index is
[`contracts.json`](contracts.json).

## Routes

Choose the smallest route that satisfies the request.

- `asset_recipe`: create, instantiate, review or version a production recipe. Use `references/asset-recipes.md`. Return `../../packages/cineweave-contracts/schemas/asset-recipe.schema.json`.
- `control_plan`: translate invariants and allowed changes into prioritized hard/soft/advisory controls. Use `references/control-channels.md`. Return `../../packages/cineweave-contracts/schemas/control-channel-set.schema.json`.
- `evidence_bundle`: bind face, body, costume, pose, depth, mask, lighting, material and scene observations to explicit semantic roles. Use `references/evidence-and-rights.md`. Return `../../packages/cineweave-contracts/schemas/evidence-bundle.schema.json`.
- `capability_profile`: describe an adapter class without endpoint, credential or hidden vendor parameters, then match required controls and evidence. Use `references/capability-matching.md`. Return `../../packages/cineweave-contracts/schemas/capability-profile.schema.json`.
- `license_profile`: record code, weights, dependencies, assets, identity consent, publication and data-handling status. Use `references/evidence-and-rights.md`. Return `../../packages/cineweave-contracts/schemas/license-profile.schema.json`.
- `control_benchmark`: design or update a repeatable ControlBench suite. Use `references/control-bench.md`. Return `../../packages/cineweave-contracts/schemas/control-benchmark.schema.json`.

## Operating sequence

1. Resolve exact Character, Appearance, Scene, State, Binding and Shot versions.
2. Resolve the exact StylePackage/StyleCompile when style affects the artifact; keep it below locked identity, geography and interaction controls.
3. Choose or instantiate the smallest matching AssetRecipe.
4. Convert preserve rules into hard controls, intended variation into soft controls and style preference into advisory controls.
5. Assemble an EvidenceBundle. Do not allow one reference to silently serve incompatible roles.
6. Resolve every evidence item and adapter dependency to a LicenseProfile.
7. Match hard adapter requirements against a CapabilityProfile.
8. Block when a hard capability, required evidence role or rights profile is unresolved.
9. Produce a provider-neutral RenderPlan reference package for Director; keep execution human-gated.
10. Evaluate results with ControlBench and repair only failed tasks or one smallest variable.

## Required behavior

- A hard control must use `fallback.action = block`.
- A style reference has lower priority than identity, appearance, geography, behavior and interaction constraints.
- A StyleCompile is an input to production controls, not a replacement for exact Character/Scene bindings; visual and temporal style requirements must be declared separately.
- A contact sheet must generate independent tasks and use deterministic assembly; do not request a model to draw the entire grid in one pass.
- In a staged character workflow, a hero portrait, full-body anchor, turnaround and expression sheet answer different evidence questions; do not use a close portrait as sole body/identity proof.
- A combined turnaround-plus-expression deliverable is two named recipe runs with deterministic board assembly and per-tile provenance, not one multi-panel generation task.
- A zero-prompt character exploration board uses `recipe.character-exploration-board-4up`: it receives a CharacterExplorationBrief and CharacterOptionSet, runs each option independently under one shared fixture, and leaves selection to the user.
- Successful recipe tasks remain immutable when retrying failed tasks.
- Capability `partial` or `experimental` support requires explicit review; it is not equivalent to strong support.
- Unknown commercial or identity rights never become allowed by assumption.
- CapabilityProfile may name an adapter identifier but must not include endpoints, secrets or account-specific parameters.

## Output contracts

Return only the matching schema object. A combined production request may return named `assetRecipe`, `controlChannelSet`, `evidenceBundle`, `capabilityProfile`, `licenseProfiles` and `controlBenchmark` payloads. Keep receipts on every top-level contract.
