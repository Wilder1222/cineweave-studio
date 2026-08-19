# Storyboard layer

Use this reference when the creator needs a sequence of shots, a visual beat sheet, camera coverage, continuity planning or storyboard frames for later image generation.

## Sequence construction

Build the smallest useful sequence. A common progression is:

1. establish geography and the subject's relation to it;
2. prepare or delay the action;
3. show the action at its clearest point;
4. give the audience a reaction or reinterpretation;
5. transition or hold on the new end state.

Do not add coverage only to make the shot list longer. Each shot must change information, attention, spatial relation or emotional pressure.

## Required shot thinking

Every storyboard shot should specify:

- shot purpose and dramatic beat;
- shot scale, angle, height and lens;
- blocking and performance;
- composition and depth layers;
- dominant camera movement and its start/peak/end states;
- lighting and material continuity;
- sound or editorial bridge;
- transition into the next shot;
- continuity invariants;
- a provider-neutral frame prompt for the single frozen image.

## Storyboard versus image prompt

The storyboard owns sequence logic and continuity. The image prompt owns the exact frozen frame, visual hierarchy and text-to-image construction. Link them with `shotId` and keep the frame prompt subordinate to the storyboard beat.

## Continuity checks

Before returning a sequence, check that screen direction, eyelines, axis, subject identity, costume, light direction, geography and scale anchors remain coherent. If a deliberate break is required, label it as a transition decision rather than allowing an accidental discontinuity.
