# Character–scene–director orchestration

Director consumes exact asset bindings; it does not redefine them.

## Assembly order

1. Verify World scope and Skill receipts.
2. Verify each CharacterBinding references an exact CharacterSpec and optional AppearanceState.
3. Verify SceneBinding references an exact SceneSpec and optional SceneState.
4. Check active character anchors against shot scale.
5. Check character zone placement against active SceneBinding zones.
6. Check screen direction, eyeline, camera axis and dominant side.
7. Check action mechanics against architecture, props, surfaces and weather.
8. Resolve light and material response from SceneBinding without erasing character skin/costume readability.
9. Compile prompt/storyboard blocks by domain.
10. Preserve all refs and hashes in downstream records or explicit provenance.

## Conflict handling

Do not silently choose a winner when bindings conflict.

Examples:

- CharacterBinding puts a subject in a zone absent from SceneBinding → block assembly and request a corrected binding.
- Character dominant side conflicts with prop placement → preserve CharacterSpec and ask Scene/Director to adjust blocking unless Canon says otherwise.
- SceneState wind direction conflicts with fabric motion → SceneState controls environment response; update the shot cue, not the SceneSpec.
- Director lens makes a scale anchor unreadable → change camera/lens, not SceneSpec geography.

## Reference precedence

1. exact identity/geography facts;
2. approved appearance/scene states;
3. shot bindings;
4. composition and camera references;
5. lighting/material references;
6. bounded style references.

A lower-priority reference cannot overwrite a higher-priority invariant.


## Production-control handoff

Before an execution-ready RenderPlan, require `$cineweave-production` to resolve an AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile and all LicenseProfiles. Director may consume those exact refs but does not invent capability support or commercial permission. Hard control mismatch or unresolved rights leaves the execution gate blocked. InteractionConstraintSet compiles into a dedicated `sceneInteraction` block and continuity state.
