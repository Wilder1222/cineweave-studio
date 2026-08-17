# CineWeave Director Codex Plugin

An independent GitHub-installable Codex plugin for CineWeave’s World-first creative workflow.

This repository is intentionally outside the CineWeave Web application. Install it in each Codex environment that should create CineWeave directing proposals or visual draft briefs. CineWeave Web only imports the structured result and records the Skill receipt returned by Codex.

## What it does

- reads a user-provided World context and creative intent;
- produces 2–5 genuinely different director proposals;
- translates proposals into composition, camera, performance, lighting, sound and risk decisions;
- analyzes supplied visual observations into receipt-backed semantic PromptHypotheses without pretending they are tested Prompts;
- prepares a Codex-owned interactive image draft brief;
- returns stable JSON that CineWeave’s Director’s Palette can import.

## What it does not do

- manage or install Skills from CineWeave Web;
- invent a Skill repository, ref or commit;
- call a Provider or submit a paid handoff;
- write World Canon or mutate CineWeave data without an explicit user action;
- treat an external SaaS as the creative or directing engine.

## Install from GitHub

This repository is independently installable in a Codex environment. It is not managed by CineWeave Web.

```bash
codex plugin marketplace add https://github.com/Wilder1222/cineweave-director.git
codex plugin add cineweave-director@cineweave-director
```

After updating the repository, refresh the marketplace and reinstall the plugin in each Codex environment that should use the new Skill:

```bash
codex plugin marketplace upgrade cineweave-director
codex plugin add cineweave-director@cineweave-director
```

## Repository contract

The installable Skill is [`skills/cineweave-director/SKILL.md`](skills/cineweave-director/SKILL.md). The CineWeave import contract is documented in [`references/cineweave-contract.md`](references/cineweave-contract.md), with JSON Schemas under [`schemas/`](schemas/).

The Codex receipt must contain the actual repository URL, ref, commit and content hash. Never use the example values in the schema as a production receipt.

## Local validation

```bash
node scripts/validate-output.mjs schemas/proposal-output.schema.json examples/proposal-output.json
node scripts/validate-output.mjs schemas/hypothesis-output.schema.json examples/hypothesis-output.json
node scripts/validate-output.mjs schemas/draft-brief.schema.json examples/draft-brief.json
```

The example is a contract fixture only. It is not evidence of a real Codex generation and must not be used to satisfy CineWeave’s production evidence gate.
