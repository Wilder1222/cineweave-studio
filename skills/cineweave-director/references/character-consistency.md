# Character consistency and repair

Use this reference when reviewing generated CharacterSpec references, storyboard frames or Candidate media for identity and performance drift.

Consistency does not mean freezing every pixel. It means preserving the identity contract while allowing controlled state, pose, wardrobe, lens and lighting changes.

## Review tests

1. **Wardrobe removal** — would the person remain identifiable in a neutral garment?
2. **Hair occlusion** — do face geometry and body rhythm survive without the hairstyle?
3. **Silhouette** — can the body outline and resting posture distinguish the character?
4. **Cross-expression** — do joy, fear, anger and sadness remain the same face?
5. **Cross-angle** — do front, three-quarter and profile views agree structurally?
6. **Cross-shot** — do dominant side, body ratio, costume state and motion baseline remain coherent?
7. **Performance-only** — with the face obscured, does the action still fit the character?
8. **Reference scope** — did pose, style or lighting references overwrite identity?

## Failure categories

- `face_geometry_drift`;
- `body_proportion_drift`;
- `asymmetry_erasure`;
- `dominant_side_flip`;
- `wardrobe_identity_leak`;
- `expression_identity_drift`;
- `pose_overwrite`;
- `motion_fingerprint_drift`;
- `reference_role_conflict`;
- `shot_scale_overconstraint`.

## Smallest repair rule

Repair one variable at a time:

1. cite the observed failure and evidence;
2. identify the violated anchor or binding field;
3. preserve all passing identity and scene invariants;
4. change one prompt block, reference role, pose cue or mask region;
5. define an acceptance check and stop condition;
6. keep the parent Candidate and CharacterSpec immutable.

Do not solve identity drift by globally increasing prompt adjectives or copying every detail from one reference image.

## Reference locking

A character reference set should move through:

- `draft`: identity direction is still being explored;
- `provisional`: face and body anchors are selected but not tested across all states;
- `locked`: neutral views, full body, at least one expression sheet and one signature pose pass review.

A lock is a human decision backed by Observations; it is not inferred from one attractive image.
