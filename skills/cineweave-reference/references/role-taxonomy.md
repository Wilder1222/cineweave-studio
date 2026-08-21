# Reference role taxonomy

Choose the role by the evidence being transferred, not by the subject category in the source image. A portrait can supply lighting; an architecture photo can supply palette; neither should silently transfer all visible content.

## Identity and character

- `face_identity`: stable facial structure, age impression and identity marks. Prefer neutral, unobstructed, low-distortion face evidence.
- `body_identity`: stable body proportions, silhouette and posture baseline. Do not derive it from a close portrait.
- `identity`: legacy combined identity evidence; prefer separate face and body observations.
- `appearance`, `makeup`, `hair`, `costume`, `prop`: changeable design state. Exclude source identity unless separately authorized.
- `expression`, `pose`, `performance`: a visible state or performance mechanism. A still proves a pose or frozen expression, not its timing.
- `motion`: subject trajectory or secondary motion from a clip. Use a temporal selector.

## Image construction

- `composition`: framing, spatial hierarchy, negative space and depth layering.
- `lighting`: visible direction, softness, ratios and motivated source effects. Mark physical source or lens conclusions as inferred unless declared.
- `palette`: color relationships and value distribution.
- `material`: visible surface response, texture scale, wear and translucency.
- `style`: medium and representation grammar. Explicitly ignore source identity, costume, pose and scene content unless separately observed.

## Scene and time

- `environment`: broad environmental appearance without claiming exact geography.
- `geography`: persistent topology, circulation and relative positions; needs multi-view or measured evidence for high authority.
- `architecture`: typology, massing, bays, construction and ornament treatment; separate historical evidence from inspired reinterpretation.
- `prop_layout`: object position and spatial relation for continuity.
- `atmosphere`: static fog, rain, dust or air appearance.
- `camera_motion`: camera path, acceleration and framing change from video only.
- `temporal_atmosphere`: how weather, particles or light evolve through time.

## Control roles

- `mask`: an exact mask asset that limits an operation; it does not describe content.
- `validation_boundary`: a positive, negative or edge example used to test a style or production rule.
- `reference`: temporary fallback only when a more precise role cannot yet be selected; keep the observation draft.

## Authority rules

Identity outranks appearance and style. Geography outranks composition. Declared measured evidence outranks visual inference. A role outside the selected region or time range has zero authority. When one asset supports two roles, create two observations with separate selectors and transfer rules.
