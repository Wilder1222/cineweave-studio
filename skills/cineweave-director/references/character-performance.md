# Character performance layer

Use this reference when a CharacterSpec must be translated into one shot, storyboard beat, image prompt or later video handoff.

`CharacterSpec` defines who the person is. `CharacterBinding` defines how that person appears and behaves in the current shot. Do not rewrite the long-term character because a single scene needs a temporary state.

## Performance equation

Compile the shot performance from:

`baseline motion fingerprint + objective + obstacle + trigger + emotion + intensity + concealment + spatial geography`

The result must be observable through posture, gaze, face, hands, breath and, when relevant, voice.

## CharacterBinding sequence

1. Resolve `characterId`, version and content hash.
2. Select only identity anchors visible at the current shot scale.
3. Choose an existing behavior state or visibly label a temporary inference.
4. Set emotion intensity and concealment between 0 and 1.
5. Define the action arc: start, trigger, peak and end state.
6. Describe observable performance without using only emotion labels.
7. Declare preserve items, allowed deviations and forbidden changes.
8. Bind only supplied Observation IDs for identity or performance references.

## Shot-scale filtering

- close-up: face geometry, surface evidence, asymmetry, gaze, breath and micro-expression;
- medium close-up: face anchors, shoulder and hand behavior, breathing and speech rhythm;
- medium/full body: body rhythm, center of gravity, dominant side, gesture and action clarity;
- wide: silhouette, direction, posture and scale; do not waste prompt budget on invisible pores or eyelid folds;
- silhouette: only outline, weight, costume boundary and motion signature.

Do not pour the whole CharacterSpec into every prompt.

## Emotion as behavior

Bad: “she is very afraid.”

Better: “her eyes lock on the opponent's hands before her head turns; the left foot rotates toward the exit, breath pauses once and the upper body remains upright.”

Concealed emotion should leak through limited channels. High concealment usually reduces movement amplitude rather than removing all evidence.

## Action arc

Every performance binding needs:

- `startState`: readable baseline before the trigger;
- `trigger`: the event that changes behavior;
- `peakState`: clearest action or emotional leakage;
- `endState`: stable state that hands off to the next shot.

For still images, freeze the most informative point. Do not claim the image literally moved.

## Continuity

Across adjacent shots, preserve or explicitly change:

- character version and content hash;
- active identity anchors;
- dominant side;
- costume and injury state;
- emotional intensity and concealment trend;
- gaze target, screen direction and body orientation;
- action start/peak/end relationship.

A deliberate performance discontinuity must be labeled as a story decision, not accepted as generation drift.
