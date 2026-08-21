# Creative Brief Compiler

Use this reference for `creative_intake` and for any request that begins as a vague natural-language idea rather than exact Character, Scene or Style bindings.

## Input modes

- `zero_prompt`: accept a mood sentence or six simple cards, keep missing details `undefined`, then hand off a controlled character exploration instead of demanding facial terminology;
- `quick`: accept one sentence, use safe low-impact defaults and return an editable exploration brief;
- `guided`: show the system's interpretation and ask at most three high-impact questions;
- `professional`: accept or expose CharacterSpec, SceneSpec, StylePackage, reference roles, locks, stages and output constraints.

Do not make a long form the entrance requirement. The compiler should fill the structure first and ask only when a missing choice materially changes the route.

## Compilation flow

```text
user text + optional references + style selections
        ↓
intent extraction
        ↓
medium / task / stage classification
        ↓
reference role and rights binding
        ↓
style atom or package resolution
        ↓
hard / soft / free / undefined locks
        ↓
high-impact gap analysis
        ↓
stage plan and owning Skill handoff
```

For a character request with no prompt vocabulary, prepend a zero-prompt card
step: visual world, temperament, representation, adornment, adult age
impression and first visual priority. This creates a `CreativeBrief` with
`inputMode: zero_prompt`; it does not itself create the Character exploration
contracts, which are owned by `$cineweave-character`.

Compile emotion into observable intent, but do not invent locked facts. “清冷” may become restrained gaze, low gesture amplitude and controlled shadow; it remains an intent hypothesis until a Character or Director decision accepts it.

## High-impact question rule

Ask only when all three are true:

1. the missing value changes the Skill route, identity, medium, rights, historical treatment or temporal requirements;
2. the compiler cannot choose a reversible safe default;
3. the answer is not already present in text or references.

Prefer one to three questions:

- explore identity or produce a final appearance?
- realistic, hand-drawn, comic or 3D representation?
- historical research, poetic reinterpretation or invented culture?
- must identity stay consistent across shots/video?
- is the uploaded image for identity, costume, style, lighting, composition or motion?

Do not ask for focal length, small accessories or exact background props before the route needs them.

## Reference binding

For every supplied reference, record one role and scope, preserve and ignore lists, rights status, design-time/runtime/validation lifetime and whether it can affect identity, appearance, scene, camera, performance or temporal behavior.

If the user uploads an image without a purpose, keep the brief `draft` or ask one role question. Never silently use the image as an all-purpose style and identity reference.

## Locks and stages

Use four lock levels:

- `hard`: exact fact or explicit must-preserve requirement;
- `soft`: preferred direction with bounded compromise;
- `free`: safe exploration space;
- `undefined`: unresolved and not yet safe to treat as fact.

Default staged handoff for a new character:

1. `$cineweave` creative intake and workflow plan;
2. Character exploration brief, comparable option set and human preference feedback;
3. Draft character direction plus neutral identity/body evidence;
4. Character appearance state;
5. Style reference/compile;
6. Director `ShotSpec` for deliberate hero/full-body/shot observation, then
   Prompt compilation by `$cineweave-prompt`;
7. Production turnaround/expression recipes;
8. Director Storyboard or final RenderPlan.

The compiler returns a plan and named payload handoffs. It does not create Canon, call a Provider or claim that any image/video exists.
