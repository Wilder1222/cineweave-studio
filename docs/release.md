# Release process

Every release is an immutable plugin snapshot.

1. Update the plugin, package and contract-suite versions according to semantic
   compatibility.
2. Update `CHANGELOG.md` and any migration notes.
3. Run `npm test` and `npm run validate` on Windows and Linux.
4. Validate every Skill with the current Codex `skill-creator` validator and
   validate the plugin with `plugin-creator`.
5. Build standalone bundles and test the plugin in a clean Codex task.
6. Commit, create an annotated `vX.Y.Z` tag and push both the branch and tag.
7. Point the marketplace entry at that tag or exact commit.
8. Install from the marketplace again and verify the cached manifest, Skills,
   assets and starter prompts.

Never reuse a tag, move a release tag or publish two different archives under
one version. A local cachebuster is for development only and must not replace a
real semantic version in a public release.
