# CineWeave Runtime

This package provides the deterministic local control plane used by CineWeave
Studio contracts. It does not call image or video providers.

The runtime owns four mechanical operations that Skills must not improvise:

- RFC 8785-compatible JSON canonicalization and `sha256:` content hashes;
- immutable artifact envelopes keyed by exact `kind`, `id`, `version` and hash;
- human approval records bound to one exact artifact reference;
- deterministic SVG board assembly with per-tile provenance.

Project data lives under `<project>/.cineweave/`. Generated project stores are
local working data and should not be committed unless the user explicitly wants
to publish a sanitized fixture.

```powershell
node packages/cineweave-runtime/bin/cineweave.mjs init . --id demo --name "Demo"
node packages/cineweave-runtime/bin/cineweave.mjs put . brief.json --id brief.demo --version 1
node packages/cineweave-runtime/bin/cineweave.mjs verify .
```

Board assembly accepts a manifest whose tiles point to independently generated
PNG, JPEG, WebP or SVG files. It embeds those files into one SVG and emits a
sidecar provenance record.

```powershell
node packages/cineweave-runtime/bin/assemble-board.mjs --manifest board.json --out board.svg
```
