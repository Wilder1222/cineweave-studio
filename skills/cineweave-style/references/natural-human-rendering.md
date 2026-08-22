# Natural Human Rendering

Natural Human Rendering (NHR) is the photoreal/live-action representation pack
inside VRS. It is not a skin prompt and not a claim that a provider generated a
realistic image.

## Layer ownership

- CharacterSpec owns stable anatomy, natural asymmetry, baseline complexion,
  persistent marks and stable human-surface tendencies.
- CharacterAppearanceState owns makeup coverage, hydration/sebum visibility,
  temporary colour, weather, sweat, dust and current visible skin material.
- SceneLightState owns physical sources.
- Style owns highlight rolloff, colour separation, microcontrast, grain,
  halation, sharpening and shot-scale surface representation.
- Director owns viewpoint, working distance, perspective, focus, depth and how
  existing sources reveal the subject.

“Translucent” human appearance should compile into observable cues: regional
warmth, thin-tissue warmth under backlight, restrained specular breakup, smooth
highlight rolloff and soft ambient fill. Do not equate it with fair skin,
whitening, global glow or a provider-neutral `SSS` token.

## Scale-aware visibility

- close-up: regional tonal variation, age-appropriate microtexture, eye/lip
  moisture, hairline and individual flyaways;
- medium: facial volume, hair masses, hands and material separation;
- full body: proportions, weight bearing, hands/feet, garment construction and
  cloth/body contact;
- wide: silhouette, action, environment integration and source-consistent light.

Do not force pore-scale details into a full-body or wide image. Photographic
realism is macro-readable and micro-restrained, not uniform maximum sharpness.

## Three standard fixtures

`recipe.natural-human-fixtures-3up` runs independent candidates:

1. neutral close portrait for anatomy, regional tone, eye/lip and smoothing;
2. warm backlight portrait for thin-tissue cues, flyaways, rolloff and focus;
3. natural full body for body anatomy, weight, hands/feet, contact and cloth.

Use the same locked character and appearance. The fixture selection is the sole
task delta. Evaluate observable dimensions rather than a single realism or
beauty score.

## Common failure labels

`plastic_skin`, `uniform_skin_tone`, `beauty_filter_smoothing`,
`oversharpened_microtexture`, `specular_oil_film`, `hair_edge_failure`,
`focus_falloff_error`, `catchlight_source_mismatch`, `weight_contact_error` and
`identity_drift` should route to the smallest owner. Preserve every passing
dimension during repair.
