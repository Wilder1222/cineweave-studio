# Reference bindings

Treat a reference as evidence for a declared role, never as a complete instruction by default.

## Required declaration

For each image or video record:

- observation ID supplied by the runtime or user;
- role: identity, structure, pose, composition, lighting, material, palette, style, background or motion;
- scope: whole asset or named regions;
- preserve: visible properties to transfer;
- ignore: identity, costume, content, text, layout or other leakage risks;
- allowed transforms;
- source and rights status, including `unknown` when unresolved.

One asset may have multiple observations, but each observation has one primary role. When a source is both a face and style reference, create separate scoped observations rather than one ambiguous binding.

## Good reference sets

A reusable style set should keep style stable while varying subject, composition, scene and dominant color. A character identity set should use neutral light and several angles before beauty lighting. A pose reference should not silently become an identity reference.

## Runtime policy

Broad media can often compile from semantic text alone. Specific original looks, long-running identities, exact materials or hard composition targets benefit from references. Use an adaptive policy: add references when specificity, novelty, consistency risk or model uncertainty outweigh text descriptiveness.

Do not bundle user uploads or third-party media in a public plugin unless redistribution rights are explicit. Store structured observations and provenance separately from distributable examples.
