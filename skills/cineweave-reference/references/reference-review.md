# Purpose-specific reference review

A review answers “is this exact asset useful for this declared job?” It is not an absolute beauty score and does not certify ownership, history, camera metadata or production readiness. Every reusable review has a stable `reviewId`, integer `version` and lifecycle `status`, so a downstream transform can bind the exact assessment rather than an unnamed prose summary.

## Review sequence

1. State the requested use and output stage.
2. Verify that the actual image or clip is visible. If only a filename, description or inaccessible URL exists, stop rather than inventing evidence.
3. Separate `visible`, `inferred`, `declared` and `unknown` claims.
4. Select one primary role for the review and name secondary roles only as pairing opportunities.
5. Score only dimensions relevant to the declared use. Give each score evidence and confidence.
6. State what to preserve, borrow and exclude.
7. Flag rights, likeness, privacy and transfer unknowns independently.
8. Recommend complementary references that fill missing evidence.
9. When the target image will intentionally depart from the reference, hand downstream Prompt an exact review ref; Prompt owns the explicit source-to-target transform.

## Suitability anchors

| Intended role | Strong evidence | Common downgrade |
|---|---|---|
| face identity | neutral expression, face unobstructed, moderate perspective, bilateral structure and age readable | beauty filter, stylization, hair/hand occlusion, extreme angle, tiny face |
| body identity | full body, feet and support visible, neutral lens/pose, proportions readable | flowing costume hides contour, crop, foreshortening, unsupported pose |
| skin material | regional tone and microtexture readable at useful scale, highlights not clipped, makeup and light contamination separable | beauty filter, denoise, sharpening, heavy foundation, colored light, tiny face, medical or ethnicity inference |
| costume | silhouette, layer order, closures, hem/sleeve, material and multiple views | only front decoration, identity contamination, impossible ornament topology |
| pose/performance | weight, contact, gaze, hands and action motivation readable | fashion pose without support, ambiguous hands, still used as motion proof |
| style | repeatable line, value, color, material and representation rules separable from content | one-off subject/color/composition leakage, creator name without mechanisms |
| lighting | source direction, softness, ratio, shadow and material response readable | illustration treated as physical capture proof, mixed unknown sources |
| composition | attention order, foreground/midground/background, scale and negative space readable | composition inseparable from source subject or aspect ratio |
| capture | viewpoint, crop, perspective and focus cues are readable and can be stated without inventing metadata | focal length or aperture claimed as fact from one still, perspective conflated with face geometry, motion inferred from blur alone |
| architecture/geography | structure, scale anchors, circulation and multiple viewpoints | decorative facade only, no plan/topology, uncertain historical claim |
| camera motion | continuous clip with path, speed, acceleration and framing change | static image, edit hidden as motion, subject motion confused with camera motion |

## Scoring

Use integers from 0–10 only when the dimension is relevant:

- 9–10: strong primary evidence with little contamination;
- 7–8: useful evidence with explicit exclusions or one complementary reference needed;
- 5–6: secondary evidence only; substantial ambiguity;
- 3–4: weak hypothesis source, not an authority;
- 0–2: unusable or actively misleading for this role.

The overall decision follows the requested purpose, not the arithmetic mean:

- `recommended`: primary evidence is strong and gates are understood;
- `conditional`: useful after role scoping, pairing, rights resolution or contamination controls;
- `not_recommended`: missing, misleading or unsafe evidence for the requested role.

## Pairing patterns

- stylized portrait + neutral authorized identity photo;
- close face + neutral full-body anchor;
- costume beauty image + rear/side construction views + material macro;
- architecture elevation + plan/topology + lived-in material reference;
- still composition + separate motion clip;
- style anchor + boundary examples with different subjects and scenes.

Never recommend copying a source person, branded work or creator signature when the user's goal can be met by extracting transferable visual mechanisms.
