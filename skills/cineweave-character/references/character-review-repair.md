# Character review and repair

Review and repair are separate artifacts.

## Review

- identify the exact CharacterSpec and optional binding/appearance state;
- evaluate scoped criteria with Candidate Observation evidence;
- summarize drift categories and confidence;
- decide accept, repair, reject or collect more evidence;
- name the smallest repair variable only when evidence supports it.

## Repair

A CharacterRepair must contain one `change` object.

- preserve every passed identity, appearance, performance and scene criterion;
- target one field or semantic mechanism;
- forbid unrelated redesign;
- define acceptance checks and a stop condition;
- require human approval;
- never claim success before a new Candidate is verified.
