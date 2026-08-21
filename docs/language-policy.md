# Language policy

CineWeave uses a hybrid language strategy rather than duplicating every field.

## Stable machine layer: English

- Skill IDs, route IDs, contract kinds and JSON property names are English.
- `SKILL.md` operating instructions are English for consistency with Codex and
  official ecosystem terminology.
- Technical documentation may retain established English terms such as
  blocking, eyeline, falloff and content hash when translation would be less exact.

## Creator-facing layer: follow the user

- Explanations, questions, creative briefs and prompt prose use the user's
  language; Chinese is the project author's default authoring language.
- A PromptRecord declares `zh-CN`, `en` or `bilingual`. Do not emit bilingual
  duplication unless the user or a model adapter benefits from it.
- Human-readable values may contain Chinese names and prose while IDs remain
  stable ASCII identifiers.

## Why not make everything bilingual

Duplicating all instructions increases token use and creates two sources of
truth. Stable internal English plus localized values keeps schemas portable and
the creative experience natural. A future UI should localize labels without
renaming contract fields.
