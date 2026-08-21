# Character exploration and preference convergence

Use this module when a user knows the feeling they want but cannot name facial,
body or prompt terminology. The goal is not to discover an objectively “best”
face. The goal is to turn a subjective preference into a stable, reusable
character direction without letting costume, style or a lucky single image
pretend to be identity.

## Core contract sequence

```text
feeling / zero-prompt cards / optional references
        ↓
CharacterExplorationBrief
        ↓
CharacterOptionSet (2–6 comparable hypotheses)
        ↓
independent candidate tasks + deterministic board assembly
        ↓
QualityGate + user PreferenceFeedback
        ↓
draft CharacterSpec (explicit user decision only)
        ↓
neutral identity and body evidence
        ↓
human identity lock
```

The three exploration contracts are deliberately distinct:

- `CharacterExplorationBrief` owns what the user is trying to feel, the single
  variable being tested, the shared fixture and the lock state.
- `CharacterOptionSet` owns comparable hypotheses. It is not a beauty ranking,
  an identity lock or evidence that media exists.
- `CharacterPreferenceFeedback` owns the user's selection and local changes.
  It is session-scoped by default, editable/deletable, and never becomes a
  hidden biometric or personal taste profile.

## Zero-prompt card intake

Do not make a user fill professional facial terms before beginning. Offer the
following six cards and accept one choice, a range, or a free-text answer for
each. A user can stop after any card; unresolved values remain `undefined`.

1. **Visual world** — for example 新式宋韵, 盛唐华丽, 江湖武侠, 仙侠空灵, 现代都市, 黑白漫画.
2. **Core temperament** — choose up to two or three impressions and optional
   weights, such as 清冷 60% + 温婉 40%.
3. **Representation** — 真人影视, 手绘二维, 三维, 漫画, 插画 or mixed.
4. **Adornment** — 素雅, 精致克制 or 华丽繁复.
5. **Age impression** — 成年年轻感, 成年感 or 成熟感. Never solicit or create a minor character for an adultized task.
6. **First visual priority** — 眼神, 面部轮廓, 妆发, 服装, 动作 or 氛围.

Use a reversible default when a card is blank. Example defaults for a first
identity round: neutral soft light, simple grooming, non-identifying wardrobe,
calm expression, mid-close framing and a low-detail background.

## Controlled candidate design

### Quality and preference are different decisions

Use a **QualityGate** to remove a candidate only for technical or policy
reasons:

- anatomy and hand/face integrity;
- age alignment;
- identity clarity at the requested scale;
- representation fit;
- visible artifact risk;
- declared reference and likeness rights.

Use **PreferenceFeedback** only for the user's creative response. Never label
one option more attractive, more valuable or objectively superior. A candidate
that passes QualityGate may still be rejected because it does not feel right.

### One variable per round

All options must share framing, camera, light, background, grooming, wardrobe
and expression. Change exactly one of the following per round:

- `facial_structure` — face length/width relation, cheekbone position and jaw
  transition;
- `eye_expression` — eye aperture, outer-corner direction and gaze energy;
- `face_softness` — soft versus lightly defined bone structure without changing age;
- `age_impression` — adult presentation cues only, while keeping representation neutral;
- `body_silhouette` — shoulder, torso and head-to-body relationship in a neutral full-body fixture;
- `posture_energy` — grounded, open, restrained or alert posture in a stable body fixture.

Do not compare face structure with a new hairstyle, new clothing, new camera
angle or a different visual style in the same board. Those are content leaks,
not preference evidence.

### Option writing rule

Each option needs:

1. a readable display name;
2. one `primaryDelta.axis` matching the set's exploration axis;
3. a hypothesis explaining what feeling the variation is testing;
4. an identity hypothesis that leaves all non-tested fields constant;
5. preserve and avoid lists;
6. a provider-neutral prompt intent for `$cineweave-prompt`.

Use 2–4 options by default. Use 5–6 only when the user deliberately asks for a
wider exploration. Never mechanically combine “the eyes from A, nose from B
and mouth from C” from unrelated real people; create a coherent original
hypothesis instead.

## Feedback language the system should understand

The user should be able to respond in ordinary Chinese:

- “我更喜欢 2，但不要那么冷。”
- “A 的轮廓比 B 好，眼睛不要变。”
- “下颌再弱一点，保留颧骨。”
- “两个都不对，换一个更温柔的方向。”

Translate this into typed signals:

- `select` — select one option;
- `rank` — order options;
- `compare` — prefer one option over a named other option;
- `more_less` — adjust one local scope;
- `avoid` — name a direction to exclude.

Feedback can ask for another exploration round or a draft `CharacterSpec`. It
cannot auto-lock identity. When it requests a draft, mark unresolved anchors
as provisional and schedule neutral identity/body evidence before any lock.

## References and safety

References remain optional. When supplied, each must have one declared role:

- `identity` for consented face/body continuity evidence;
- `appearance` for hair, wardrobe or makeup;
- `style` for rendering, color or material treatment;
- `body` for silhouette/proportion;
- `lighting` or `composition` for the shared fixture.

Every binding declares preserve, ignore and rights status. A style, costume,
pose or public-photo reference does not grant permission to infer real-person
identity. Do not write local paths or source URLs into the exploration
contracts.

## Handoff rules

- `$cineweave` may create a `CreativeBrief` and compose the workflow, but it
  does not own the exploration contracts.
- `$cineweave-character` owns option semantics and preference convergence.
- `$cineweave-prompt` converts one exact option plus the shared fixture into
  comparable Chinese prompt blocks; it may not invent or merge option deltas.
- `$cineweave-director` supplies an exact `ShotSpec` only when the comparison
  requires a deliberate shot rather than a neutral fixture.
- `$cineweave-production` uses
  `recipe.character-exploration-board-4up` to create independent tile tasks,
  deterministic assembly and failed-tile-only retry.
- `$cineweave-style` may render the approved semantic anchors differently, but
  it cannot decide which face/body identity the user should prefer.
