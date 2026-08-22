# Character appearance states

CharacterAppearanceState records controlled variables without redefining identity.

## Allowed content

- hair and grooming;
- wardrobe construction and layer state;
- makeup;
- visible skin-material state after makeup, grooming, weather and temporary condition;
- injury and recovery state;
- age-state variation when declared by CharacterSpec;
- accessories;
- rain, snow, sweat, dust and wind response.

## Invariants

- bind an exact CharacterSpec version/hash;
- assign only variables declared in that CharacterSpec;
- preserve critical anchor IDs and dominant side;
- keep garment construction compatible with the body and action;
- state transitions must have a narrative or temporal cue;
- a locked appearance state is versioned, never overwritten.
- skin state relates to the CharacterSpec baseline and cannot redefine complexion identity, facial geometry, protected marks or stable surface facts.


## Structured styling

A production AppearanceState should specify makeup base, brows, eyes, cheeks, lips, finish and intensity; hair length, structure, parting, texture, volume, accessories and movement response; costume style, silhouette, components, construction, layering, fit, palette, materials, pairing logic, condition and movement response. Materials use observable roughness, sheen, translucency, thickness, aging/moisture state and light response. Styling may alter presentation but never face geometry, body rhythm, dominant side or immutable anchors.

## Structured skin material

Use `styling.skinMaterial` for the visible state in this appearance version. Record:

- `baselineRelation`: how the state differs from the exact CharacterSpec surface baseline;
- undertone shift and post-makeup coverage;
- hydration, micro-roughness, specular strength and translucency readability;
- pore, microtexture and peach-fuzz visibility;
- tonal, redness, sebum and imperfection visibility;
- regional variation, temporary conditions and observable light response;
- explicit identity preservation and calibration.

All numeric values are 0–1 normalized creative intent. They are not measured roughness, subsurface-scattering coefficients, skin diagnosis, ethnicity evidence, biometric templates or provider controls. Describe only what should remain visibly readable at the intended shot scale. A full-body or wide shot usually omits pore-level instructions.

`skin_material` ReferenceObservations may inform this state only after separating makeup, retouch, white balance and colored-light contamination. Persistent, makeup-free baseline evidence is reviewed for CharacterSpec instead; temporary or cosmetic evidence stays here.
