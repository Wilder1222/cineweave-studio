# Image execution adapter contract

The CineWeave Director core produces a provider-neutral `RenderPlan`. An optional adapter may later translate that plan into a host-native image tool or a user-approved external CLI. The adapter is not the creative engine.

## State machine

```text
planned -> preflight_ready -> human_approved -> executing -> media_verified -> draft_import
             \-> blocked       \-> rejected       \-> failed
```

The core may produce `planned` and describe `preflight_ready` requirements. Only an explicit user action can move a plan to `human_approved` or execute it.

## Adapter responsibilities

- map `generate`, `edit`, `inpaint` and `multi_reference` to the adapter's capabilities;
- translate `draft`, `explore` and `final` into adapter-specific quality/size settings;
- resolve Observation IDs through the host, never by guessing file paths;
- verify reference and mask availability before execution;
- return output media metadata and content hashes without leaking secrets;
- surface errors with stable codes and preserve the parent RenderPlan.

## Core prohibitions

The core Skill must not:

- read `.env`, `~/.env` or API keys;
- call a Provider automatically;
- write files as a side effect of planning;
- put model names, endpoint URLs or vendor flags into DirectingSpec;
- claim a generation, edit or inpaint succeeded without verified media.

An adapter can be distributed separately and must declare its own installation, permissions, cost and capability receipt.
