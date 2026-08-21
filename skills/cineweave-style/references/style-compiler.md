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

## Named creator or work aliases

Translate names into an original descriptive profile: medium, line/shape language, palette, blocking, reveal strategy, performance, motion, editing and atmosphere. Keep any supplied source reference as a role-scoped evidence item with rights status. Never put a creator name alone into the provider-neutral compiled directives.
