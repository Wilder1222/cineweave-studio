# Character appearance states

CharacterAppearanceState records controlled variables without redefining identity.

## Allowed content

- hair and grooming;
- wardrobe construction and layer state;
- makeup;
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


## Structured styling

A production AppearanceState should specify makeup base, brows, eyes, cheeks, lips, finish and intensity; hair length, structure, parting, texture, volume, accessories and movement response; costume style, silhouette, components, construction, layering, fit, palette, materials, pairing logic, condition and movement response. Materials use observable roughness, sheen, translucency, thickness, aging/moisture state and light response. Styling may alter presentation but never face geometry, body rhythm, dominant side or immutable anchors.
