# Directing layer

Use this reference when the request is about dramatic intent, blocking, performance, scene rhythm or deciding what the shot must communicate.

## Director's order of operations

1. State the scene purpose in one sentence.
2. Identify the character objective, obstacle and change at the end of the beat.
3. Decide what the audience should notice first, second and last.
4. Verify supplied CharacterBindings and SceneBinding before inventing blocking or performance details.
5. If the moment belongs to a multi-beat physical sequence, bind the exact
   ActionSequenceSpec and select only the required action beat IDs.
6. Block subjects into declared scene zones before choosing a lens or movement.
7. Give the performance an observable action, not only an emotion label.
8. Choose one dominant visual target and one dominant camera idea.
9. End the shot on stable character and scene states.

## Beat design

Every still or storyboard frame should represent a meaningful moment:

- preparation before an action;
- the action at its clearest readable point;
- the reaction that changes the audience's interpretation;
- the reveal after a controlled obstruction;
- the end state that hands off to the next shot.

Do not illustrate an entire scene in one image. Select the frame that carries the strongest dramatic information.

## Blocking and performance

Describe what the subject does in space: stops, crosses, turns, reaches, hides, yields, watches, exits or holds. Include the relationship between subject, foreground obstruction, background anchor and eyeline. Keep facial expression restrained unless the story requires an explicit performance change.

When a CharacterBinding is supplied, preserve it rather than rewriting the character. `$cineweave-character` resolves:

- visible identity anchors for the current shot scale;
- objective, obstacle, trigger, emotion intensity and concealment;
- start, peak and end action states;
- posture, gaze, face, hands, breath and voice;
- preserve items, allowed deviations and forbidden changes.

The director layer owns story purpose, action beat, blocking, performance intensity, audience attention and continuity priorities. It consumes SceneBinding zones and camera topology, and it does not own reusable character identity, scene identity, final provider parameters or a claim that media was generated.

For multi-beat action, ActionSequenceSpec owns the ordered sequence and coverage
requirements. ShotSpec selects exact beats and decides how the audience sees
them; it cannot silently reorder, omit a required state change or add a new
physical capability.

## Review questions

- Can the shot purpose be understood without the word “cinematic”?
- Is the primary target visually unambiguous?
- Does the subject's action have a start, trigger, peak and end state?
- Does the observable performance preserve the supplied CharacterBinding?
- Are only shot-scale-visible identity anchors and scene anchors being compiled?
- Is the camera choice helping the dramatic idea rather than decorating it?
- What must remain unchanged when the next variant is generated?
