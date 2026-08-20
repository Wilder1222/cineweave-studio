---
name: cineweave-production
description: Compile CineWeave creative facts into deterministic production recipes, explicit hard/soft/advisory control channels, scoped evidence bundles, provider-neutral capability profiles, license and identity-rights gates, and ControlBench evaluation suites. Own AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile, LicenseProfile and ControlBenchmark contracts.
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

It does not redefine a CharacterSpec, SceneSpec, CharacterBinding, SceneBinding or director shot. It never calls a Provider or claims that a recipe generated media.

## Routes

Choose the smallest route that satisfies the request.

- `asset_recipe`: create, instantiate, review or version a production recipe. Use `references/asset-recipes.md`. Return `../../schemas/asset-recipe.schema.json`.
- `control_plan`: translate invariants and allowed changes into prioritized hard/soft/advisory controls. Use `references/control-channels.md`. Return `../../schemas/control-channel-set.schema.json`.
- `evidence_bundle`: bind face, body, costume, pose, depth, mask, lighting, material and scene observations to explicit semantic roles. Use `references/evidence-and-rights.md`. Return `../../schemas/evidence-bundle.schema.json`.
- `capability_profile`: describe an adapter class without endpoint, credential or hidden vendor parameters, then match required controls and evidence. Use `references/capability-matching.md`. Return `../../schemas/capability-profile.schema.json`.
- `license_profile`: record code, weights, dependencies, assets, identity consent, publication and data-handling status. Use `references/evidence-and-rights.md`. Return `../../schemas/license-profile.schema.json`.
- `control_benchmark`: design or update a repeatable ControlBench suite. Use `references/control-bench.md`. Return `../../schemas/control-benchmark.schema.json`.

## Operating sequence

1. Resolve exact Character, Appearance, Scene, State, Binding and Shot versions.
2. Choose or instantiate the smallest matching AssetRecipe.
3. Convert preserve rules into hard controls, intended variation into soft controls and style preference into advisory controls.
4. Assemble an EvidenceBundle. Do not allow one reference to silently serve incompatible roles.
5. Resolve every evidence item and adapter dependency to a LicenseProfile.
6. Match hard adapter requirements against a CapabilityProfile.
7. Block when a hard capability, required evidence role or rights profile is unresolved.
8. Produce a provider-neutral RenderPlan reference package for Director; keep execution human-gated.
9. Evaluate results with ControlBench and repair only failed tasks or one smallest variable.

## Required behavior

- A hard control must use `fallback.action = block`.
- A style reference has lower priority than identity, appearance, geography, behavior and interaction constraints.
- A contact sheet must generate independent tasks and use deterministic assembly; do not request a model to draw the entire grid in one pass.
- Successful recipe tasks remain immutable when retrying failed tasks.
- Capability `partial` or `experimental` support requires explicit review; it is not equivalent to strong support.
- Unknown commercial or identity rights never become allowed by assumption.
- CapabilityProfile may name an adapter identifier but must not include endpoints, secrets or account-specific parameters.

## Output contracts

Return only the matching schema object. A combined production request may return named `assetRecipe`, `controlChannelSet`, `evidenceBundle`, `capabilityProfile`, `licenseProfiles` and `controlBenchmark` payloads. Keep receipts on every top-level contract.
