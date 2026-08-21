# Character reference planning

A CharacterReferencePlan orders evidence acquisition. It does not generate media.

## Phase order

1. `identity`: neutral front, three-quarter and profile views under neutral light.
2. `body`: front, side, back, neutral stance and walk mid-frame in simple clothing.
3. `expression`: controlled intensity ladders; change one emotion/intensity variable at a time.
4. `motion`: idle, walk, stop, turn, threatened, protect, profession/tool action.
5. `appearance`: approved wardrobe, hair, makeup, injury and weather states after identity is stable.

## Frame contract

Each frame declares:

- semantic role and scope;
- view and framing;
- pose/action and optional expression intensity;
- neutral or motivated lighting;
- preserve list and one controlled change;
- targeted negatives;
- human approval status.

Reject frames where style, hairstyle, costume, pose or camera distortion obscures the identity question being tested.

## Director handoff

The Director may use a hero portrait to calibrate capture style, appearance and performance, but the portrait is not automatically the identity master. Promote identity only after neutral face/body evidence and a human lock on the `CharacterSpec`.

The same identity may later be rendered as live action, hand-drawn animation, comic or stylized 3D. Keep that representation choice in `$cineweave-style`; CharacterSpec stores semantic face/body/behavior anchors and the CharacterReferencePlan records whether a frame tests identity, body, performance or appearance.

For repeated production, hand off exact `CharacterSpec` and `CharacterAppearanceState` refs to `$cineweave-production` for the built-in turnaround and expression-sheet recipes. The requested “three views plus a nine-expression board” is two independent recipe runs plus deterministic assembly, not one multi-panel image Prompt. Accepted tiles remain immutable; only failed tasks may be retried.
