# Cinematography and camera language

Use this reference when the request involves shot size, lens, camera height, angle, focus, lighting, camera movement or visual continuity.

## Camera language

Describe camera decisions with observable terms:

- shot scale: extreme-wide, wide, medium-wide, medium, medium-close, close-up, extreme close-up, insert, over-the-shoulder or point-of-view;
- angle: eye-level, low, high, overhead, dutch or profile;
- height and distance: where the camera is in relation to the subject and the ground;
- lens: focal length and its spatial consequence, not a magical “cinematic lens” label;
- focus: focus target, depth relationship and any deliberate rack focus;
- composition: primary target, depth layers, leading lines, negative space and screen direction.

## Lens heuristics

These are starting points, not immutable facts:

- 24–28mm: spatial expansion, foreground energy and environmental scale;
- 35mm: human-scale geography with visible surroundings;
- 50mm: restrained perspective and neutral observation;
- 85mm: portrait intimacy, separation and compressed emotional space;
- 100–135mm: distance, isolation and layered compression.

Always explain why the lens serves the story. Do not choose focal length only because it sounds professional.

## Movement grammar

Use one dominant movement per shot unless a transition explicitly requires a compound move. Represent movement as:

```json
{
  "type": "dolly | truck | pan | tilt | arc | crane | handheld | gimbal | static",
  "direction": "observable direction or axis",
  "speedCurve": "start, acceleration, peak and settle",
  "startState": "what is framed first",
  "peakState": "the most important visual change",
  "endState": "the stable frame handed to the next beat"
}
```

Movement should reveal, pursue, isolate, destabilize, connect or release. A text-to-image frame cannot literally move, so convert the movement into a capture moment: body posture, trailing fabric, parallax layers, controlled motion blur, directional light or a readable leading line.

## Continuity

Track the 180-degree axis, screen direction, eyelines, subject scale, light direction, horizon and dominant color. A repair should change the cheapest variable while preserving these invariants.
