# Scene states

SceneState is a controlled variation of one exact SceneSpec.

## State variables

- time of day;
- weather and season;
- occupancy and crowd behavior;
- damage state;
- motivated light state;
- atmosphere and visibility.

Each assignment must reference a variable declared by SceneSpec and state a rationale. Preserve orientation, zones, connections, entrances/exits, critical structures, scale anchors and camera axes unless a new SceneSpec version explicitly changes them.

Physical light includes source, direction, color relationship, exposure and shadow behavior. Atmosphere includes weather, density, visibility and directional particle response.
