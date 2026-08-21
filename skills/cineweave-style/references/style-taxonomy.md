# Fine-grained style taxonomy

Use this as a routing vocabulary, not as a mandatory catalog of every combination. Add a new leaf only when it has a stable definition, observable evidence, a distinct parent delta and a validation case.

## Primary domains and useful subfamilies

| Domain | Family examples | Fine-grained atom examples |
|---|---|---|
| Medium | live action, hand-drawn 2D, digital 2D, 3D, comic, illustration, print | `medium.comic.monochrome`, `medium.animation.handdrawn` |
| Representation | photoreal, naturalistic stylized, graphic, abstract | `representation.naturalistic_photoreal`, `representation.graphic_flat` |
| Culture | China, Japan, South Asia, Europe, invented world | `culture.china.song.southern_song_literati` |
| Costume | era, role, occasion, season, treatment | `costume.song.literati.restrained`, `costume.song.court.ceremonial` |
| Production design | palace, garden, market, study, wilderness, sci-fi | `production_design.song.jiangnan_garden_lived_in` |
| Linework | ink, brush, pencil, charcoal, vector, woodcut | `linework.ink.fine_variable`, `linework.baimiao_flowing` |
| Shading | gradient, cel, black mass, screentone, hatching, wash | `shading.high_white_sparse_ink` |
| Color | monochrome, muted jade, earth, cyan-gold, neon | `color.ink_jade_moonwhite` |
| Lighting | window, candle, overcast, moon, motivated low-key, soft backlight | `lighting.soft_motivated_window` |
| Composition | symmetry, scroll-like, layered depth, negative space, scale contrast | `composition.scroll_like_negative_space` |
| Cinematography | observational, portrait, reaction-first reveal, deep focus, subjective | `cinematography.reaction_first_progressive_reveal` |
| Performance | micro-expression, socially restrained, theatrical, graphic pose | `performance.restrained_microexpression` |
| Motion | grounded, dance-like, pose-to-pose, limited animation, motion comic | `motion.grounded_delayed_secondary_motion` |
| Temporal | contemplative, suspense build, spectacle reveal, montage, fast action | `temporal.contemplative_slow` |
| Postprocess | film grain, halation, paper, ink bleed, CRT, clean digital | `postprocess.subtle_analog_grain` |

## Example fine-grained paths

```text
medium/comic/monochrome
  + linework/ink/fine_variable
  + shading/high_white/sparse_ink
  + character/naturalistic_mature
  + composition/cinematic/layered_depth

culture/china/song/southern_song/literati
  + costume/song/restrained_daily
  + production_design/jiangnan/garden_lived_in
  + color/ink_jade_moonwhite
  + performance/socially_restrained

medium/animation/handdrawn
  + representation/naturalistic_simplified
  + motion/grounded_organic
  + temporal/environmental_motion_alive
  + postprocess/paper_paint_subtle
```

## Named style requests

If a user names a creator, studio or work, treat it as an input alias that needs translation. Ask or infer the requested dimensions, then emit descriptive atoms such as camera motivation, line behavior, palette, performance, blocking and temporal rhythm. Do not store the name as the only compiler directive or imply endorsement, provenance or permission.
