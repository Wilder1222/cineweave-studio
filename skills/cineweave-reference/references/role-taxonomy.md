# Reference role taxonomy

Choose the role by the evidence being transferred, not by the subject category in the source image. A portrait can supply lighting; an architecture photo can supply palette; neither should silently transfer all visible content.

## Identity and character

- `face_identity`: stable facial structure, age impression and identity marks. Prefer neutral, unobstructed, low-distortion face evidence.
- `body_identity`: stable body proportions, silhouette and posture baseline. Do not derive it from a close portrait.
- `identity`: legacy combined identity evidence; prefer separate face and body observations.
- `face_morphology`, `body_morphology`: semantic shape relations used to propose a CharacterMorphologySpec. Prefer relations and observable labels over biometric measurements; reference evidence never auto-locks identity.
- `skin_surface`: stable, makeup-free visible complexion baseline, regional variation, marks and age-appropriate microtexture for CharacterSpec. Exclude temporary condition, retouch, lighting treatment, medical condition, ethnicity and hidden physiology.
- `eye_surface`: visible iris, sclera, tear-line and moisture behavior when it needs independent surface evidence; it does not own eye geometry.
- `skin_material`: the current visible skin state after makeup, grooming, weather or temporary condition, expressed relative to the approved baseline. Use this broader role as draft evidence when baseline and state cannot be cleanly separated; do not promote contaminated pixels into stable identity facts.
- `hair_material`: visible strand grouping, roughness, sheen, translucency and movement response. Hair geometry or styling still uses `hair`.
- `appearance`, `makeup`, `hair`, `costume`, `prop`: changeable design state. Exclude source identity unless separately authorized.
- `expression`, `pose`, `performance`: a visible state or performance mechanism. A still proves a pose or frozen expression, not its timing.
- `motion`: subject trajectory or secondary motion from a clip. Use a temporal selector.

## Image construction

- `composition`: framing, spatial hierarchy, negative space and depth layering.
- `capture`: static viewpoint, crop, perspective compression, focus placement and observable depth-of-field cues. A real focal length, aperture, sensor, filter or camera body remains inferred unless trusted metadata or a declaration proves it.
- `lighting`: visible direction, softness, ratios and motivated source effects. Mark physical source or lens conclusions as inferred unless declared.
- `palette`: color relationships and value distribution.
- `material`: visible non-human surface response, texture scale, wear and translucency. Use `skin_surface`/`skin_material`, `eye_surface` or `hair_material` for character surfaces so generic style authority cannot silently own them.
- `style`: medium and representation grammar. Explicitly ignore source identity, costume, pose and scene content unless separately observed.
- `representation_geometry`, `shape_language`: abstraction and large-form design evidence without authority over source identity.
- `linework`, `surface_style`, `shading`, `color_system`, `depth_language`, `effects`: one visual-grammar dimension per Observation so unrelated content cannot leak through a generic style role.
- `panel_layout`, `typography`: page organization and text treatment; typography evidence never authorizes copying source text.
- `motion_style`: temporal representation from video or declared motion evidence only. A still image cannot support this role.

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

Identity and hard morphology locks outrank skin material, appearance and style. Stable CharacterSpec `skin_surface` facts outrank changeable `skin_material` appearance state; neither may be overwritten by `surface_style` or another style treatment. RepresentationBinding translates approved anchors but cannot rewrite them. Geography outranks composition. Declared measured evidence outranks visual inference. A role outside the selected region or time range has zero authority. When one asset supports two roles, create two observations with separate selectors and transfer rules.
