# CineWeave v1 character–scene architecture

This file was the v0.6 roadmap. In v1.0 the planned split is implemented.

## Implemented topology

```text
CineWeave World
  ├─ CharacterSpec / AppearanceState / Observations
  │       ↓ cineweave-character
  │  CharacterBinding / Review / Repair
  ├─ SceneSpec / SceneState / Observations
  │       ↓ cineweave-scene
  │  SceneBinding / Review / Repair
  └─ Prompt assets / Canon facts
          ↓
     cineweave-director
          ↓
  Proposal / Storyboard / ImagePrompt / ReferenceSet / RenderPlan
```

## v1 invariants

- Character identity and Scene geography are versioned World assets, not prompt fragments.
- Every dependent artifact uses exact ID, version and content hash.
- Character appearance and Scene state are controlled child assets, not silent mutations.
- Director consumes bindings and owns dramatic intent, blocking, camera and sequence logic.
- Reference plans are Provider-neutral and require human selection.
- Reviews cite Candidate Observation evidence.
- Repairs change one variable and preserve the parent.
- Web stores facts, hashes, media and decisions; Skills reason; adapters execute only approved plans.

## Compatibility

- v0.5 Prompt, proposal, storyboard, ReferenceSet, RenderPlan and media contracts remain readable.
- v0.6 CharacterSpec and CharacterBinding remain valid because v1 additions are optional on those contracts.
- `contractVersion: "1.0.0"` is emitted by new v1 payloads.
- locked assets are never overwritten during migration; a new version must be created.

## Post-1.0 roadmap

Future work should remain additive and evidence-driven:

1. video motion handoff with temporal pose, contact and gaze constraints;
2. character–character relationship blocking contracts;
3. scene graph visualization and automatic axis diagnostics in CineWeave Web;
4. provider adapters tested against the same provider-neutral acceptance criteria;
5. evaluation datasets built from reviewed Candidate evidence rather than synthetic scores;
6. optional voice and dialogue-performance assets kept separate from visual identity.
