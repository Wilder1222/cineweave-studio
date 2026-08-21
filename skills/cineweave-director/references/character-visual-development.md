# Character visual development ladder

Use this module when a request starts from one or more reference images and moves through a reusable character workflow: reference review, hero portrait, full-body anchor, turnaround, expression sheet and finally shot or storyboard use.

This is an orchestration plan, not a single mega-prompt. Each stage answers a different visual question, has an owning Skill, and must pass a human gate before its evidence is promoted to the next stage.

## Ownership and authority

Keep the payloads separate:

- `$cineweave-director` owns reference decomposition, observation-ready Prompt blocks, camera, lighting, framing, style translation and shot use.
- `$cineweave-character` owns `CharacterSpec`, `CharacterReferencePlan`, `CharacterAppearanceState`, `CharacterBinding` and identity/performance review.
- `$cineweave-production` owns the AssetRecipe, control channels, evidence bundle, rights profile, capability match and deterministic assembly.

A visually striking reference can be a strong costume or palette sample while remaining a weak identity sample. Never promote `style_and_costume` evidence to `identity` merely because the face looks attractive or coherent in one image.

## Stage ladder

| Stage | Visual question | Primary owner | Output / gate |
|---|---|---|---|
| 0. Reference gate | What is actually visible, and what role may it serve? | Director | `ReferenceReview`; rights and role scope resolved |
| 1. Identity lock | Who is this person without hairstyle, costume or mood styling? | Character | `CharacterSpec` + neutral reference plan; human identity approval |
| 2. Appearance lock | Which approved hair, makeup, costume, materials and accessories are worn? | Character | `CharacterAppearanceState`; identity must remain unchanged |
| 3. Hero portrait | Does the intended face, styling and photographic language read in one compelling frame? | Director | `PromptRecord` / `ImagePrompt`; portrait review, not automatic identity proof |
| 4. Full-body anchor | Do silhouette, proportions, feet, garment weight and contact read at full scale? | Director + Character | full-body `ImagePrompt` and Character review |
| 5. Turnaround | Are front, side and back construction, proportions and dominant side coherent? | Character + Production | `recipe.character-turnaround-3view`; human lock |
| 6. Expression sheet | Can the same identity express controlled states without face drift? | Character + Production | `recipe.character-expression-sheet-3x3`; human lock |
| 7. Shot use | Can the approved character perform inside a scene and camera plan? | Director | exact `CharacterBinding` + `ImagePrompt` / `Storyboard` |

If a request jumps directly to Stage 3 or later, state which earlier evidence is missing. A hero portrait may be produced as exploration, but it cannot silently substitute for neutral identity, body or rights evidence.

## Stage 0 — reference gate

Run `reference_review` before translating a supplied image into a reusable character. Decompose visible evidence into the nine blocks used by the [ReferenceReview schema](../../../packages/cineweave-contracts/schemas/reference-review.schema.json):

`identity`, `appearance`, `performance`, `composition`, `capture`, `lighting`, `materials`, `paletteGrade`, `environment`.

For every block record:

- `status`: visible, inferred, unknown or not applicable;
- `confidence`: high, medium or low;
- concrete evidence rather than adjectives;
- `transfer`: preserve, borrow, exclude or do-not-use.

Also classify the reference with `referenceType` and explicit authority levels for `identity`, `appearance`, `performance`, `capture`, `style` and `environment`. Authority is role-specific: a reference can be high-authority for costume and palette while low-authority for identity or camera.

Use this authority map as a default:

| Reference evidence | May control | Must not silently control |
|---|---|---|
| Face geometry, body proportions, stable asymmetry | Character identity, after review | costume, camera or likeness rights |
| Hair, makeup, costume, accessory placement | AppearanceState | face geometry or body proportions |
| Gesture, gaze, hand placement, expression | Performance candidate | permanent identity anchors |
| Crop, angle, camera distance, focus | Director composition/capture hypothesis | scene geography |
| Light direction, shadow softness, material response | Director lighting/style | identity |
| Palette, grade, grain, halation | Director palette/grade hypothesis | factual film-stock or lens claims |
| Architecture or location | Scene reference candidate | character appearance |

When a property is inferred rather than visible, label it as a hypothesis. For example, “85mm portrait lens” or “35mm film grain” can be a useful photographic hypothesis, but a still image alone does not prove the lens, stock or capture process.

## Stage 1 — identity lock

Route reusable identity to `$cineweave-character` `character_design` and `character_reference_plan`.

Require at least three structural identity anchors that survive styling changes. Good anchors include face geometry, eye shape and spacing, nose/jaw structure, body rhythm, dominant side, a restrained asymmetry or a stable small mark. “Beautiful face”, hair color, costume, jewelry and mood are not sufficient anchors.

The identity plan should acquire evidence in this order:

1. neutral front, three-quarter and profile face views;
2. neutral full-body front, side and back proportions;
3. controlled expression intensity;
4. signature motion and behavior;
5. approved appearance states.

Do not make the first hero portrait the identity master. The identity question is whether the face and body remain recognizable when the reference hairstyle, costume, lighting and expression are removed.

## Stage 2 — appearance lock

Route the approved look to `appearance_state`. Describe the look as a structured state, not a decorative paragraph:

- hair construction, parting, anchor accessories and stable left/right placement;
- makeup placement, palette, edge softness and intensity;
- costume silhouette, layers, closure, fit, construction and movement response;
- material roughness, sheen, translucency, thickness, wear and light response;
- accessory hierarchy, density, contact points and forbidden random additions.

