# Changelog

## Unreleased

- added zero-prompt character exploration with `CharacterExplorationBrief`,
  `CharacterOptionSet` and `CharacterPreferenceFeedback` contracts;
- added a user-led, one-variable candidate-convergence workflow that separates
  technical quality gates from subjective preference and never auto-locks an
  identity;
- added the deterministic `recipe.character-exploration-board-4up` production
  recipe, workflow fixtures and semantic negative tests;
- added Chinese zero-prompt intake, reference-role, prompt-compilation and
  production handoff guidance across the standalone/composable Skills.

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
