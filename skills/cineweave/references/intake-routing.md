# Intake and routing

Build the smallest structured brief that preserves the user's intent. Extract
only fields that change a downstream decision:

| Need | Route | Why |
|---|---|---|
| premise, causal beats, script scene or story continuity | `cineweave-story` | story purpose and state change must precede shot decisions |
| reusable face, body, appearance or performance | `cineweave-character` | identity remains stable across shots and media |
| “I do not know how to describe the face; show me directions” | `cineweave-character` `character_explore` | candidate comparison turns a feeling into controlled identity hypotheses |
| reusable location, physical interaction or physical light state | `cineweave-scene` | geography, contact and source placement need explicit constraints |
| medium, visual system, reference policy or style transfer | `cineweave-style` | representation must not overwrite identity or geography |
| blocking, camera, shot lighting, temporal direction or storyboard | `cineweave-director` | direction decides how an already-defined moment is revealed |
| reusable or one-off text-to-image prompt in any domain | `cineweave-prompt` | prompt compilation must remain usable beyond cinematic shots |
| recipe, evidence, capability, rights or repeatable QA | `cineweave-production` | production validation is separate from creative facts |

Use a direct specialist route if one row answers the request. Use a composed
workflow only when a final output explicitly needs more than one owner.

## High-impact gaps

Ask only when a safe default would materially change the result:

- desired output medium or image versus video;
 - whether the request needs story development, a shot decision or only prompt compilation;
- whether identity must persist across images or shots;
- the role of a supplied reference image or video;
- historical reconstruction versus stylized reinterpretation;
- the item that must remain locked.

Do not ask for lens focal length, minor accessories or low-impact background
details before an exploration request can start.

For zero-prompt character exploration, ask no more than the six simple cards:
visual world, temperament, representation, adornment, adult age impression and
first visual priority. Send blank answers as `undefined`; `$cineweave-character`
owns candidate semantics, preference feedback and eventual identity drafting.
