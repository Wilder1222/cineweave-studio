# Changelog

## 1.1.0 — 2026-08-20

- added the independent `cineweave-production` Skill;
- added AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile, LicenseProfile and ControlBenchmark contracts;
- added seven deterministic built-in production recipes, including 3×3 expression sheets, three-view turnarounds, action sheets, appearance sheets, scene state boards and four-shot storyboards;
- expanded CharacterAppearanceState with structured makeup, hair, costume construction, fit, layering, palette, pairing, materials, condition and movement response;
- expanded CharacterBinding with behavior causality, emotion trajectory, micro-expression and environmental response;
- expanded SceneState with temporal context, background layers and physical lighting relationships;
- added InteractionConstraintSet for contact, support, body weight, occlusion, prop, shadow and weather response;
- added production and interaction refs to ImagePrompt, Storyboard, ReferenceSet and RenderPlan;
- added capability and rights blocking rules for hard controls;
- added CineWeave ControlBench, production-control evals and negative semantic tests;
- added non-destructive v1.0-to-v1.1 migration;
- retained v1.0 and v0.6-style Director payload compatibility.
- fixed migration validator path resolution on Windows and retained the legacy `observationReady` validation flag for existing Prompt fixtures.

## 1.0.0 — 2026-08-20

- split reusable character development into `cineweave-character`;
- added CharacterReferencePlan, CharacterAppearanceState, CharacterReview and CharacterRepair;
- added `cineweave-scene` with SceneSpec, SceneState, SceneBinding, SceneReferencePlan, SceneReview and SceneRepair;
- changed Director into a binding-consuming orchestration Skill;
- added scene-aware ImagePrompt and Storyboard fields;
- expanded semantic reference scopes and provider-neutral capabilities;
- added contract ownership manifest, generic schema validation, semantic tests, migration utility and release gate;
- retained v0.6 Director payload compatibility.

## 0.6.0

- added CharacterSpec and CharacterBinding inside Director;
- added character-aware image prompts, storyboards, reference scopes and render plans.

## 0.5.0

- added reusable Prompt management to the original Director, storyboard and render-planning workflow.
