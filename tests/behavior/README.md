# Behavior evaluations

`cases.json` tests Skill activation and contract ownership, not just file validity. It includes direct, indirect, incomplete, negative and edge requests.

Validate definitions:

```powershell
node scripts/run-behavior-evals.mjs --validate
```

Grade captured results:

```powershell
node scripts/run-behavior-evals.mjs --grade path\to\results
```

Each result is `<case-id>.json` with:

```json
{
  "caseId": "prompt.direct.general-image",
  "activatedSkills": ["cineweave-prompt"],
  "route": "prompt_design",
  "contractKinds": ["cineweave_codex_prompt_record"],
  "behaviorAssertionsPassed": [
    "works outside cinematic content",
    "uses observable light and material relations"
  ],
  "claims": []
}
```

The grader checks declared activation, route, output ownership, forbidden output and assertion coverage. Human or model-based evaluation remains responsible for semantic quality of the actual prose or JSON payload.
