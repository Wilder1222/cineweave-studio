# Style compiler

Compile a StylePackage into semantic directives for a declared target. The compiler changes representation, not the underlying CharacterSpec, SceneSpec, CharacterBinding or SceneBinding.

## Compilation order

1. resolve exact StylePackage, recipe and atom versions;
2. resolve target medium and representation;
3. compile culture, costume and production-design atoms into scoped visual rules;
4. compile character rendering without rewriting identity anchors;
5. compile composition, cinematography and lighting only when Director has supplied the shot decision;
6. compile performance and motion as observable representation rules;
7. compile temporal behavior separately for video;
8. attach only role-scoped runtime references permitted by policy;
9. emit invariants, allowed variation and forbidden traits;
10. record unresolved conflicts instead of silently choosing a winner.

## Image vs video

Image compilation can emit medium, line, shape, palette, light, material, composition and frozen performance directives. Video compilation must additionally emit:

- movement rhythm and acceleration;
- camera path or declared camera behavior;
- expression timing and residual tension;
- cloth, hair, particles and dynamic-light response;
- shot duration, transition and edit constraints when supplied.

A still style reference cannot fill a missing temporal rule. Route that gap to a temporal reference plan or ask for a structured motion decision.

## Style stack precedence

```text
locked identity / geography / interaction
  > approved appearance and shot bindings
  > medium and representation
  > cultural and costume atoms
  > composition / cinematography / lighting
  > palette / postprocess
  > advisory surface style
```

If a style atom conflicts with an exact Character or Scene fact, preserve the fact and return a conflict. Do not make a character younger, change body proportions, move a landmark or reverse a dominant side to satisfy a visual atom.

## Realism profile

`StyleCompile.realismProfile` records how approved facts should be represented, not what those facts are. Use normalized 0–1 creative-intent values for:

- representational realism and anatomy fidelity;
- shot-scale surface microdetail readability and material differentiation;
- natural asymmetry retention and optical imperfection;
- idealization and beauty-retouch treatment.

The calibration must remain provider-neutral, protect identity and physical material state, and state that the profile is not a quality score or output promise. CharacterSpec owns stable face/body/surface identity. CharacterAppearanceState owns makeup and visible skin condition. The realism profile may make approved microtexture more or less readable; it cannot invent pores, erase protected marks, lighten a baseline complexion, change anatomy or convert retouch intensity into a character fact.

When an exact RepresentationBinding exists, it defines how semantic identity anchors survive the selected representation and abstraction budget. `realismProfile` is a target-level treatment inside that approved mapping; it cannot bypass, weaken or replace the binding. “Anatomy fidelity” therefore means fidelity to the approved represented anatomy, not a demand that every medium imitate photographic pixels.

Compile only details visible at the target scale. A close-up may retain regional skin variation and fine flyaways; a wide shot should spend the detail budget on silhouette, material separation and environment integration.

## Named creator or work aliases

Translate names into an original descriptive profile: medium, line/shape language, palette, blocking, reveal strategy, performance, motion, editing and atmosphere. Keep any supplied source reference as a role-scoped evidence item with rights status. Never put a creator name alone into the provider-neutral compiled directives.
