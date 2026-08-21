# Workflow composition

`WorkflowPlan` is a visible dependency graph, not a hidden multi-agent chain.
Every step names its specialist Skill, route, required contracts, produced
contracts, optional dependencies and human gate.

## Standalone versus composed

- **Standalone** means a specialist can start from a direct natural-language brief and optional references, then produce its own contract.
- **Composed** means a specialist consumes exact approved outputs from other specialists. It still remains directly invocable and must not rely on the router being present.

## Default patterns

```text
one-off prompt
  → cineweave-prompt

one-off shot direction
  → cineweave-director

reference suitability or reusable reference binding
  → cineweave-reference

story or script scene
  → cineweave-story

reusable character
  → cineweave-character

zero-prompt reusable character
  → cineweave-character explore → prompt comparable candidates → production candidate board → character converge

character keyframe from supplied media with a defined visual system
  → reference → character + style → director → prompt

story scene with physical interaction
  → story + character + scene + style → director → prompt → production
```

Do not include Production for a low-risk exploration unless the user asks for a
repeatable asset pack, rights/capability validation or deterministic assembly.
Never create a cycle such as Director requiring Production while Production
requires an unfinished Director output. Split the work into an approval-gated
next phase instead.
