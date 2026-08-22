# Reference-to-target transforms

Use a `referenceTransform` whenever the requested image deliberately departs from a reviewed reference. It records the delta between source evidence and the target; it is not a second style prompt and does not authorize copying an unreviewed identity.

## Required sequence

1. Bind one or more exact `ReferenceReview` artifacts in `sourceReviewRefs`.
2. Split the request into `targetDeltas`, one per changed or explicitly retained dimension.
3. Mark each dimension as `preserve`, `replace`, `exclude` or `unresolved`.
4. State whether the target directive comes from the user, a target contract, source evidence, or a safe default.
5. Define observable acceptance checks before compiling the fluent prompt.

The transform is optional for a source-faithful reconstruction. It is required whenever source and target differ in a way that would otherwise create contradictory prompt text, such as seated-to-standing, portrait-to-full-body, horizontal-to-3:4 vertical, or a costume/scene replacement.

## Reframe example

For “analyze this seated performance portrait, then make a 3:4 standing full-body image”:

- preserve: the approved facial/wardrobe/material and light relationships;
- replace: canvas → 3:4 vertical; framing → uncropped full body; pose/subject state → relaxed standing with visible support;
- exclude: stool, crossed legs, microphone and any source-only crop;
- unresolved: lens metadata, hidden footwear construction or non-visible back details;
- reject the result if feet are cropped, a seated pose remains, or a source-only prop leaks back in.

Do not use source-visible or source-inferred evidence as the basis for a `replace` delta. A target change must be user-declared, come from an exact target contract, or be a clearly labelled safe default.
