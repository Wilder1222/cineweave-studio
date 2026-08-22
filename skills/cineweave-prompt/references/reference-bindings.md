# Reference bindings

Treat a reference as evidence for a declared role, never as a complete instruction by default.

## Required declaration

For each image or video record:

- observation ID supplied by the runtime or user;
- role: face/body identity, skin material, appearance/makeup/hair/costume, pose/performance, capture/composition, lighting, non-human material, palette/style, environment/geography or motion;
- scope: whole asset or named regions;
- preserve: visible properties to transfer;
- ignore: identity, costume, content, text, layout or other leakage risks;
- allowed transforms;
- source and rights status, including `unknown` when unresolved.

One asset may have multiple observations, but each observation has one primary role. When a source is both a face and style reference, create separate scoped observations rather than one ambiguous binding.

## Portrait role mapping

- `face_identity` contributes only stable face relations and protected marks to CharacterSpec.
- `face_morphology` and `body_morphology` contribute observable semantic axes and relations to CharacterMorphologySpec, not biometric landmarks, source identity or Provider weights.
- `skin_surface` contributes reviewed stable, makeup-free baseline evidence to CharacterSpec. `skin_material` contributes the current baseline-relative state to CharacterAppearanceState. If a source cannot separate them, the broad observation remains lower-confidence draft evidence. Neither becomes a generic style instruction.
- `makeup` and `hair` contribute only to CharacterAppearanceState.
- `capture` contributes observable viewpoint, crop, perspective and focus cues to ShotSpec; metadata-like lens and aperture claims remain inferred unless declared.
- `composition` and `lighting` contribute shot construction without carrying source identity.
- `palette`, `style` and `surface_style` contribute representation rules to StyleCompile without changing anatomy or physical skin state.
- `representation_geometry`, `shape_language`, `linework`, `shading`, `color_system`, `depth_language`, `effects`, `panel_layout`, `typography` and video-only `motion_style` contribute only their declared VRS dimension. RepresentationBinding decides how approved Character anchors translate.

Prompt compilation preserves this provenance. It may combine the visible results into fluent text, but acceptance checks and repair targets must still point back to the owning block.

When the output intentionally changes the source pose, frame, canvas or scene, bind the exact `ReferenceReview` and use `referenceTransform`; do not leave source-only instructions in the final prompt. See [reference-transforms.md](reference-transforms.md).

## Good reference sets

A reusable style set should keep style stable while varying subject, composition, scene and dominant color. A character identity set should use neutral light and several angles before beauty lighting. A pose reference should not silently become an identity reference.

## Runtime policy

Broad media can often compile from semantic text alone. Specific original looks, long-running identities, exact materials or hard composition targets benefit from references. Use an adaptive policy: add references when specificity, novelty, consistency risk or model uncertainty outweigh text descriptiveness.

Do not bundle user uploads or third-party media in a public plugin unless redistribution rights are explicit. Store structured observations and provenance separately from distributable examples.
