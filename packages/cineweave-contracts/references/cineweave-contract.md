# CineWeave exchange contract v2

## Purpose

CineWeave contracts make creative work portable between independently usable
Skills. A contract represents a declared creative decision, not a generated
image, a provider receipt, a Canon mutation or an automatic right to publish.

## Contract families

```text
CreativeBrief → WorkflowPlan
CharacterSpec → AppearanceState → CharacterBinding
SceneSpec     → SceneState      → SceneBinding → InteractionConstraintSet
StylePackage  → StyleCompile    → StyleReview
Story outputs: StoryBrief, BeatSheet, ScriptScene, ContinuityLedger
Director outputs: ShotSpec, ShotLightingPlan, TemporalSpec, Storyboard, RenderPlan
Prompt outputs: PromptRecord, ImagePrompt, PromptHypothesis, DraftBrief,
                PromptRepair
Production outputs: AssetRecipe, ControlChannelSet, EvidenceBundle,
                    CapabilityProfile, LicenseProfile, ControlBenchmark,
                    AdapterDescriptor, ExecutionRequest, ExecutionReceipt
Suite evidence:     SkillEvaluationRun
```

`WorkflowPlan` names handoffs but does not execute them. A specialist may run
directly from a natural-language brief, then later be composed with exact
contracts from other Skills.

## Shared invariants

- Every V2 exchange record uses its schema-declared contract version. The V2.3
  package preserves 2.0 and 2.2 contract versions for compatible creative
  records while the package manifest and runtime are versioned 2.3.0.
- A dependent contract names an exact asset identity, version and content hash
  where that asset is already defined.
- A reference input has one explicit role, scope, preserve list and ignore list.
- Identity, appearance, geography, style representation and camera treatment
  remain separate ownership domains.
- External execution requires approval of the exact stored request plus explicit
  caller enablement; generated media remains an observed candidate until review
  cites evidence.
- Rights, consent and capability support are explicit records; public visibility
  does not imply permission.

## Composition boundary

Composition is allowed only through declared contract fields or a WorkflowPlan
step. Skills must not rely on a previous assistant response as an unstated
source of locked facts. A missing fact remains unresolved or routes back to its
owner.

## Repair boundary

Review identifies expected-versus-observed failures. Repair changes one smallest
variable, preserves passing criteria and produces a new candidate or asset
version. A repair plan is not proof that the repair succeeded.

## Execution boundary

Production may author an `ExecutionRequest`, but only the runtime authors an
`ExecutionReceipt`. A contract cannot select arbitrary code, a path, endpoint or
credential value. Runtime execution uses a trusted registered adapter whose
implementation hash matches an exact `AdapterDescriptor`; all attempts, costs
and output hashes remain auditable.
