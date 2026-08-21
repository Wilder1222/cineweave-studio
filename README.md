<p align="center">
  <img src="assets/cineweave-studio-logo.png" alt="CineWeave Studio logo" width="160">
</p>

<h1 align="center">CineWeave Studio</h1>

<p align="center">
  A composable Codex plugin for turning creative intent into controllable character, scene, style, direction and production workflows.
</p>

<p align="center">
  <a href="https://github.com/Wilder1222/cineweave-studio"><img alt="GitHub repository" src="https://img.shields.io/badge/GitHub-CineWeave%20Studio-111827?style=flat-square&logo=github&logoColor=white"></a>
  <img alt="Codex plugin" src="https://img.shields.io/badge/Codex-Plugin-1D6FFF?style=flat-square">
  <img alt="Version 2.0.1" src="https://img.shields.io/badge/version-2.0.1-14B8A6?style=flat-square">
</p>

<p align="center">
  <a href="#install-in-codex">Install</a> ·
  <a href="#choose-a-skill">Skills</a> ·
  <a href="#from-an-idea-to-a-producible-shot">Workflow</a> ·
  <a href="docs/architecture.md">Architecture</a> ·
  <a href="packages/cineweave-contracts/README.md">Contracts</a>
</p>

---

## The short version

CineWeave Studio helps you describe a picture as a director would observe it:
what the camera sees, how the subject behaves, where the light comes from, what
the material does, and why the shot exists. It converts that intent into
versioned, editable creative artifacts instead of one oversized prompt.

Use the optional `$cineweave` router when the request spans multiple domains.
Use any specialist directly when the work is already bounded. No specialist has
a hidden dependency on the router.

| Start with… | Get… |
| --- | --- |
| “I only know how she should feel.” | Comparable character directions, a preference loop and an approved identity plan. |
| “Make this look like a poetic Song-inspired drama.” | A reusable style package with visual, cultural and temporal rules. |
| “I need a shot with genuine cinematic presence.” | A prompt built from camera observation, blocking, light, composition and material response. |
| “I need the image and video to stay controllable.” | Explicit controls, evidence, rights checks and production-ready recipes. |

## Install in Codex

Add the marketplace, then install the plugin:

```bash
codex plugin marketplace add Wilder1222/cineweave-studio --ref main
codex plugin add cineweave-studio@cineweave-studio
```

Start a new Codex task after installation so the new Skills are available.

## Start creating

You can begin with a plain-language request—no form required.

```text
Use $cineweave to turn this into an editable creative brief:
I want an adult Song-inspired heroine who feels cool but quietly kind.
Explore identity before wardrobe, give me comparable options, and do not lock her face until I approve neutral evidence.
```

Or go straight to a specialist:

```text
Use $cineweave-director to write a Chinese image prompt for an adult woman
turning toward camera in a rain-washed courtyard. Describe the observed shot,
the light, framing, physical action and material response. Avoid generic
quality-word stacks.
```

## Choose a skill

| Skill | Use it directly for | Produces |
| --- | --- | --- |
| `$cineweave` | Turning an open-ended request into the smallest viable workflow | `CreativeBrief`, `WorkflowPlan` |
| `$cineweave-character` | Zero-prompt discovery, character identity, appearance and performance | Exploration, `CharacterSpec`, reference and performance plans |
| `$cineweave-scene` | Locations, spatial continuity and physically plausible interaction | Scene specs, states, bindings and review plans |
| `$cineweave-style` | Reusable visual and temporal style systems from deliberate references | `StylePackage`, reference policy, compiled style instructions |
| `$cineweave-director` | Image prompts, camera language, shot design and storyboards | Prompt records, shots, storyboards and render plans |
| `$cineweave-production` | Evidence-backed controls, capabilities, rights and evaluation | Recipes, control channels, evidence bundles and benchmarks |

Each Skill accepts a direct brief and can consume exact outputs from other
Skills. This keeps exploration fast while making larger productions traceable.

## From an idea to a producible shot

```text
creative intent or references
            │
            ▼
  optional $cineweave intake
            │
            ▼
CreativeBrief + WorkflowPlan
      ┌─────┼───────────┐
      ▼     ▼           ▼
 character style       scene
      └─────┬───────────┘
            ▼
        director
            ▼
       production
            ▼
human-approved image or video execution
```

The workflow uses a few deliberate rules:

- Identity, appearance, performance and camera treatment are separate—changing a costume should not create a different person.
- A visual reference declares what it is allowed to influence, such as palette or textile response, rather than silently copying identity or composition.
- Static imagery does not pretend to define camera movement, performance rhythm or temporal style.
- The system asks for more information only when it is high-impact and cannot safely be inferred.
- Generated media is always human-gated; CineWeave designs the specification and never fabricates capability, rights or evidence claims.

## Practical entry points

### Create a character without knowing prompt terminology

```text
Use $cineweave-character. I do not know the right facial-feature terms.
Give me four comparable visual directions for an adult historical-fantasy woman:
calm 70%, warm 30%, natural cinematic realism and restrained styling.
Keep lighting, pose and wardrobe constant so I can choose the face direction.
```

### Turn references into a safe style system

```text
Use $cineweave-style to analyze these references.
Keep only their low-saturation jade-and-earth palette, soft window light and
aged-silk material response. Ignore the depicted person's identity, pose,
costume and exact composition. Return a reusable StylePackage.
```

### Direct a cinematic image prompt

```text
Use $cineweave-director to create a Chinese text-to-image prompt.
An adult actor pauses at a courtyard doorway after rain. Start from camera
distance and framing, then blocking, motivated light, surface detail and gaze.
Keep the mood restrained and real; avoid "cinematic", "premium" or "8K" as
substitutes for direction.
```

### Plan a small multi-shot production

```text
Use $cineweave to plan a character, Song-inspired style system, courtyard
scene and four-shot sequence. Return an editable CreativeBrief and a
WorkflowPlan that names only the contracts we need.
```

## What makes the system dependable

`packages/cineweave-contracts` is the canonical source for 39 versioned
contracts. The release gate validates schemas and examples, route ownership,
activation and composition cases, semantic rules, controls, local Skill links,
portable standalone bundles, migration safety and privacy checks.

```bash
node scripts/run-release-checks.mjs
```

The V2 release also includes a non-destructive V1.1 migration path. See
[migration notes](docs/migration/v1.1-to-v2.md) and the
[full architecture](docs/architecture.md).

## Repository map

```text
skills/                         independently invocable Codex Skills
packages/cineweave-contracts/   canonical schemas, examples and recipes
tests/                          activation, workflow and evaluation fixtures
scripts/                        release validation, bundling and migration
docs/                           architecture, roadmap and migration guides
```

## License

MIT. See the plugin metadata for the current package declaration.

---

Built by [Wilder1222](https://github.com/Wilder1222). The plugin package and
repository are named `cineweave-studio`; specialist Skill identifiers such as
`$cineweave-director` remain stable for compatibility.
