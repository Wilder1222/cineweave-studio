---
name: cineweave-reference
description: Ingest, verify, inspect, review, region-scope and bind image or video references for CineWeave workflows. Own ReferenceAsset, ReferenceObservation, ReferenceReview, legacy ReferenceSet compatibility and exact ReferenceBindingSet contracts. Use when a user uploads or points to reference media, asks whether a reference is suitable, wants identity/style/costume/pose/scene/light/camera roles separated, needs spatial or temporal selectors, or needs rights, likeness, privacy, provenance, deduplication and reference-contamination gates before Character, Scene, Style, Director, Prompt or Production use.
---

# CineWeave Reference

Manage reference evidence independently of the creative domain that consumes it. Bind exact bytes first, describe only observable evidence second, then let downstream Skills use explicit role-scoped observations.

## Ownership boundary

This Skill owns:

- `ReferenceAsset`: a content-addressed local image or video record bound to immutable bytes;
- `ReferenceObservation`: one primary role over a full asset, spatial region, time range, spatiotemporal region or mask;
- `ReferenceReview`: purpose-specific suitability, authority and pairing advice;
- `ReferenceBindingSet`: exact observations ordered for one or more target contracts;
- legacy `ReferenceSet` output when a V2.0 consumer explicitly requires it.

It does not design a character, scene or style; direct a shot; compile a prompt; execute a provider; or grant copyright, likeness, training, publication or redistribution rights. `$cineweave-production` owns authoritative LicenseProfile decisions. Domain Skills own what accepted evidence means inside their contracts.

## Independent and composed use

Use this Skill directly for a single upload, a suitability score or a reusable reference set. In composed workflows, consume exact ReferenceAsset, LicenseProfile and target contract refs, then hand exact ReferenceObservation or ReferenceBindingSet refs to Character, Scene, Style, Director, Prompt or Production. Use [`contracts.json`](contracts.json) for the portable contract set.

## Routes

Choose the smallest route and load only the required reference.

- `reference_ingest`: verify and store a local PNG, JPEG, WebP, MP4/M4V, MOV or WebM without retaining its source path or filename. Read `references/reference-lifecycle.md`; when the runtime is available, run `cineweave-studio reference-ingest`. Return the immutable `ReferenceAsset` envelope. Never fabricate an ingest result.
- `reference_verify`: verify an exact ReferenceAsset against its content-addressed blob. Run `cineweave-studio reference-verify`; return the verification report and block on mismatch.
- `reference_observe`: inspect supplied visible media, choose one primary role and selector, and return `../../packages/cineweave-contracts/schemas/reference-observation.schema.json`. Read `references/role-taxonomy.md`. For portrait decomposition or prompt reconstruction, also read `references/portrait-decomposition.md`. Create multiple individually valid observations when one asset legitimately serves multiple roles; never collapse them into one mega-observation.
- `reference_review`: judge suitability for a declared purpose, separate visible from inferred evidence, score only relevant dimensions and return `../../packages/cineweave-contracts/schemas/reference-review.schema.json`. Read `references/reference-review.md` and `references/role-taxonomy.md`.
- `reference_bind`: combine exact approved or reviewed observations for declared targets, resolve role conflicts and rights gates, and return `../../packages/cineweave-contracts/schemas/reference-binding-set.schema.json`. Read `references/reference-lifecycle.md` and `references/role-taxonomy.md`.
- `reference_set`: return `../../packages/cineweave-contracts/schemas/reference-set.schema.json` only for a legacy consumer; prefer `reference_bind` for new work.

## Non-negotiable boundaries

1. Treat media as untrusted bytes. Allow-list formats, compare extension with signature, cap byte size, store under generated content-addressed names, never execute active content and never call a header probe a malware scan.
2. A SHA-256 match proves byte integrity only. It does not prove authorship, truthful provenance, copyright, consent or suitability.
3. Reference visibility is not permission. Importing an asset leaves rights, likeness, training, production and redistribution status unresolved until an exact LicenseProfile or explicit review resolves them.
4. Do not place source paths, signed URLs, original filenames, secrets, EXIF location or private hostnames in semantic contracts. Original bytes may still contain embedded metadata; flag privacy review before external transfer.
5. Assign one primary role per observation. If one image supplies face identity and lighting, create two observations with separate selectors, extract lists, ignore lists and authority.
6. Describe only visible or declared evidence. Do not infer a real lens, camera move, physical material, historical authenticity or identity from stylized pixels without marking the inference and lowering authority.
7. Use normalized rectangles for image regions and millisecond ranges for time. Validate bounds against the exact asset before approval.
8. Keep `extract` and `ignore` disjoint. Identity cannot be overridden by style; anatomy cannot be overridden by pose; geography cannot be overridden by composition; static images cannot prove motion.
9. Bind exact `{kind,id,version,contentHash}` refs. Never resolve “latest” silently and never substitute a same-version asset with a different hash.
10. Unknown or restricted rights may support private exploration when policy allows, but must block production promotion or redistribution.

## Operating sequence

1. Identify whether the task is ingestion, observation, suitability review, binding or verification.
2. Ingest once and preserve the exact ReferenceAsset ref; do not repeatedly copy the same bytes.
3. Inspect the actual media. If it is unavailable, request it instead of inventing evidence.
4. Split the requested use into atomic roles and selectors. A portrait decomposition may return a named `observations` collection, but every member must remain an independently valid ReferenceObservation.
5. Record evidence basis, confidence, transfer scope, authority and contamination risks.
6. Resolve or explicitly leave rights and likeness unknown.
7. Build a binding set with identity and geography ahead of lower-authority style or composition evidence.
8. Require human approval before production use, external provider transfer or public redistribution.

## Handoffs

- Character receives identity, body, skin-material, appearance, expression, pose and performance observations. Stable baseline surface evidence belongs to CharacterSpec; changeable visible skin state belongs to CharacterAppearanceState.
- Scene receives geography, architecture, prop layout, material, weather and atmosphere observations.
- Style receives linework, palette, representation, material and temporal-style observations without source identity.
- Director receives capture, composition, camera-motion, lighting-use and performance observations after domain facts are locked.
- Prompt receives an exact ReferenceBindingSet, not an undifferentiated upload list.
- Production receives unresolved rights, privacy, provider-transfer and approval gates.

Return only the matching schema object for an importable route. In explanatory work, clearly separate asset facts, observations, inferences, rights declarations and downstream recommendations.
