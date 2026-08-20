# CineWeave release map through v1.1

The version labels describe completed architectural increments. They do not claim that remote tags or Provider integrations were created by this package.

## v0.6 — Character identity foundation

Completed:

- CharacterSpec and CharacterBinding;
- character-aware ImagePrompt, Storyboard, ReferenceSet and RenderPlan fields;
- initial face/body anchors, performance state and reference scope.

## v0.7 — Character production loop

Completed:

- CharacterReferencePlan;
- CharacterAppearanceState;
- evidence-based CharacterReview;
- one-variable CharacterRepair;
- exact asset version/hash binding.

## v0.8 — Scene production loop

Completed:

- SceneSpec, SceneState and SceneBinding;
- geography-first SceneReferencePlan;
- SceneReview and one-variable SceneRepair;
- stable zones, paths, scale, materials and camera topology.

## v0.9 — Skill separation

Completed:

- separate Character, Scene and Director Skills;
- single-owner route manifest;
- conflict precedence across Canon, assets, states, bindings, directing and style;
- character/scene-aware Director exchange contracts.

## v1.0 — Stable creative exchange

Completed:

- stable v1 contract ownership;
- non-destructive migration and migration reports;
- dependency-free local schema validation;
- semantic positive and negative tests;
- cross-device asset architecture;
- compatibility with v0.5/v0.6 Director payloads.

## v1.1 — Production control and interaction

Completed:

- fourth Skill: `cineweave-production`;
- AssetRecipe task graphs with deterministic assembly and failed-task-only retry;
- seven built-in recipes for expression, turnaround, action, styling, scene and storyboard assets;
- hard/soft/advisory ControlChannelSet with blocking fallback for hard controls;
- EvidenceBundle role, scope, quality and rights separation;
- provider-neutral CapabilityProfile and hard capability matching;
- LicenseProfile covering code, weights, dependencies, assets, consent and publication;
- CharacterAppearanceState structured makeup, hair, costume, pairing, material and movement response;
- CharacterBinding behavior causality, emotion trajectory, micro-expression and environment response;
- SceneState temporal context, background layers and physical light relationships;
- InteractionConstraintSet for contact, support, occlusion, props, light and environmental response;
- production-aware ImagePrompt, Storyboard, ReferenceSet and RenderPlan;
- CineWeave ControlBench and release-level negative tests;
- non-destructive v1.0-to-v1.1 migration.

## Recommended post-v1.1 evolution

The stable next direction is adapter and evidence implementation rather than adding more generic prompt fields:

- adapter registry backed by real capability probes and license records;
- execution receipts that remain separate from Skill receipts;
- deterministic contact-sheet assembler and media manifest writer;
- metric adapters for face identity, pose, segmentation, depth, temporal continuity and composition;
- OpenTimelineIO export for storyboard timing;
- optional USD/MaterialX interchange for 3D scene and material workflows;
- relationship and ensemble blocking graphs;
- voice, dialogue performance and long-horizon costume/prop continuity;
- navigable scene proxies and camera-path interchange.

Every extension should preserve Provider-neutral core contracts, explicit rights, human approval and evidence-based review.