Keep `CharacterSpec` and `CharacterAppearanceState` bound separately. A high-style reference may transfer its ice-blue/pearl/warm-gold palette, silk/organza/filigree material family or phoenix motif without transferring its face.

For dense fantasy adornment, provide two explicit appearance profiles when relevant:

- `hero_image`: high ornament density and fine detail for a key art or poster;
- `video_safe`: fewer, larger and more stable ornaments, fixed left/right anchors, one main crown, limited hanging chains and one or two primary ribbons.

`video_safe` is a stability-oriented redesign, not a request to merely delete adjectives from the hero Prompt.

## Stage 3 — hero portrait calibration

Use `image_prompt` or `prompt_management` to test one visual target at a time. Begin with how the camera observes the moment:

1. canvas, orientation and crop;
2. observer position, shot scale, camera height, angle, distance and focus target;
3. subject state, gaze, gesture, breath and emotional restraint;
4. exact CharacterBinding and AppearanceState anchors;
5. motivated light and shadow behavior;
6. skin, hair, textile and jewelry material evidence;
7. palette/grade and only then restrained style hypotheses;
8. targeted negatives derived from known failure modes.

For a realistic portrait, describe physical evidence such as pores, peach fuzz, small tonal variation, natural asymmetry, irregular textile folds and non-uniform specular response. Avoid relying on `perfect`, `flawless`, `porcelain`, `doll-like`, `8K`, `cinematic` or `high-end` as substitutes for observation.

The hero portrait is approved for a declared role: identity candidate, appearance candidate, capture-style candidate or key art. Do not let one approval silently grant all four authorities.

## Stage 4 — full-body anchor

Compile a separate full-body frame after the face and appearance direction are stable. Check:

- head-to-body ratio, shoulder/hip rhythm and center of gravity;
- garment length, layer order, hem, sleeve volume and material weight;
- feet, ground contact, cast shadow and usable negative space;
- accessory scale and interaction with hands, hair and costume;
- silhouette readability at thumbnail size.

A close portrait cannot prove body proportions or the back of a costume. If the full-body frame changes the face, dominant side or appearance state, route the failure back to Character review instead of patching it with a new style Prompt.

## Stage 5 — turnaround

Use the built-in [`recipe.character-turnaround-3view`](../../../packages/cineweave-contracts/recipes/character-turnaround-3view.json) through `$cineweave-production`.

The run must bind one exact `CharacterSpec`, optional approved `AppearanceState`, `ControlChannelSet` and `EvidenceBundle`. Lock camera, background, lighting, head-to-body ratio, stance and appearance. Generate front, side and back as independent tasks with one view delta, then assemble deterministically with labels outside the image tiles.

Acceptance focuses on identity/body proportions, garment construction, left/right orientation, back details and stable material behavior. Never ask an image model to draw a labeled three-view board in one pass, and never treat a mislabeled or visually blended panel as three independent proofs.

## Stage 6 — expression sheet

Use the built-in [`recipe.character-expression-sheet-3x3`](../../../packages/cineweave-contracts/recipes/character-expression-sheet-3x3.json) through `$cineweave-production`.

Lock identity, appearance, camera, crop, background and light. Each of the nine tiles changes one `performanceState`; translate labels such as “清冷、害羞、疑惑” into observable cues in eyes, brows, mouth, jaw, head angle, hands and breath. Keep intensity bounded so the face is not redesigned by the emotion.

Generate independent tiles, retry failed tiles only, preserve accepted tiles and add labels during deterministic assembly. If the requested labels are “微笑、平静、害羞、生气、疑惑、开心、难过、惊讶、傲娇”, map them to explicit performance states before instantiating the recipe; do not assume the model will infer a consistent nine-state taxonomy from adjectives alone.

## Stage 7 — shot use and combined boards

Only after human approval of identity, appearance and the relevant sheet evidence should Director bind the exact CharacterSpec/AppearanceState into a shot. A shot Prompt may borrow a hero portrait's capture/style evidence while preserving the approved identity and appearance bindings.

When the user asks for “三视图 + 九宫格表情” in one deliverable, return two named recipe runs and a deterministic board assembly plan:

```text
turnaroundRun   = recipe.character-turnaround-3view
expressionRun   = recipe.character-expression-sheet-3x3
boardAssembly   = fixed canvas, reserved regions, external labels, provenance per tile
```

This is one user-facing package, not one multi-panel generation task. The assembly must preserve per-tile resolution, list failed task IDs and keep successful task outputs immutable.

## Gates and stop conditions

- Missing rights/likeness status: stop before reference promotion or execution planning.
- Missing CharacterSpec for a reusable identity request: route to Character; do not invent a face hash.
- Appearance changes identity anchors: reject the AppearanceState and review the owning CharacterSpec.
- Hero portrait is the only evidence: allow exploration, but block identity lock and video continuity claims.
- Turnaround or expression tile drifts: retry only the failed task or issue one-variable repair; do not regenerate the accepted set.
- A combined board would require an image model to render labels/layout: split into recipes and deterministic assembly.
- A shot lacks exact CharacterBinding or camera/scene inputs: return a named handoff or blocked RenderPlan, not a fabricated final image.

## Handoff minimum

A staged plan is complete only when it names:

- the reference-review decision and role-scoped preserve/borrow/exclude rules;
- the exact CharacterSpec and AppearanceState versions once available;
- the human gate after identity, appearance and sheet review;
- the relevant recipe IDs and independent task/assembly policy;
- the next owner for each unresolved subproblem;
- rights, capability and evidence blockers;
- the final shot Prompt or Storyboard route, if requested.
