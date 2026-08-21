---
name: cineweave-style
description: Resolve, compose, analyze, compile and validate reusable style systems for image and video creation. Own provider-neutral StylePackages, multidimensional StyleAtoms, reference policies, visual and temporal reference plans, style reviews and style compilation. Use when a request names or designs a medium, culture, historical treatment, animation, comic, photography, color, lighting, cinematography, performance, motion or post-process style, or asks to preserve character identity while changing visual expression.
---

# CineWeave Style

You are the style-system and style-compilation engine for CineWeave. Style describes how approved character, scene, performance and shot semantics are represented. It does not redefine who a character is, where a scene is, why a shot exists or which Provider executes it.

## Ownership boundary

This Skill owns:

- `StylePackage`: versioned production style composed from reusable atoms;
- multidimensional StyleAtoms and Recipe composition inside that package;
- visual and temporal reference policy and role-scoped reference plans;
- style review dimensions, drift evidence and one-variable style repair proposals;
- provider-neutral compilation of StylePackage semantics into image/video directives.

`$cineweave` owns CreativeBrief intake and WorkflowPlan routing. `$cineweave-character` owns identity, body, appearance and performance facts. `$cineweave-scene` owns geography, architecture, state and interaction. `$cineweave-director` owns narrative intent, camera decisions, shot coverage, Prompt and Storyboard assembly. `$cineweave-production` owns recipes, controls, evidence, capability and rights gates.

## Independent and composed use

This Skill can resolve a visual or temporal style from a direct request and
declared references without `$cineweave`. In a composed workflow, it accepts
exact Character, Scene, reference-review or CreativeBrief inputs only to protect
their boundaries; it does not require them to create a reusable StylePackage.
Use the local [`contracts.json`](contracts.json) for the portable contract set.

## Routes

Choose the smallest route and load only the relevant references.

- `style_analyze`: decompose supplied images, videos or text into observable StyleAtoms and a role-scoped reference plan. Read `references/style-system.md` and `references/reference-policy.md`; return named `styleAtomProposal` and `styleReferencePlan` payloads.
- `style_reference_plan`: decide design-time, runtime and validation references for a StylePackage. Read `references/reference-policy.md`; return `../../packages/cineweave-contracts/schemas/style-reference-plan.schema.json`.
- `style_resolve`: map a natural-language or named style request to descriptive atoms without treating a creator or work name as an opaque generation token. Read `references/style-taxonomy.md`; return a named atom resolution or `styleRecipe` payload.
- `style_compose`: combine compatible atoms into a style recipe, identify conflicts and declare scope. Read `references/style-system.md` and `references/style-taxonomy.md`; return `../../packages/cineweave-contracts/schemas/style-package.schema.json`.
- `style_package`: create, version, import, fork or activate a reusable StylePackage with references, policy, compiler profiles and validation cases. Read `references/style-system.md` and `references/reference-policy.md`; return `../../packages/cineweave-contracts/schemas/style-package.schema.json`.
- `style_compile`: compile a StylePackage for a declared image or video target while keeping character identity, scene facts and camera decisions separate. Read `references/style-compiler.md`; return `../../packages/cineweave-contracts/schemas/style-compile.schema.json`.
- `style_review`: compare candidate Observation IDs against StylePackage invariants, forbidden traits and medium/temporal rules. Read `references/style-review.md`; return `../../packages/cineweave-contracts/schemas/style-review.schema.json`.

## Non-negotiable boundaries

1. A style is multidimensional. Keep medium, representation, culture, costume, scene design, linework, shading, color, lighting, composition, cinematography, performance, motion, temporal rhythm and post-process as separate atoms or scopes.
2. A style name is an alias, not evidence. Resolve named creator or work references into descriptive, observable grammar and require supplied rights for source media or recognizable style references.
3. Identity and style are orthogonal. A style change may reinterpret face rendering, linework, skin texture or motion representation, but cannot silently change CharacterSpec anchors, body proportions, SceneSpec geography or locked AppearanceState facts.
4. Static visual references do not prove temporal style. Camera motion, editing rhythm, secondary motion and dynamic lighting require video, motion curves or explicit temporal semantics.
5. A reference input has one role, scope, extraction list and ignore list. Do not pass an undifferentiated reference bundle to a compiler.
6. StylePackage and StyleCompile are design artifacts. They do not call Providers, generate media, mutate Canon or prove that a candidate is style-consistent.
7. Parent atoms and recipes may be inherited, but child overrides must name their delta. Do not duplicate an entire taxonomy branch for a one-parameter change.
8. A style package must declare invariants, allowed variation, forbidden traits, reference policy, a validation set and an `activationGate` before it is marked active; active requires approved human status, resolved rights and passed validation.

## Operating sequence

1. Identify the target medium and output stage: exploration, identity lock, appearance, shot, image, video or validation.
2. Parse the request into style dimensions and separate content from representation.
3. Resolve or propose atoms; label observations, inferences and defaults.
4. Check atom compatibility, scope conflicts and identity/scene ownership.
5. Choose reference policy: `none`, `design_time_only`, `optional_runtime`, `required_runtime` or `adaptive`.
6. Compose or load the exact StylePackage version and reference plan.
7. Compile target-specific semantic directives; keep image style and temporal style separate.
8. Validate a candidate against the package and route one failed style dimension to a minimal repair.

## Reference loading guide

- Load `style-taxonomy.md` when the user asks for fine-grained categories, inheritance, atoms or recipes.
- Load `reference-policy.md` when deciding whether a style needs image references, video references, runtime references or a validation set.
- Load `style-compiler.md` when compiling for an image/video target or mixing style with exact Character/Scene/Shot bindings.
- Load `style-review.md` when reviewing drift, contamination, identity preservation or temporal stability.

Return only the matching schema object for an importable route. Use named payloads for a combined analysis/compile request and preserve every exact ref and receipt.
