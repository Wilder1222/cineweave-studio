# Natural human capture

Use this module for a photoreal human portrait or one of the standard NHR
fixtures. Director controls how the approved character and physical light are
observed; it does not define skin biology, makeup or representation style.

## Capture grammar

Choose the desired perspective first, then a working-distance and focal-length
hypothesis. A flattering portrait is not automatically `85mm f/1.8`.

- close portrait: keep facial perspective believable, name the nearer-eye or
  face-plane focus target and allow gradual falloff;
- medium: preserve hands, gesture and costume construction while separating the
  subject from the environment;
- full body: protect head/body proportions, feet, ground contact and enough
  depth for cloth/body interaction;
- backlight: use an existing SceneLightState source as rim/back light and an
  existing ambient or bounce source as facial fill. Do not invent a fill source
  inside ShotLightingPlan.

State camera height, angle, distance, focal hypothesis, perspective intent,
focus target, depth relationship and foreground/midground/background layers.
Optical softness means controlled microcontrast and believable focus falloff,
not an unfocused identity.

## Standard NHR fixture direction

### Neutral close

Eye-level or slightly above, neutral working distance, soft directional source,
simple background and restrained depth. The first read is facial structure; no
dramatic crop, makeup change or glamour relight is allowed.

### Warm backlight

Place the approved warm source behind or to the rear side. Retain facial fill,
individual flyaway edges and smooth shadow transition. Protect highlight detail
and avoid a glowing outline around the whole body.

### Natural full body

Use a perspective that preserves body rhythm. Keep both feet and contact shadow
readable, leave enough space for hand/garment interaction and avoid shallow
depth that erases limb or floor evidence.

## Manga panels

When directing comics, Director owns panel purpose, count, reading order,
shot/crop, information change, axis and transitions. Style owns ink, screentone,
panel-border and effect grammar. Generate panels independently, review failed
panels individually and assemble the page plus exact text deterministically.
