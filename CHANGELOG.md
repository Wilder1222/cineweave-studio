# Changelog

## Unreleased

No unreleased changes.

## 2.2.0 — 2026-08-21

- split screenwriting and general text-to-image management into the independent
  `$cineweave-story` and `$cineweave-prompt` Skills;
- expanded the suite to eight standalone/composable Skills and 54 uniquely
  owned contracts;
- added StoryBrief, BeatSheet, ScriptScene and ContinuityLedger;
- added PerformanceTimeline, SceneLightState, StyleLightGrammar, ShotSpec,
  ShotLightingPlan, TemporalSpec and PromptRepair;
- separated physical scene light, representational light grammar and shot-level
  source use;
- added zero-prompt character exploration, controlled options and user-led
  preference convergence without automatic beauty scoring or identity lock;
- added a strict local runtime with RFC-8785-compatible hashes, concurrent
  immutable version claims and exact-hash approvals;
- added deterministic external board assembly with per-tile hashes and partial
  failure provenance;
- removed an unverified user-upload image from the distributable plugin and
  added a binary/reference rights audit;
- added 24 behavior cases, expanded semantic negative tests and Windows/Linux CI;
- pinned the marketplace source to the immutable `v2.2.0` release tag.

## 2.0.0 — 2026-08-20

- renamed the product package to CineWeave Studio;
- added the optional `$cineweave` intake and workflow-composition Skill;
- made all five expert Skills explicitly standalone and composable;
- moved canonical schemas, examples, recipes and ownership metadata into
  `packages/cineweave-contracts`;
- added the V2 WorkflowPlan contract, activation fixtures and composition tests;
- added portable Skill-bundle build validation and V2 architecture checks;
- moved natural-language brief ownership from Director to the product router;
- removed the V1 runtime compatibility requirement in favor of an explicit
  non-destructive V1.1-to-V2 migration utility.

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
