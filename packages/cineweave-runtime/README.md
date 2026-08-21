# CineWeave Runtime

This package provides the deterministic local control plane used by CineWeave
Studio contracts. Core ships no image/video provider or credential; execution
is possible only through a trusted registered adapter.

The runtime owns mechanical operations that Skills must not improvise:

- RFC 8785-compatible JSON canonicalization and `sha256:` content hashes;
- immutable artifact envelopes keyed by exact `kind`, `id`, `version` and hash;
- human approval records bound to one exact artifact reference;
- dependency and dependent closure queries with missing, hash-mismatched and
  superseded-reference detection;
- exact approval gates with optional current-version and dependency-approval
  policies;
- byte-verified, path-scoped project bundle export, verification and import;
- bounded content-addressed reference-media ingestion and exact blob
  verification;
- deterministic SVG board assembly with per-tile provenance;
- trusted in-process adapter registration with implementation-hash matching;
- idempotent execution, exact-request authorization, constrained output writes
  and immutable execution receipts.

Project data lives under `<project>/.cineweave/`. Generated project stores are
local working data and should not be committed unless the user explicitly wants
to publish a sanitized fixture.

```powershell
node packages/cineweave-runtime/bin/cineweave.mjs init . --id demo --name "Demo"
node packages/cineweave-runtime/bin/cineweave.mjs put . brief.json --id brief.demo --version 1
node packages/cineweave-runtime/bin/cineweave.mjs verify .
node packages/cineweave-runtime/bin/cineweave.mjs graph .
node packages/cineweave-runtime/bin/cineweave.mjs stale .
node packages/cineweave-runtime/bin/cineweave.mjs gate . artifact-envelope.json --require-current
node packages/cineweave-runtime/bin/cineweave.mjs reference-ingest . portrait.png --source-class user_upload
node packages/cineweave-runtime/bin/cineweave.mjs reference-verify . reference-asset-envelope.json
```

`graph` returns the strict `cineweave_artifact_graph` contract. By default an
approved old artifact remains usable and emits a warning; `--require-current`
turns a superseded root or dependency into a blocking reason.

Reference ingestion accepts only allow-listed PNG, JPEG, WebP, MP4/M4V, MOV
and WebM files whose extension matches a bounded signature/container probe.
Images are dimension-bounded; all media is size-bounded and stored under a
SHA-256-derived, non-executable blob path. The semantic asset does not retain
the source path or original filename. This is not decoding, malware scanning,
Content Credentials validation or a grant of copyright/likeness rights;
embedded metadata remains uninspected until a separate privacy review.

Project transfer uses a directory instead of arbitrary archive extraction:

```powershell
node packages/cineweave-runtime/bin/cineweave.mjs export . ../project-transfer
node packages/cineweave-runtime/bin/cineweave.mjs bundle-verify ../project-transfer
node packages/cineweave-runtime/bin/cineweave.mjs import ../project-transfer ../restored-project
```

Every regular store file—including V2.4 reference blobs—is listed by safe
relative path, category, byte length and SHA-256 digest in
`cineweave-bundle.json`. Symbolic links, unknown store
paths, unlisted files, duplicate paths, traversal syntax, changed bytes and an
existing target `.cineweave` store are rejected. Successful import stages and
verifies the complete store before one rename. The manifest explicitly does not
grant redistribution or rights approval.

The core package registers only a deterministic, zero-cost, no-network SVG
fixture adapter. `adapters` prints its entrypoint ID and implementation hash.
`execute` accepts a stored ExecutionRequest envelope and never enables external
effects. Provider adapters must be supplied by a separate trusted extension and
must still pass an exact request approval to use external mode.

```powershell
node packages/cineweave-runtime/bin/cineweave.mjs adapters
node packages/cineweave-runtime/bin/cineweave.mjs execute . execution-request-envelope.json
```

Board assembly accepts a manifest whose tiles point to independently generated
PNG, JPEG, WebP or SVG files. It embeds those files into one SVG and emits a
sidecar provenance record.

```powershell
node packages/cineweave-runtime/bin/assemble-board.mjs --manifest board.json --out board.svg
```
