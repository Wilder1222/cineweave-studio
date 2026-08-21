# Contributing to CineWeave Studio

Contributions should preserve the project's central invariant: every specialist
Skill remains directly usable while composed workflows exchange only explicit,
versioned contracts.

## Before changing a Skill

1. Identify a recognizable user goal and the smallest owning Skill.
2. Add or update representative direct, indirect, incomplete, negative and edge
   behavior cases.
3. Keep `SKILL.md` focused on routing, boundaries and essential workflow.
4. Put detailed domain material in `references/` and deterministic mechanics in
   scripts or the runtime package.
5. Update `contracts.json`, the suite manifest and examples when ownership or
   exchange formats change.

Do not add user uploads, production stills or other media with unknown rights to
the repository. Public binary assets belong under `assets/` or a Skill's
`assets/` folder and need documented redistribution rights.

## Validation

Use Node.js 22 or newer and UTF-8 text handling.

```powershell
npm test
npm run validate
```

For a changed Skill, also run the current Codex `skill-creator` validator and
test representative requests in a fresh task. A passing schema check does not
replace behavioral review.

## Changes and releases

- Use focused commits with an explanatory subject.
- Do not rewrite another contributor's work or public history without explicit
  coordination.
- Update `CHANGELOG.md` for user-visible behavior or contract changes.
- Release tags are immutable. Marketplace entries for a release must reference
  that tag or exact commit, never a moving branch.
