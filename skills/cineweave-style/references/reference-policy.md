# Style reference policy

Use this reference to decide when reference images, videos, palettes or motion curves are needed.

## Two lifetimes

Separate:

```text
design-time evidence  → analyzes and validates a StylePackage
runtime conditions    → helps a specific image/video task execute the package
```

A package may be analyzed from many references and run with zero, one or a few selected anchors once its semantics and compiler are reliable.

## Reference modes

- `none`: use only semantic StylePackage and model-neutral compiler rules;
- `design_time_only`: references are required for package creation/validation but not every run;
- `optional_runtime`: attach a small role-scoped set when the adapter or task benefits;
- `required_runtime`: every run needs declared visual or temporal references;
- `adaptive`: decide from style specificity, novelty, consistency requirement, task stage, adapter confidence and prior drift.

Default to `adaptive`.

## Reference role rules

Each reference declares one role, one scope, extraction list and ignore list.

| Role | Extract | Do not silently copy |
|---|---|---|
| character_visual | representation, face rendering, anatomy abstraction | identity or likeness |
| costume | silhouette, construction, material, accessory logic | source person's face |
| environment | architecture, spatial material, atmosphere | subject identity or layout if not requested |
| lighting | source direction, softness, falloff, color relation | costume or geography |
| composition | crop, depth, negative space, scale relationship | subject identity |
| palette | hue, saturation, contrast, highlight/shadow relation | exact subject or layout |
| linework | line width, roughness, closure, density | depicted content |
| camera_motion | path, acceleration, framing change | actor or location |
| performance | timing, gesture, gaze, weight shift | identity or costume |
| temporal_atmosphere | fog, particles, cloth/hair, light evolution | unrelated scene facts |
| validation_boundary | allowed variation and failure boundary | production content |

Image references do not prove camera lens or video motion. Video references should be separated into camera, performance, editing, dynamic light and secondary-physics roles when those distinctions matter.

## Adaptive decision heuristic

Increase runtime reference need when:

- the style is project-specific or visually novel;
- identity/appearance continuity is hard;
- culture or historical treatment is important;
- the task asks for a signature camera move, temporal transition or dynamic material;
- prior candidates show style drift;
- the adapter has weak support for the requested style.

Decrease runtime reference need when:

- the style is a broad, well-supported medium such as generic monochrome comic;
- a validated StylePackage and adapter binding already cover the target;
- the reference would introduce content leakage;
- the task is neutral identity exploration where style should stay low.

## Reference set composition

Prefer cross-content evidence: different subjects, compositions, spaces and palettes that share the intended style. Add positive, boundary and negative examples for a project style. Do not average conflicting references without assigning each one a scope.

## Rights and likeness

Reference visibility is not permission. Record source class, rights status, likeness consent and redistribution/publication status. An unresolved source blocks promotion to an active reusable package or a commercial runtime plan.
