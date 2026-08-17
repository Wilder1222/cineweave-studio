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

## Prohibited exchange data

- access tokens, cookies, API keys or private credentials;
- signed URLs with query secrets;
- unapproved private media copied into a Skill repository;
- World Canon not included in the minimal current context;
- claims that an external Provider generated a result when no real receipt exists;
- claims that a Web action is a creative decision.
