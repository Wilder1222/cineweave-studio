# Migration to v1.1

## Compatibility policy

| Source | v1.1 behavior |
|---|---|
| v0.5 proposal, PromptRecord, hypothesis, DraftBrief and media metadata | unchanged |
| v0.5/v0.6 ImagePrompt without CharacterBinding or SceneBinding | valid |
| v0.6 CharacterSpec and CharacterBinding | valid where the v1 schema already allowed them |
| v1.0 Character/Scene/Director payloads | valid; structured production fields remain optional |
| v1.1 payload | emits `contractVersion: "1.1.0"` and may reference production and interaction contracts |

The suite reads `0.5.x`, `0.6.x`, `1.0.x` and `1.1.0`, and writes new v1.1 contracts. Old bindings remain valid. Locked assets are never overwritten.

## What v1.1 adds

v1.1 introduces:

- structured makeup, hair, costume, material and pairing fields;
- behavior causality, emotion control, micro-expression and environment response;
- richer time, background and lighting state;
- character–environment InteractionConstraintSet;
- AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile, LicenseProfile and ControlBenchmark;
- production refs in ImagePrompt, Storyboard, ReferenceSet and RenderPlan.

These additions are not inferred during migration. They require explicit creator or Skill decisions and, where relevant, human review.

## Non-destructive migration

The v1.0-to-v1.1 utility:

- reads the source without modifying it;
- writes a separate copy;
- sets `contractVersion: "1.1.0"` on the copy;
- preserves facts, IDs, versions, receipts, rights, Observation IDs and provenance;
- optionally validates the copy against a target schema;
- writes a migration report containing source/output hashes, warnings and blocking issues.

It does not:

- invent structured makeup, hair, costume or material data from legacy prose;
- invent CharacterBinding, SceneBinding or InteractionConstraintSet;
- create AssetRecipe, ControlChannelSet, EvidenceBundle, CapabilityProfile or LicenseProfile refs;
- infer commercial rights or identity consent;
- fabricate content hashes or Observation IDs;
- increment or overwrite a locked asset automatically.

## Command

```bash
node scripts/migrate-v1-to-v1.1.mjs input.json \
  --out migrated-copy.json \
  --report migration-report.json \
  --schema schemas/character-appearance-state.schema.json
```

Validate the report:

```bash
node scripts/validate-output.mjs \
  schemas/migration-report.schema.json \
  migration-report.json
```

## Recommended migration sequence

1. Preserve the v1.0 source and its content hash.
2. Run the non-destructive migration to create a v1.1 copy.
3. Review warnings; a schema-valid copy can still lack production readiness.
4. For CharacterAppearanceState, create a human-reviewed new version before adding structured styling.
5. Create InteractionConstraintSet only from supplied scene targets, body relations and evidence.
6. Instantiate an AssetRecipe appropriate to the desired artifact.
7. Create ControlChannelSet, EvidenceBundle, CapabilityProfile and LicenseProfiles.
8. Prepare a new RenderPlan and keep its approval status `planned` until capability and rights gates pass.
9. Import the new version in CineWeave Web; never replace the locked source record.

## Existing v0.6-to-v1 utility

The earlier migration remains available:

```bash
node scripts/migrate-v0.6-to-v1.mjs input.json \
  --out v1-copy.json \
  --report v1-report.json \
  --schema schemas/character-spec.schema.json
```

For a v0.6 record, migrate to the compatible v1 structure first, then use the v1.0-to-v1.1 utility. Review both reports and do not treat migration as evidence that new production fields were resolved.
