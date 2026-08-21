# Character–scene–style–director orchestration

Director consumes exact asset and style bindings; it does not redefine them.

## Assembly order

1. Verify World scope and Skill receipts.
2. Verify each CharacterBinding references an exact CharacterSpec and optional AppearanceState.
3. Verify SceneBinding references an exact SceneSpec and optional SceneState.
4. Verify StylePackage/StyleCompile refs and keep visual style, temporal style and runtime reference roles separate.
5. Check active character anchors against shot scale.
6. Check character zone placement against active SceneBinding zones.
7. Check screen direction, eyeline, camera axis and dominant side.
8. Check action mechanics against architecture, props, surfaces and weather.
9. Resolve light and material response from SceneBinding without erasing character skin/costume readability.
10. Compile prompt/storyboard blocks by domain, then append scoped StyleCompile blocks.
11. Preserve all refs and hashes in downstream records or explicit provenance.

## Conflict handling

Do not silently choose a winner when bindings conflict.

Examples:

- CharacterBinding puts a subject in a zone absent from SceneBinding → block assembly and request a corrected binding.
- Character dominant side conflicts with prop placement → preserve CharacterSpec and ask Scene/Director to adjust blocking unless Canon says otherwise.
- SceneState wind direction conflicts with fabric motion → SceneState controls environment response; update the shot cue, not the SceneSpec.
- Director lens makes a scale anchor unreadable → change camera/lens, not SceneSpec geography.
- Style atom conflicts with CharacterSpec or SceneSpec → preserve the exact fact and return a StyleCompile conflict, not a silent identity/geography change.

## Reference precedence

1. exact identity/geography facts;
2. approved appearance/scene states;
3. shot bindings;
4. composition and camera references;
5. lighting/material references;
6. bounded visual style references;
7. temporal references for motion, dynamic light and editing.

A lower-priority reference cannot overwrite a higher-priority invariant.


## Production-control handoff

Before an execution-ready RenderPlan, require `$cineweave-style` to resolve the StylePackage/StyleCompile when style affects the target, then require `$cineweave-production` to resolve an AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile and all LicenseProfiles. Director may consume those exact refs but does not invent capability support or commercial permission. Hard control mismatch, unresolved style conflict or unresolved rights leaves the execution gate blocked. InteractionConstraintSet compiles into a dedicated `sceneInteraction` block and continuity state.
