# Shot-level SceneBinding

SceneBinding compiles an exact SceneSpec and optional SceneState into one shot.

## Required decisions

- active immutable anchor IDs and zone IDs;
- camera anchor, zone, axis, side, height and orientation;
- spatial relation of each subject to zones and eyeline targets;
- foreground, midground and background plan;
- key, fill, practicals, shadow direction and atmosphere;
- material response visible in this shot;
- reference Observation IDs;
- preserve, allowed deviation and forbidden change lists;
- previous binding ID when continuity matters.

Do not include every SceneSpec fact. Include only facts visible or continuity-critical in the current shot.
