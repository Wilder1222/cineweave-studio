# Scene interaction

Use an InteractionConstraintSet when a character must physically and visually belong to a scene.

1. Bind exact CharacterBinding and SceneBinding IDs.
2. Declare every required contact between body part and ground, surface, prop or character.
3. State support, weight distribution and center of gravity.
4. Give explicit front/back occlusion order.
5. Bind motivated key, bounce, cast and contact shadows.
6. Describe wind, rain, snow, dust, smoke, heat or water response on hair, garment and skin.
7. Track hand/body part, grip, action and continuity state for props.
8. Reject floating feet, impossible support, contradictory shadows, broken grip or cyclic occlusion.
