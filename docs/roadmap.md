# CineWeave Studio roadmap

## Shipped in V2.2

- eight standalone/composable Skills with unique route and contract ownership;
- dedicated Story and general Prompt domains;
- 54 canonical contracts, including causal story, actor timing, three-layer
  lighting, shot and temporal specifications;
- zero-prompt character exploration and user-led preference convergence;
- strict, immutable local artifact storage and exact-hash approvals;
- deterministic multi-panel board assembly with per-tile provenance;
- 24 behavior cases across direct, indirect, incomplete, negative and edge use;
- Windows/Linux CI, bundle validation and distributable-asset rights audit.

## Shipped in V2.3

- provider-neutral `AdapterDescriptor`, exact `ExecutionRequest` and
  runtime-authored `ExecutionReceipt` contracts;
- trusted in-process adapter registry with implementation-hash matching;
- exact-request approval and explicit caller enablement for external effects;
- immutable idempotency claims, retry-cost accounting and byte-level output
  verification;
- zero-cost, network-free deterministic SVG fixture adapter;
- 10-case live Skill evaluation corpus covering every Skill and a negative
  should-not-activate request;
- explicit-cost live Codex runner, read-only isolated tasks, strict structured
  responses and deterministic committed replay grading;
- semantic validation for execution and evaluation summary integrity.

## Next incremental priorities (V2.3.x)

Priority remains based on user value and architectural risk.

1. **Artifact graph CLI (P0).** Add dependency inspection, stale-ref detection,
   approval-gate queries and safe export/import on top of the immutable store.
2. **Reference ingestion (P0).** Create local observations with perceptual role,
   region scope, content hash, source, consent and redistribution status; never
   copy user uploads into the public plugin.
3. **Contract-aware repair runner (P1).** Execute one-variable repair plans while
   preserving passing immutable inputs and recording before/after evidence.
4. **Original case atlas (P1).** Add rights-cleared, reproducible worked cases
   for portrait, product, food, architecture, editorial, diagrams and exact-text
   layouts. Keep a small routing index, load only the matching category and
   attach prompt version, adapter context, candidate hash and review evidence.
5. **Evaluation baselines (P1).** Retain versioned aggregate scores, compare
   regressions by route and require human review for grader-definition changes.
6. **Adapter conformance kit (P1).** Publish fixtures for timeout, partial output,
   retryable billing, malformed metadata and cancellation without shipping any
   provider credential or paid adapter in core.

## V2.4 — production workspace

1. Editable cards for Brief, Story, Character, Scene, Style, Shot and Prompt.
2. Visual artifact graph, exact-version diff and approval history.
3. A/B preference capture without universal beauty or quality scores.
4. Reference-role UI with explicit preserve/ignore regions and rights warnings.
5. Board review with per-tile retry and deterministic reassembly.

The workspace must consume the same contracts; it must not create a parallel,
hidden data model or imply that “CineWeave Web” already exists.

## Research tracks

- finer style-atom taxonomy with inheritance, compatibility and search;
- cultural/historical evidence profiles separated from inspired interpretation;
- camera-trajectory and temporal-reference adapters for video;
- cross-shot identity, geography, light and action continuity benchmarks;
- user-specific taste learning based on reversible comparison feedback;
- accessibility and localization for Chinese-first creative workflows;
- privacy-preserving local media embeddings only after an explicit threat model.

## Invariants for every increment

- specialists remain directly callable;
- composition uses exact immutable refs and a DAG;
- facts, representation, direction, prompting and execution remain separate;
- unknown evidence, rights or capabilities never become approved by assumption;
- generated media and external side effects remain explicitly human-gated;
- every public claim has a corresponding test or is labeled as planned.
