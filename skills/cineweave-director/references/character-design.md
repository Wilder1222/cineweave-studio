# Character design layer

Use this reference when the creator wants to create, normalize, version or repair a reusable CineWeave character rather than a one-off portrait prompt.

A character is a World asset, not a hairstyle, costume or single reference image. The durable contract is `CharacterSpec`; generated images remain Observations or Candidates until a human reviews them.

## Character design order

1. State one narrative character thesis: role, desire, fear, public mask and private contradiction.
2. Define three to six immutable identity anchors before adding wardrobe or style.
3. Describe face and body as geometry, proportion and material evidence rather than generic beauty labels.
4. Add natural asymmetry or lived-in surface evidence when the target is realistic.
5. Separate locked identity from controlled appearance variables.
6. Define a motion fingerprint that remains recognizable without the face.
7. Translate emotional states into observable behavior.
8. Declare forbidden changes, required reference views, rights status and validation tests.
9. Version the CharacterSpec; never silently mutate a locked version.

## Identity anchors

Strong anchors survive changes in lighting, wardrobe and scene style. Prefer:

- face silhouette, jaw transition and cheekbone relation;
- eye shape, spacing and eyelid construction;
- nose and mouth geometry, including restrained asymmetry;
- head-to-body ratio, shoulder-to-hip rhythm and limb proportions;
- center of gravity, dominant side and signature silhouette;
- one distinctive surface mark or movement cue when narratively justified.

Avoid relying on only hair color, eye color, costume, a weapon, a scar or a decorative accessory. Those may support identity but should not replace face and body structure.

## Face design

Describe:

- skull and face geometry;
- feature relations rather than isolated feature adjectives;
- skin, hair, lips and eyes as different materials;
- natural asymmetry and age evidence;
- what must not change across expression or camera angle.

Do not use “beautiful”, “perfect”, “high-class face” or “cinematic” as substitutes for structure.

## Body design

Treat body design as a proportion rhythm and a history trace:

- head-to-body ratio;
- shoulder, ribcage, waist and pelvis relation;
- torso-to-leg and upper-arm-to-forearm relation;
- hand and foot scale;
- muscle or fat distribution;
- dominant side and occupational traces;
- habitual center of gravity.

The body must support the character's age, work, training and lived experience. Do not add exaggerated proportions only because they look fashionable.

## Identity versus appearance

Keep four layers explicit:

- `identityCore`: immutable face, body, silhouette and natural asymmetry;
- `appearanceLayers`: controlled hair, wardrobe, makeup, injury and weather states;
- `motionFingerprint`: baseline posture, gaze order, walk, turn and signature gestures;
- `behaviorModel`: observable responses to dramatic states.

Changing a wardrobe variable must not change face geometry, body ratio, dominant side or movement baseline.

## Rights and likeness

Record whether the source is fictional original, adapted, a user likeness, licensed character or public-domain material. A supplied image is evidence, not automatic permission. Do not claim consent, licensing or redistribution rights that were not supplied.

## CharacterSpec review

Before returning a CharacterSpec, check:

- at least three immutable anchors exist;
- identity is recognizable without wardrobe or hairstyle;
- face and body facts do not contradict each other;
- appearance variables cannot overwrite identity;
- motion cues are observable and repeatable;
- emotional states are behaviors rather than labels;
- dominant side and body proportions are explicit;
- rights, provenance and reference status are recorded;
- the output remains a draft until human review.
