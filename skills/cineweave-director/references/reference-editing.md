# Reference-image and mask editing

Use this reference when a World Observation, user-supplied image, prior Candidate or mask influences the next image plan.

## Reference roles

Assign each input one explicit role:

- `identity`: preserve face, body, costume, prop or full-character identity;
- `performance`: preserve expression, pose, weight shift, gaze order or motion mechanism without redefining identity;
- `geography`: preserve SceneSpec orientation, zones, paths, entrances, exits or landmarks;
- `prop_layout`: preserve fixed/movable prop placement and continuity state;
- `atmosphere`: preserve weather, visibility or directional particle behavior;
- `composition`: preserve framing or screen direction without redefining geography;
- `lighting`: borrow source direction, contrast or color relationship;
- `style`: borrow bounded material or visual grammar, not an unbounded author identity;
- `material`: preserve surface construction or texture behavior;
- `background`: preserve geography or environmental structure;
- `mask`: define the local regeneration region;
- `reference`: a bounded supporting input that does not fit a stronger role.

Use Observation IDs rather than raw private paths or signed URLs. The Web/API layer resolves media access; the Skill only declares semantic role, optional scope and preserve contract.

For a portrait split, bind the identity image to `identity`, route reusable makeup/hair/costume to `$cineweave-character`, and represent a capture/style image through the existing `composition`, `lighting`, `style` or `material` roles. Do not invent a single “style strength” field that silently overrides identity.

## Reference scope

Use `scope` when a role is too broad:

- character: `full_character`, `face`, `body`, `costume`, `prop`, `expression`, `pose`, `motion`;
- scene: `environment`, `architecture`, `geography`, `scale`, `prop_layout`, `lighting`, `material`, `weather`, `atmosphere`, `crowd`, `damage`, `camera_axis`, `composition`, `style`, `mask`, `generic`.

A face identity input must not silently lock wardrobe. A pose input must not silently replace face or body geometry. A style input must never outrank identity or World geography.

## Edit invariant

Every edit plan must state:

1. what changes;
2. what remains unchanged;
3. how reference roles and scopes interact;
4. how the result will be checked;
5. what to do if identity, geometry, performance or continuity drifts.

Use “change only X; preserve Y” as a semantic constraint, not as a provider-specific prompt trick.

If the requested target deliberately differs from a reviewed source (for example, seated portrait → standing full-body 3:4), send Prompt the exact `ReferenceReview` ref plus an explicit source-to-target transform. Preserve, replace and exclude decisions must be separate; do not leave source-only pose, crop or prop details in the handoff.

## Mask semantics

For inpainting, the contract is explicit:

- opaque region means preserve;
- transparent region means regenerate;
- the mask must have a declared purpose;
- the plan must reject a mask without a primary reference;
- the Skill must never claim that an inpaint succeeded before media verification.

## Multi-reference order

When several references are used, identify each by index, role, scope and asset owner. Reject role conflicts before generation. Do not allow style to replace identity, performance to redefine anatomy, composition to change SceneSpec geography, or atmosphere to relocate architecture.
