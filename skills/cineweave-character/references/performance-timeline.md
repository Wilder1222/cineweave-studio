# Performance timeline

Use a `CharacterBinding` to define the shot-specific objective, obstacle, emotion and observable baseline. Use a `PerformanceTimeline` only when timing matters.

Divide performance into phases with explicit start/end times:

1. trigger and perception;
2. appraisal and suppressed impulse;
3. chosen action;
4. emotional peak or turn;
5. release and residual state.

Within every phase specify gaze, face, breath, posture, primary action and secondary motion. Preserve the character's motion fingerprint. Prefer staggered behavior—eyes before head, breath before speech, one side of the mouth before the other—when it follows the CharacterSpec; do not add arbitrary tics for “realism.”

The Character Skill owns actor timing and behavior. Director may align phases with camera and edit time, but cannot rewrite the behavior without a new Character-owned timeline version.

Validation requires ordered, non-overlapping phases inside the declared duration. Do not include lens, camera path, cut or lighting instructions.
