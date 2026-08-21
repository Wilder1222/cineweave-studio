# CineWeave Studio v2

CineWeave Studio is a composable Codex Skill system for image, video and
creative-production work. It turns a vague idea into explicit creative
contracts without forcing every task through a single giant prompt or a single
giant Skill.

The product entry point is `$cineweave`. It is optional: every specialist can
be invoked directly and can also consume exact outputs from other specialists.

## Product model

```text
direct brief ──> any specialist Skill ──> its own contract
       │
       └──> $cineweave ──> CreativeBrief + WorkflowPlan
                                 │
      ┌──────────────────────────┼──────────────────────────┐
      ▼                          ▼                          ▼
 Character                    Style                       Scene
      └───────────────┬──────────┴──────────┬───────────────┘
                      ▼                     ▼
                   Director             Production
                      │                     │
                      └──── explicit, human-gated outputs ───┘
```

| Skill | Direct use | Composed use | Owns |
|---|---|---|---|
| `$cineweave` | turn an idea into an editable brief | plan a cross-domain DAG | `CreativeBrief`, `WorkflowPlan` |
| `$cineweave-character` | explore or build a character from a feeling/brief | consume brief/style/production contracts | exploration, preference convergence, identity, appearance, performance |
| `$cineweave-scene` | build a location from a brief | consume character/style contracts | geography, states, interaction |
| `$cineweave-style` | build a StylePackage from references | preserve character/scene contracts | visual and temporal representation |
| `$cineweave-director` | direct a one-off prompt or shot | combine exact upstream bindings | prompts, shots, storyboards, render plans |
| `$cineweave-production` | create a recipe or validation plan | validate a composed deliverable | controls, evidence, rights, benchmarks |

`$cineweave` routes work; it never becomes a hidden dependency. A user may
start with `$cineweave-character` or `$cineweave-director` whenever the request
is already bounded.

## V2 architecture

```text
.
├── .codex-plugin/                 # CineWeave Studio plugin metadata
├── skills/                        # six independently invocable Skills
│   ├── cineweave/                 # optional intake and workflow router
│   ├── cineweave-character/
│   ├── cineweave-scene/
│   ├── cineweave-style/
│   ├── cineweave-director/
│   └── cineweave-production/
├── packages/
│   └── cineweave-contracts/       # canonical schemas, examples and recipes
├── tests/                         # activation, composition and evaluation fixtures
├── scripts/                       # validation, bundle and migration tools
└── docs/                          # product, architecture, roadmap and migration docs
```

Every Skill has:

- a concise `SKILL.md` with a narrow ownership boundary;
- `agents/openai.yaml` UI metadata and normal implicit discovery;
- `contracts.json` declaring its standalone inputs, composed inputs and portable
  contract set;
- local references loaded progressively for only the requested route.

`packages/cineweave-contracts` is the source of truth. The bundle builder copies
only a Skill's declared schemas and recipes into a temporary portable bundle,
proving that its instructions do not depend on `$cineweave` or a repository
relative schema path at runtime.

See [the architecture](docs/architecture.md) and the
[contract package](packages/cineweave-contracts/README.md).

## Example entry points

```text
Use $cineweave-character to create a reusable Song-inspired historical-drama
character. Start from an identity exploration brief, lock only approved face and
body anchors, then return a CharacterSpec and reference plan.
```

```text
Use $cineweave-character to help me create an original historical-fantasy
woman. I only know that she should feel cool but gentle. Start with comparable
character directions, keep the test fixture fixed, let me choose, and do not
lock an identity until neutral evidence is approved.
```

```text
Use $cineweave-style to convert these references into a reusable style package.
Use the references for palette, light and textile response; do not copy identity,
pose or composition.
```

```text
Use $cineweave-director to write a Chinese image prompt for an adult character
turning toward camera in a rain-washed courtyard. Describe what the camera sees,
the light, framing, physical action and material response rather than stacking
generic quality adjectives.
```

```text
Use $cineweave to plan a character, a Song-inspired visual system, a courtyard
scene and four story shots. Return an editable CreativeBrief and a WorkflowPlan
that names the smallest required specialist contracts.
```

## Contracts and safety boundaries

The [ownership manifest](packages/cineweave-contracts/contracts/manifest.json)
indexes 39 V2 contracts. Composition always uses exact artifact references;
specialists must not infer locked facts from hidden conversation state.

- Character identity is separate from appearance, style and camera treatment.
- Zero-prompt character discovery separates technical quality gates from a user's subjective preference; it never creates a universal beauty score or auto-locks identity.
- Scene geography is separate from lighting mood and shot composition.
- Static visual references do not establish temporal camera or performance style.
- A reference has one declared role, scope, preserve list and ignore list.
- Production controls, evidence, capabilities and rights do not generate media.
- Execution remains provider-neutral and requires human approval.

## Validation

Run the full V2 release gate:

```bash
node scripts/run-release-checks.mjs
```

It validates JSON, schema/example pairs, route ownership, V2 architecture,
activation and composition fixtures, semantic rules, ControlBench rules, local
Skill links, standalone Skill bundles, migration safety and privacy checks.

Build portable local bundles for inspection:

```bash
node scripts/build-skill-bundles.mjs --out .build/skills
```

## V1.1 to V2 migration

V2 is a product and packaging upgrade, not an implicit data overwrite. The
migration utility writes a new copy with `contractVersion: "2.0.0"` and never
invents missing creative facts.

```bash
node scripts/migrate-v1.1-to-v2.mjs input.json \
  --out migrated-v2.json \
  --report migration-report.json \
  --schema packages/cineweave-contracts/schemas/character-appearance-state.schema.json
```

See [V1.1 to V2 migration](docs/migration/v1.1-to-v2.md).

## Repository naming

The plugin package and repository are named `cineweave-studio`. Specialist Skill
identifiers such as `$cineweave-director` remain stable for compatibility.
