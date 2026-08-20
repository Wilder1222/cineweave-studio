# Spatial and camera continuity

## Geography checks

- orientation remains stable;
- entrances, exits, paths and levels retain their relationships;
- landmarks and occlusion anchors remain in the declared zones;
- scale anchors remain comparable across lens choices;
- fixed props do not move; movable props require an action or state transition.

## Camera checks

- declare the active action axis and camera side;
- a deliberate axis crossing requires an on-axis transition or explicit re-establishment;
- eyelines and screen direction must match subject-zone relations;
- camera positions must be physically supportable unless the World explicitly permits otherwise;
- lens perspective cannot be used to justify a changed floor plan.
