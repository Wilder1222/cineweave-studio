# Style light grammar

`StyleLightGrammar` describes how physically motivated light is represented in a medium. It may define:

- global and local contrast behavior;
- highlight rolloff and shadow rendering;
- warm/cool relationship and color separation;
- atmosphere treatment;
- bloom, halation, grain and sharpening;
- medium-specific abstraction, such as cel-shadow steps or inked black shapes.

It never places a sun, window, lamp or bounce in scene geography. It never changes a SceneLightState source direction. It never chooses a shot key or fill. Those belong to Scene and Director respectively.

For video, keep static appearance rules separate from temporal light behavior. Flicker, moving shadows and exposure transitions require an explicit temporal source or TemporalSpec event.
