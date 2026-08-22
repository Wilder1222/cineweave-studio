# CineWeave ControlBench

ControlBench validates the whole control system, not selected attractive images.

Required suites:

- CharacterBench: identity across views, expressions, appearance and action;
- MorphologyBench: semantic axes, structural relations, front/three-quarter/profile consistency, asymmetry and lock preservation;
- AppearanceBench: makeup, hair, costume construction, material and pairing;
- SceneBench: geography, time, weather, light and material state;
- InteractionBench: contact, support, occlusion, grip, shadow and environment response;
- StoryboardBench: behavior cause, emotion trajectory, screen direction, axis, eyeline and prop continuity;
- RightsBench: evidence, adapter and dependency permission gates;
- HumanRealismBench: anatomy, regional skin/surface variation, eyes, lips, hair, optics, motivated light, contact, retouch artifacts and temporal continuity;
- AnimeBench: identity mapping, geometry abstraction, shape grouping, line hierarchy, cel shading, palette and temporal grammar;
- MangaBench: ink hierarchy, black mass, screentone, silhouette, panel readability, effects and exact typography;
- IllustrationBench, Stylized3DBench and HybridBench: representation-family-specific mark, volume, surface and scope coherence;
- CrossRepresentationBench: semantic facial relations, marks, silhouette, motion fingerprint and costume cues across approved bindings;

Combine rule checks, embeddings where appropriate, pose/layout metrics, VLM assistance and human review. Do not use same-medium face similarity as the sole cross-representation test. Blocking dimensions require a perfect pass. Automated metrics filter and diagnose; they do not replace human identity, interaction, style or story judgment. Report pass/warn/fail findings with owner and repair target, never one beauty or style-quality score.

If a suite declares `MorphologyBench`, `HumanRealismBench`, `AnimeBench`,
`MangaBench` or `CrossRepresentationBench`, it must include at least one case
for that exact family scope. A family name without a recipe-bound case is not
coverage.

Repair from a finding, not a mood. Preserve passing dimensions, identify the
smallest owner and change one variable. Examples: hair-mass drift routes to the
RepresentationBinding or anime StyleCompile; broken black-mass hierarchy routes
to manga shading grammar; a lost canonical mark routes to the binding rather
than “make the whole image more stylized.”
