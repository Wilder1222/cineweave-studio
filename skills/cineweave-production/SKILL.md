---
name: cineweave-production
description: Compile CineWeave creative facts into deterministic production recipes, controls, evidence, capability and rights gates, provider-neutral adapter descriptors, exact execution requests and auditable execution receipts. Use for production planning, adapter matching, execution authorization, receipt review and ControlBench evaluation.
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
- `AdapterDescriptor`: an exact, versioned runtime adapter identity and operation surface without endpoint or secret values;
- `ExecutionRequest`: a budgeted, idempotent request bound to exact approved production artifacts;
- `ExecutionReceipt`: immutable evidence of authorization, attempts, costs, verified output hashes and failure state.

It does not redefine a CharacterSpec, SceneSpec, CharacterBinding, SceneBinding, StylePackage or director shot. A Skill never calls a provider itself. The local runtime may invoke a separately registered adapter only through an ExecutionRequest; external mode remains denied until an approval binds that exact request hash.

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
- `adapter_descriptor`: register or review a provider-neutral adapter protocol surface. Use `references/execution-protocol.md`. Return `../../packages/cineweave-contracts/schemas/adapter-descriptor.schema.json`.
- `execution_request`: prepare an idempotent, budgeted request from exact artifact refs. Use `references/execution-protocol.md`. Return `../../packages/cineweave-contracts/schemas/execution-request.schema.json`.
- `execution_receipt`: record or audit authorization, attempts, cost and output hashes after runtime execution. Use `references/execution-protocol.md`. Return `../../packages/cineweave-contracts/schemas/execution-receipt.schema.json`.

## Operating sequence

1. Resolve exact Character, Appearance, Scene, State, Binding and Shot versions.
2. Resolve the exact StylePackage/StyleCompile when style affects the artifact; keep it below locked identity, geography and interaction controls.
3. Choose or instantiate the smallest matching AssetRecipe.
4. Convert preserve rules into hard controls, intended variation into soft controls and style preference into advisory controls.
5. Assemble an EvidenceBundle. Do not allow one reference to silently serve incompatible roles.
6. Resolve every evidence item and adapter dependency to a LicenseProfile.
7. Match hard adapter requirements against a CapabilityProfile.
8. Block when a hard capability, required evidence role or rights profile is unresolved.
9. Produce a provider-neutral RenderPlan reference package for Director.
10. Resolve an exact AdapterDescriptor and prepare an ExecutionRequest. Dry-run and fixture modes must deny network access; external mode requires approval of the stored request artifact itself.
11. Let the deterministic runtime execute the registered adapter and persist an ExecutionReceipt. Do not infer success from a provider message or an output filename.
12. Evaluate verified outputs with ControlBench and repair only failed tasks or one smallest variable.

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
- AdapterDescriptor may declare credential environment-variable names and a network-policy ID, but never credential values, signed URLs, private absolute paths or an arbitrary shell command.
- ExecutionRequest parameters are non-sensitive primitives. A parameter whose name resembles a token, key, password, secret, URL or endpoint must be rejected before execution.
- `external` execution is blocked unless the exact immutable ExecutionRequest artifact has an approved ApprovalRecord and the caller explicitly enables external effects.
- Retries count against both attempt and cost budgets. Every attempt, including a failed billable attempt, remains in the ExecutionReceipt.
- Receipt outputs use project-relative storage refs and lowercase SHA-256 hashes. A path or provider response alone is not evidence that an output is valid.

## Output contracts

Return only the matching schema object. A combined production request may return named `assetRecipe`, `controlChannelSet`, `evidenceBundle`, `capabilityProfile`, `licenseProfiles`, `controlBenchmark`, `adapterDescriptor`, `executionRequest` and `executionReceipt` payloads. Keep Skill receipts on authored contracts; execution receipts are produced by the runtime, not invented by the Skill.
