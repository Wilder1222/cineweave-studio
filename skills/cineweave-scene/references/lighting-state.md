# Physical scene light state

`SceneLightState` records light that exists in the location at a declared time and weather state.

For every source record:

- source type and motivated origin;
- position bound to a scene anchor;
- direction and affected zones;
- relative intensity, color and optional color temperature;
- apparent source size and softness;
- falloff and shadow behavior.

Also record ambient bounce, atmosphere effects, exposure baseline, material responses, invariants and allowed variation. A practical light must occupy a plausible location. A bounce must name the surface that creates it.

Do not store bloom, halation, film grain, “dreamy glow” or a genre look here; those belong to StyleLightGrammar. Do not decide which source is key for a particular composition; Director chooses that in ShotLightingPlan. Scene owns the physical possibilities and continuity.
