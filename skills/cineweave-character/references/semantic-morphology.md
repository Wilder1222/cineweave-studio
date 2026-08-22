# Semantic morphology

Use semantic morphology when a creator wants to design, compare or refine a
face/body identity before it becomes a locked `CharacterSpec`. The editor may
look like game character creation, but the contract does not store mesh
vertices, millimetres, biometric templates or provider weights.

## Model

```text
text / cards / semantic sliders / role-scoped evidence / A-B feedback
                              ↓
                  temporary editor state
                              ↓ save checkpoint
                 CharacterMorphologySpec
                              ↓ neutral evidence
                     MorphologyReview
                              ↓ human approval
                 CharacterSpec identity lock
```

Only saved checkpoints are immutable artifacts. Dragging a slider is editor
state. A saved checkpoint stores normalized semantic axes in `[-1, 1]`, a
human-readable label and observable meaning. The number describes position in
CineWeave's design space only.

## Axis and relation rules

- Prefer relations such as eye spacing to eye width, mouth width to nose width,
  midface rhythm and cheek-to-jaw transition over isolated size labels.
- Every axis belongs to `face` or `body`, has a stable feature path, lock and
  variation radius.
- `hard` locks have zero variation. `soft` locks require review. `free` axes may
  be explored only inside their declared radius.
- One comparison round changes one primary axis. Nearby sampling must preserve
  every other locked axis, relation, fixture and approved reference boundary.
- Natural asymmetry is an explicit relation, not random corruption. Keep it
  restrained and observable across the required views.

Suggested face groups include overall shape, forehead, brows, eyes, nose,
cheeks, mouth, jaw, chin, ears and soft tissue. Suggested body groups include
stature, head/body rhythm, shoulders, torso, pelvis, limbs, hands, legs and
centre of gravity. A schema does not need a bespoke field for every group;
stable feature paths keep the vocabulary extensible.

## Reference and safety policy

Reference evidence must arrive through exact `ReferenceObservation` records.
Borrow observable morphology semantics from a region; do not mechanically
assemble eyes, nose and mouth from unrelated real people. A real likeness needs
declared consent and remains separate from an original design hypothesis.

Do not infer ethnicity, health, personality or value from morphology. Do not
produce a beauty score. Technical review covers anatomy, view consistency,
locks, relations and identity stability; the creator owns preference.

## Neutral fixture and lock gate

Before identity lock, require at least front, three-quarter and profile evidence
with the same neutral expression, grooming, wardrobe, camera family, working
distance, background and light. Review:

- axis preservation and relation coherence;
- face/body consistency across views;
- plausible asymmetry and anatomy;
- expression stability when expression evidence is available;
- hard-lock and allowed-variation compliance.

`unknown` evidence is not a pass. A blocking failure prevents lock. A repair
names one axis, preserves every passing axis and states observable acceptance
checks. Approval remains a separate exact record and never follows merely from
a pleasing hero portrait.

## Representation handoff

Morphology is canonical identity design. `$cineweave-style` may reinterpret it
through a `RepresentationBinding` for photoreal, anime, manga, illustration,
stylized 3D or hybrid output. The binding may simplify or exaggerate within an
approved abstraction budget, but cannot edit the morphology checkpoint or
`CharacterSpec`.
