# Prompt lifecycle

Treat a reusable prompt as an immutable, reviewable creative asset rather than
an overwriteable text field.

## Operations

- `create`: start a new `PromptRecord` from one bounded visual intent.
- `import`: preserve the supplied source text, then add normalized semantic
  blocks without rewriting the original evidence.
- `update`: create a new version, retain the parent reference and name the
  smallest changed variable.
- `fork`: create a new prompt identity when purpose, audience or primary target
  changes materially.
- `compare`: derive bounded variants from one parent; each variant changes one
  declared hypothesis.
- `archive`: retire a version without deleting its provenance or descendants.
- `repair`: create a new version that changes one failing owner path and
  preserves every passing dimension.

Never overwrite an approved parent version. A title or filename is not asset
identity; use the prompt ID, version and content hash supplied by the runtime.

## Source and normalization

An imported prompt keeps its exact `sourceText`. Normalized blocks are an
inspectable interpretation, not a claim that the source was objectively
improved. Record contradictions, unresolved variables and assumptions rather
than silently resolving them.

Use variables only for deliberate reusable slots. Bind each variable to one
semantic path, define its allowed values or range and prevent a variable from
changing locked upstream facts.

## Version decision

Create a child version when the primary target and intended use remain the same
and the change is bounded. Fork when the target, audience, domain, rights basis
or governing upstream bindings change enough that comparison to the parent is
misleading.

Every version should state:

- why it exists;
- exact parent or fork provenance;
- changed and preserved paths;
- reference bindings and rights status;
- acceptance checks;
- observed evaluation evidence, when actual generated media has been reviewed.

A prompt version is not successful merely because it validates or reads well.
Quality evidence requires a real candidate observation tied to that exact
version and generation context.
