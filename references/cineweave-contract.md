# CineWeave exchange contract

This file defines the boundary between an independently installed Codex Skill and CineWeave Web.

## Proposal import

The Director’s Palette accepts:

```json
{
  "skillReceipt": {
    "repository": "https://github.com/owner/repository",
    "ref": "v0.1.0",
    "commit": "40-character-git-sha",
    "contentHash": "sha256:<sha256-of-skill-content>",
    "installedBy": "codex-environment",
    "environmentId": "optional-device-id",
    "usedAt": "2026-08-17T12:00:00.000Z"
  },
  "sourceInput": "the creator intent",
  "proposals": [
    {
      "title": "short title",
      "summary": "why this direction fits",
      "narrativeIntent": "what the shot communicates",
      "audienceFeeling": "curiosity → awe → stillness",
      "composition": "one primary visual target and spatial structure",
      "camera": "lens, height, movement, speed curve and end state",
      "performance": "actor objective and blocking",
      "visualTreatment": "light, palette, material and atmosphere",
      "soundEdit": "sound bridge and editorial rhythm",
      "styleStack": [{ "label": "东方诗意", "weight": 0.4 }],
      "preserve": ["current World identity"],
      "allowedChanges": ["one controlled exploration variable"],
      "cost": "Codex interactive draft first",
      "risk": "specific failure and mitigation",
      "recommendedProvider": "codex"
    }
  ]
}
```

The receipt is provenance, not permission. CineWeave stores it but does not install, update, inspect or execute the repository.

## PromptHypothesis import

When analyzing supplied visual observations, Codex may return a semantic hypothesis payload:

```json
{
  "kind": "cineweave_codex_prompt_hypothesis",
  "worldId": "WORLD_...",
  "skillReceipt": { "repository": "https://github.com/owner/repository", "ref": "v0.2.0", "commit": "40-character-git-sha", "installedBy": "codex-environment", "usedAt": "2026-08-18T12:00:00.000Z" },
  "hypotheses": [
    {
      "hypothesisId": "optional-retry-id",
      "fragment": "one observable visual mechanism or constraint",
      "category": "light",
      "confidence": "medium",
      "unknowns": ["actual color temperature"],
      "observationIds": ["OBS_..."],
      "analysisRunId": "optional-analysis-run",
      "modelSnapshot": "optional-model-snapshot",
      "inputHash": "optional-input-hash",
      "alternativeHypotheses": ["one competing explanation"]
    }
  ]
}
```

The Web/API layer validates the receipt and World scope, stores the record as a draft hypothesis, and supports safe retry. It must not infer missing fragments, Observation IDs, confidence, or alternatives. A hypothesis is not a Prompt, tested result, Canon fact, or Provider result until a later Codex experiment and human review establish that evidence.

## Draft brief

Draft briefs may be used by Codex to create interactive image drafts. A Draft is not valid for Handoff until the user imports real media, marks it Shortlisted and locks it as a Keyframe. A SaaS Provider never becomes the source of the DirectingSpec.

## Cinematic text-to-image prompt package

The `image-prompt-output.schema.json` payload is a Codex-owned design package for one cinematic still, storyboard frame or Keyframe candidate. It carries:

- one narrative purpose and one primary visual target;
- structured shot language: scale, angle, height, lens, focus, composition and movement cue;
- director-owned action moment and end state;
- prompt blocks for World, story, subject, mise-en-scène, camera, lighting, realism, style and technical framing;
- concise and expanded provider-neutral prompt forms;
- targeted negative constraints, preserve items and controlled changes;
- physical realism checks and the real Skill receipt.

It is not a Provider request, generation result, model receipt or permission to mutate World data. Camera movement in this payload describes the frozen capture moment and must not claim that a still image literally moved.

## Storyboard sequence

The `storyboard-output.schema.json` payload contains the minimum useful shot sequence for a scene. Each shot owns its dramatic purpose, beat, blocking, camera language, movement start/peak/end states, sound/edit bridge, transition, continuity contract and provider-neutral frame prompt. The storyboard owns sequence logic; an image-prompt package owns the detailed frozen frame.

Shot continuity must preserve or explicitly label changes to screen direction, eyeline, 180-degree axis, subject identity, costume, geography, light direction and scale anchors.

## Managed general text-to-image Prompt

The `prompt-record.schema.json` payload manages a Prompt independently of the cinematic shot package. It records a stable Prompt ID, title, version, lifecycle status, domain, generation mode, purpose, semantic prompt blocks, reusable variables, scoped references, bounded variants, evaluation criteria and provenance.

The PromptRecord supports portrait, product, fashion, architecture, landscape, food, character, fantasy, illustration, anime, editorial, social, abstract, technical and cinematic domains. Camera, lens, movement and live-action realism are optional domain blocks; they must not be injected into every Prompt by default.

Updates create a new version and preserve the parent and change log. Import preserves the user's source text before normalization. A PromptRecord is still a design artifact: it does not prove that a Provider generated an image, and it does not replace a human-gated RenderPlan or verified Draft import.

## Semantic reference set

The `reference-set.schema.json` payload maps World Observation IDs to semantic roles. It must say what each reference preserves and what transformations are allowed. It must not include raw private paths, signed URLs, access tokens or a hidden assumption that a style reference replaces a character identity reference.

Supported roles include `identity`, `composition`, `lighting`, `style`, `material`, `background`, `mask` and `reference`. The reference set is an input contract, not a media upload or generation receipt.

## Provider-neutral RenderPlan

The `render-plan.schema.json` payload prepares a later execution route without executing it. It declares:

- `generate`, `edit`, `inpaint` or `multi_reference` mode;
- prompt payload reference, canvas ratio, size intent, quality budget and bounded variant count;
- semantic Observation inputs and preserve contracts;
- mask semantics when inpainting;
- human approval gate;
- preflight checks and postflight artifact requirements.

The RenderPlan must remain Provider-neutral. It cannot contain a model name, endpoint URL, vendor flag, API key or claim that a generation succeeded. An optional adapter may translate it into a host-native image tool or an explicitly approved external CLI.

## Verified Draft media import

The `media-import.schema.json` payload is produced only after real local media bytes have been checked. It records a basename, supported format, byte size, dimensions, content hash and source class. It never exports the local absolute path or a private URL. Its status is always `draft` until a human reviews continuity and explicitly locks a Keyframe.

## Prohibited exchange data

- access tokens, cookies, API keys or private credentials;
- signed URLs with query secrets;
- unapproved private media copied into a Skill repository;
- World Canon not included in the minimal current context;
- claims that an external Provider generated a result when no real receipt exists;
- claims that a Web action is a creative decision.
