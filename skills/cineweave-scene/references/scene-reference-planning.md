# Scene reference planning

A SceneReferencePlan orders evidence collection and never claims generation.

## Phase order

1. geography and main axis;
2. reverse and overhead spatial confirmation;
3. architecture and support logic;
4. scale anchors;
5. materials and aging;
6. lighting, weather and atmosphere states;
7. prop layout and damage variants.

Each planned frame declares a scope, view, optional camera anchor/state, primary target, preserve list, controlled changes, negative constraints and human approval status. Reject visually attractive frames that alter orientation or hide the spatial question being tested.
