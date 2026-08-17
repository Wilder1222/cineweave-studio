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

## Draft brief

Draft briefs may be used by Codex to create interactive image drafts. A Draft is not valid for Handoff until the user imports real media, marks it Shortlisted and locks it as a Keyframe. A SaaS Provider never becomes the source of the DirectingSpec.

## Prohibited exchange data

- access tokens, cookies, API keys or private credentials;
- signed URLs with query secrets;
- unapproved private media copied into a Skill repository;
- World Canon not included in the minimal current context;
- claims that an external Provider generated a result when no real receipt exists;
- claims that a Web action is a creative decision.
