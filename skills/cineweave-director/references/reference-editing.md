# Reference-image and mask editing

Use this reference when a World Observation, user-supplied image, prior Candidate or mask influences the next image plan.

## Reference roles

Assign each input one explicit role:

- `identity`: preserve face, body, costume or prop identity;
- `composition`: preserve framing, geometry or screen direction;
- `lighting`: borrow source direction, contrast or color relationship;
- `style`: borrow bounded material or visual grammar, not an unbounded author identity;
- `material`: preserve surface construction or texture behavior;
- `background`: preserve geography or environmental structure;
- `mask`: define the local regeneration region.

Use Observation IDs rather than raw private paths or signed URLs. The Web/API layer resolves media access; the Skill only declares the semantic role and preserve contract.

## Edit invariant

Every edit plan must state:

1. what changes;
2. what remains unchanged;
3. how the reference inputs interact;
4. how the result will be checked;
5. what to do if identity, geometry or continuity drifts.

Use “change only X; preserve Y” as a semantic constraint, not as a provider-specific prompt trick.

## Mask semantics

For inpainting, the contract is explicit:

- opaque region means preserve;
- transparent region means regenerate;
- the mask must have a declared purpose;
- the plan must reject a mask without a primary reference;
- the Skill must never claim that an inpaint succeeded before media verification.

## Multi-reference order

When several references are used, identify each by index and role in the semantic plan. Do not allow a style reference to silently replace identity, or a composition reference to silently change World geography.
