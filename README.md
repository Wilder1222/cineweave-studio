# CineWeave Director Codex Plugin

An independent GitHub-installable Codex plugin for CineWeave’s World-first creative workflow.

This repository is intentionally outside the CineWeave Web application. Install it in each Codex environment that should create CineWeave directing proposals or visual draft briefs. CineWeave Web only imports the structured result and records the Skill receipt returned by Codex.

## What it does

- reads a user-provided World context and creative intent;
- produces 2–5 genuinely different director proposals;
- translates proposals into composition, camera, performance, lighting, sound and risk decisions;
- applies professional director logic: dramatic beats, blocking, performance objectives and audience attention;
- creates shot-by-shot storyboard sequences with lens, camera height, movement, continuity and frame prompts;
- compiles cinematic-realistic, provider-neutral text-to-image prompt packages from structured shot decisions;
- manages general text-to-image Prompts as versioned assets with domains, tags, variables, references, variants, evaluation and repair history;
- routes cinematic reference patterns through a small Gallery-first atlas instead of loading an undifferentiated prompt dump;
- prepares provider-neutral `RenderPlan` objects for generate, edit, inpaint and multi-reference workflows;
- verifies reference roles, masks, local media dimensions and content hashes before Draft import;
- includes a small, provenance-aware reference atlas with a classified dark-fantasy character portrait example;
- translates camera movement into frozen-image cues such as posture, parallax, fabric response, light direction and controlled motion blur;
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

The installable Skill is [`skills/cineweave-director/SKILL.md`](skills/cineweave-director/SKILL.md). Its prompt-management, directing, cinematography, storyboard, text-to-image, reference-editing, execution, realism and Gallery-first atlas references live under [`skills/cineweave-director/references/`](skills/cineweave-director/references/). The CineWeave import contract is documented in [`references/cineweave-contract.md`](references/cineweave-contract.md), with JSON Schemas under [`schemas/`](schemas/). Behavior contracts for image planning live under [`evals/`](evals/).

The included atlas image is a user-supplied example with unverified rights. It is classified for local reference analysis only; confirm permission before redistribution or production publication.

The Codex receipt must contain the actual repository URL, ref, commit and content hash. Never use the example values in the schema as a production receipt.

To resolve a receipt from a clean local checkout:

```bash
node scripts/resolve-skill-receipt.mjs
```

The command hashes the loaded `SKILL.md`, records the Git ref and full commit, and refuses a dirty checkout unless `--allow-dirty` is explicitly provided for diagnostics.

## Local validation

```bash
node scripts/validate-output.mjs schemas/proposal-output.schema.json examples/proposal-output.json
node scripts/validate-output.mjs schemas/hypothesis-output.schema.json examples/hypothesis-output.json
node scripts/validate-output.mjs schemas/draft-brief.schema.json examples/draft-brief.json
node scripts/validate-output.mjs schemas/image-prompt-output.schema.json examples/image-prompt.json
node scripts/validate-output.mjs schemas/prompt-record.schema.json examples/prompt-record.json
node scripts/validate-output.mjs schemas/storyboard-output.schema.json examples/storyboard.json
node scripts/validate-output.mjs schemas/render-plan.schema.json examples/render-plan.json
node scripts/validate-output.mjs schemas/reference-set.schema.json examples/reference-set.json
node scripts/validate-output.mjs schemas/media-import.schema.json examples/media-import.json
```

Examples are contract fixtures only. They are not evidence of a real Codex generation or media verification and must not be used to satisfy CineWeave’s production evidence gate.

For a real, receipt-backed plan, run production preflight separately:

```bash
node scripts/preflight-render-plan.mjs path/to/real-render-plan.json
```

`preflight-render-plan.mjs` intentionally rejects placeholder receipts in fixtures. Run it only against a real RenderPlan after the Skill checkout is clean and a human is ready to approve execution. The core repository does not call an image Provider or read API keys.

After a real PNG/JPEG/WebP file exists, verify it without exporting the local absolute path:

```bash
node scripts/verify-media-import.mjs path/to/image.png \
  --world-id WORLD_ID \
  --render-plan-ref render-plan:SHOT_ID \
  --receipt receipt.json \
  --media-type keyframe_candidate \
  --source user_upload
```
