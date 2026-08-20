#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function isObject(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function nonEmpty(value) { return typeof value === "string" && value.trim().length > 0; }
function push(errors, condition, message) { if (!condition) errors.push(message); }
function unique(values) { return new Set(values).size === values.length; }

function validateCharacterSpec(payload, errors) {
  const anchors = payload?.identityCore?.immutableAnchors || [];
  push(errors, anchors.length >= 3, "CharacterSpec requires at least three immutable anchors");
  push(errors, unique(anchors.map((item) => item?.anchorId)), "CharacterSpec anchor IDs must be unique");
  push(errors, anchors.some((item) => item?.priority === "critical" && item?.visibleAt?.some((scale) => ["medium", "fullbody", "wide", "silhouette"].includes(scale))), "CharacterSpec needs a critical anchor visible beyond close-up");
  const variables = payload?.appearanceLayers?.controlledVariables || [];
  push(errors, unique(variables.map((item) => item?.variableId)), "Character appearance variable IDs must be unique");
  const states = payload?.behaviorModel?.states || [];
  push(errors, unique(states.map((item) => item?.stateId)), "Character behavior state IDs must be unique");
  push(errors, payload?.rights?.sourceClass !== undefined, "CharacterSpec rights must be explicit");
}

function validateCharacterBinding(payload, errors) {
  push(errors, Array.isArray(payload?.activeAnchorIds) && payload.activeAnchorIds.length > 0, "CharacterBinding requires active anchors");
  push(errors, unique(payload?.activeAnchorIds || []), "CharacterBinding active anchor IDs must be unique");
  push(errors, typeof payload?.performanceState?.intensity === "number" && payload.performanceState.intensity >= 0 && payload.performanceState.intensity <= 1, "CharacterBinding intensity must be between 0 and 1");
  push(errors, typeof payload?.performanceState?.concealment === "number" && payload.performanceState.concealment >= 0 && payload.performanceState.concealment <= 1, "CharacterBinding concealment must be between 0 and 1");
  for (const key of ["startState", "trigger", "peakState", "endState"]) push(errors, nonEmpty(payload?.actionArc?.[key]), `CharacterBinding actionArc.${key} is required`);
  for (const key of ["posture", "gaze", "face", "hands", "breath"]) push(errors, nonEmpty(payload?.observablePerformance?.[key]), `CharacterBinding observablePerformance.${key} is required`);
  if (payload?.behaviorLogic) for (const key of ["perception", "appraisal", "chosenStrategy", "suppressedImpulse", "actionReason"]) push(errors, nonEmpty(payload.behaviorLogic[key]), `CharacterBinding behaviorLogic.${key} is required`);
  if (payload?.emotionControl) {
    push(errors, Math.abs(payload.emotionControl.intensity - payload.performanceState.intensity) < 1e-9, "emotionControl intensity must match performanceState intensity");
    push(errors, Math.abs(payload.emotionControl.concealment - payload.performanceState.concealment) < 1e-9, "emotionControl concealment must match performanceState concealment");
    push(errors, Array.isArray(payload.emotionControl.leakageChannels) && payload.emotionControl.leakageChannels.length > 0, "emotionControl requires leakage channels");
  }
}

function validateCharacterReferencePlan(payload, errors) {
  const phases = payload?.phases || [];
  const types = phases.map((phase) => phase?.type);
  push(errors, types.includes("identity"), "CharacterReferencePlan must include an identity phase");
  const appearanceIndex = types.indexOf("appearance");
  const identityIndex = types.indexOf("identity");
  if (appearanceIndex >= 0) push(errors, identityIndex >= 0 && identityIndex < appearanceIndex, "identity phase must precede appearance phase");
  for (const phase of phases) for (const frame of phase?.frameSpecs || []) {
    if (frame.semanticRole === "identity") push(errors, ["face", "body", "full_character"].includes(frame.scope), `${frame.frameId}: identity role has invalid scope`);
    if (frame.semanticRole === "performance") push(errors, ["expression", "pose", "motion"].includes(frame.scope), `${frame.frameId}: performance role has invalid scope`);
  }
  push(errors, payload?.executionBoundary?.generatesMedia === false, "Reference plan must not claim media generation");
}

function validateAppearanceState(payload, errors) {
  const assignments = payload?.assignments || [];
  push(errors, unique(assignments.map((item) => item?.variableId)), "AppearanceState variable assignments must be unique");
  push(errors, Array.isArray(payload?.preserveAnchorIds) && payload.preserveAnchorIds.length > 0, "AppearanceState must preserve identity anchors");
  push(errors, payload?.validation?.identityPreserved === true, "AppearanceState must assert identity preservation");
  if (payload?.styling) {
    const materials = payload.styling?.costume?.materials || [];
    push(errors, materials.length > 0, "Structured styling requires at least one costume material");
    push(errors, unique(materials.map((item) => item?.materialId)), "Costume material IDs must be unique");
    push(errors, payload.styling?.makeup?.identityPreservation?.length > 0, "Makeup must state identity preservation");
    push(errors, payload.styling?.costume?.pairingLogic?.length > 0, "Costume must declare pairing logic");
  }
}

function validateReview(payload, errors, domain) {
  const criteria = payload?.criteria || [];
  const hasBlockingFail = criteria.some((item) => item?.status === "fail" && item?.severity === "blocking");
  if (hasBlockingFail) {
    push(errors, payload?.summary?.overallStatus === "fail", `${domain} review with a blocking failure must have overallStatus=fail`);
    push(errors, payload?.decision?.nextAction !== "accept", `${domain} review with a blocking failure cannot accept`);
  }
  const evidence = criteria.flatMap((item) => item?.evidenceObservationIds || []);
  push(errors, evidence.length >= criteria.length, `${domain} review criteria require scoped evidence`);
  if (payload?.decision?.nextAction === "repair") push(errors, nonEmpty(payload?.decision?.smallestRepairVariable), `${domain} repair decision requires smallestRepairVariable`);
}

function validateRepair(payload, errors, domain) {
  push(errors, isObject(payload?.change), `${domain} repair requires one change object`);
  push(errors, payload?.validation?.singleVariable === true, `${domain} repair must be single-variable`);
  push(errors, payload?.validation?.parentImmutable === true, `${domain} repair must keep parent immutable`);
  push(errors, payload?.executionGate?.requiresHumanApproval === true, `${domain} repair requires human approval`);
  push(errors, Array.isArray(payload?.acceptanceChecks) && payload.acceptanceChecks.length > 0, `${domain} repair needs acceptance checks`);
}

function validateSceneSpec(payload, errors) {
  const zones = payload?.geography?.zones || [];
  const zoneIds = zones.map((item) => item?.zoneId);
  push(errors, zones.length >= 1 && unique(zoneIds), "SceneSpec zone IDs must be present and unique");
  const anchors = payload?.geography?.immutableAnchors || [];
  push(errors, anchors.length >= 3, "SceneSpec requires at least three immutable anchors");
  push(errors, unique(anchors.map((item) => item?.anchorId)), "SceneSpec anchor IDs must be unique");
  const knownZones = new Set(zoneIds);
  for (const connection of payload?.geography?.connections || []) {
    push(errors, knownZones.has(connection?.fromZone), `connection references unknown fromZone: ${connection?.fromZone}`);
    push(errors, knownZones.has(connection?.toZone), `connection references unknown toZone: ${connection?.toZone}`);
  }
  for (const item of payload?.geography?.entrancesExits || []) push(errors, knownZones.has(item?.zoneId), `entrance/exit references unknown zone: ${item?.zoneId}`);
  for (const item of payload?.architecture?.structures || []) push(errors, knownZones.has(item?.zoneId), `structure references unknown zone: ${item?.zoneId}`);
  for (const item of payload?.propLayout || []) push(errors, knownZones.has(item?.zoneId), `prop references unknown zone: ${item?.zoneId}`);
  for (const item of payload?.cameraTopology?.cameraAnchors || []) push(errors, knownZones.has(item?.zoneId), `camera anchor references unknown zone: ${item?.zoneId}`);
  const variableIds = (payload?.stateModel?.controllableVariables || []).map((item) => item?.variableId);
  push(errors, unique(variableIds), "SceneSpec controllable variable IDs must be unique");
}

function validateSceneState(payload, errors, sceneSpec) {
  const assignments = payload?.assignments || [];
  push(errors, unique(assignments.map((item) => item?.variableId)), "SceneState assignments must be unique");
  if (sceneSpec) {
    const declared = new Set((sceneSpec?.stateModel?.controllableVariables || []).map((item) => item?.variableId));
    for (const assignment of assignments) push(errors, declared.has(assignment?.variableId), `SceneState assigns undeclared variable: ${assignment?.variableId}`);
  }
  push(errors, payload?.validation?.geographyPreserved === true, "SceneState must preserve geography");
  push(errors, payload?.validation?.physicalLight === true, "SceneState must declare physical light");
  if (payload?.temporalContext) push(errors, nonEmpty(payload.temporalContext.continuityWindow), "SceneState temporal context requires a continuity window");
  if (payload?.backgroundState) push(errors, nonEmpty(payload.backgroundState.subjectSeparation), "SceneState background state requires subject separation logic");
}

function validateInteractionConstraints(constraints, errors, bindingIds = []) {
  const contacts = constraints?.contacts || [];
  push(errors, unique(contacts.map((item) => item?.contactId)), "Interaction contact IDs must be unique");
  const known = new Set(bindingIds);
  for (const list of [constraints?.contacts || [], constraints?.supports || [], constraints?.lightingResponse || [], constraints?.environmentResponse || [], constraints?.propInteractions || []]) {
    for (const item of list) if (known.size) push(errors, known.has(item?.subjectBindingId), `Interaction references unknown subject binding: ${item?.subjectBindingId}`);
  }
  const edges = new Set();
  for (const item of constraints?.occlusions || []) {
    const key = `${item.frontRef}>${item.backRef}`;
    const reverse = `${item.backRef}>${item.frontRef}`;
    push(errors, !edges.has(reverse), `Interaction occlusion cycle detected: ${key}`);
    edges.add(key);
  }
  for (const item of contacts.filter((entry) => entry?.required)) push(errors, nonEmpty(item.targetRef) && nonEmpty(item.subjectPart), `Required contact ${item.contactId} must be grounded`);
}

function validateInteractionSet(payload, errors) {
  const bindingIds = (payload?.characterBindingRefs || []).map((item) => item?.bindingId);
  push(errors, unique(bindingIds), "Interaction character binding refs must be unique");
  validateInteractionConstraints(payload?.constraints, errors, bindingIds);
  push(errors, payload?.validation?.contactsGrounded === true, "Interaction set must assert grounded contacts");
  push(errors, payload?.validation?.lightingMotivated === true, "Interaction set must assert motivated lighting");
}

function validateSceneBinding(payload, errors, sceneSpec) {
  push(errors, Array.isArray(payload?.activeAnchorIds) && payload.activeAnchorIds.length > 0, "SceneBinding requires active anchors");
  push(errors, Array.isArray(payload?.activeZoneIds) && payload.activeZoneIds.length > 0, "SceneBinding requires active zones");
  push(errors, nonEmpty(payload?.cameraPlacement?.axisId), "SceneBinding requires a camera axis");
  if (sceneSpec) {
    const anchors = new Set((sceneSpec?.geography?.immutableAnchors || []).map((item) => item?.anchorId));
    const zones = new Set((sceneSpec?.geography?.zones || []).map((item) => item?.zoneId));
    const cameraAnchors = new Set((sceneSpec?.cameraTopology?.cameraAnchors || []).map((item) => item?.cameraAnchorId));
    const axes = new Set((sceneSpec?.cameraTopology?.safeAxes || []).map((item) => item?.axisId));
    for (const id of payload.activeAnchorIds || []) push(errors, anchors.has(id), `SceneBinding references unknown anchor: ${id}`);
    for (const id of payload.activeZoneIds || []) push(errors, zones.has(id), `SceneBinding references unknown zone: ${id}`);
    push(errors, cameraAnchors.has(payload?.cameraPlacement?.cameraAnchorId), `SceneBinding references unknown camera anchor: ${payload?.cameraPlacement?.cameraAnchorId}`);
    push(errors, axes.has(payload?.cameraPlacement?.axisId), `SceneBinding references unknown axis: ${payload?.cameraPlacement?.axisId}`);
  }
  if (payload?.interactionConstraints) validateInteractionConstraints(payload.interactionConstraints, errors);
}

function validateAssetRecipe(payload, errors, controlSet) {
  const tasks = payload?.tasks || [];
  const taskIds = tasks.map((item) => item?.taskId);
  push(errors, unique(taskIds), "AssetRecipe task IDs must be unique");
  for (const task of tasks) push(errors, Array.isArray(task?.delta) && task.delta.length === 1, `${task?.taskId}: AssetRecipe task must change exactly one primary delta`);
  const order = payload?.assembly?.ordering || [];
  push(errors, order.length === tasks.length && order.every((id) => taskIds.includes(id)), "AssetRecipe assembly ordering must contain every task exactly once");
  push(errors, unique(order), "AssetRecipe assembly ordering must be unique");
  if (payload?.layout?.type === "contact_sheet" || payload?.layout?.type === "grid" || payload?.layout?.type === "turnaround") {
    push(errors, payload?.assembly?.mode === "deterministic_grid", "Grid recipes require deterministic_grid assembly");
    push(errors, payload?.retryPolicy?.strategy === "failed_tasks_only", "Grid recipes must retry failed tasks only");
  }
  if (controlSet) {
    const known = new Set((controlSet.channels || []).map((item) => item.channelId));
    for (const task of tasks) for (const id of task.controlChannelIds || []) push(errors, known.has(id), `${task.taskId}: unknown control channel ${id}`);
  }
  push(errors, payload?.executionBoundary?.generatesMedia === false, "AssetRecipe must not claim media generation");
}

function validateControlSet(payload, errors) {
  const channels = payload?.channels || [];
  push(errors, unique(channels.map((item) => item?.channelId)), "ControlChannel IDs must be unique");
  for (const channel of channels) {
    if (channel?.enforcement === "hard") push(errors, channel?.fallback?.action === "block", `${channel.channelId}: hard control must block on failure`);
    if (channel?.enforcement === "advisory") push(errors, channel?.priority < 500, `${channel.channelId}: advisory control priority must remain below 500`);
    push(errors, nonEmpty(channel?.source?.ref), `${channel.channelId}: source ref is required`);
  }
  push(errors, payload?.conflictResolution?.lowerPriorityCannotOverrideHard === true, "Control set must protect hard controls from lower priority overrides");
}

function validateEvidenceBundle(payload, errors) {
  const evidence = payload?.evidence || [];
  push(errors, unique(evidence.map((item) => item?.evidenceId)), "Evidence IDs must be unique");
  push(errors, unique(evidence.map((item) => item?.observationId)), "Evidence Observation IDs must be unique");
  const roles = new Set(evidence.map((item) => item?.role));
  for (const role of payload?.requirements?.requiredRoles || []) push(errors, roles.has(role), `Evidence bundle is missing required role: ${role}`);
  for (const item of evidence) {
    push(errors, item?.quality?.confidence >= payload?.requirements?.minimumConfidence, `${item?.evidenceId}: confidence is below bundle minimum`);
    push(errors, isObject(item?.licenseProfileRef), `${item?.evidenceId}: license profile is required`);
  }
  if (payload?.requirements?.missingEvidencePolicy === "block") push(errors, payload?.rightsResolution?.allProfilesResolved === true, "Blocking evidence bundle requires all rights profiles resolved");
}

function validateCapabilityProfile(payload, errors) {
  const capabilities = payload?.capabilities || [];
  push(errors, unique(capabilities.map((item) => item?.capabilityId)), "Capability IDs must be unique");
  push(errors, Array.isArray(payload?.licenseProfileRefs) && payload.licenseProfileRefs.length > 0, "Capability profile requires license profiles");
  push(errors, payload?.matchingPolicy?.hardRequirementPolicy === "block", "Hard capability mismatch must block");
}

function validateLicenseProfile(payload, errors) {
  if (payload?.commercialUse === "allowed") {
    push(errors, payload?.status === "verified", "Commercial use allowed requires verified status");
    push(errors, (payload?.evidence || []).some((item) => item?.status === "verified"), "Commercial use allowed requires verified evidence");
  }
  push(errors, payload?.validation?.noAssumedCommercialUse === true, "License profile must not assume commercial use");
}

function validateBenchmark(payload, errors) {
  const metrics = payload?.metrics || [];
  const metricIds = metrics.map((item) => item?.metricId);
  const dimensions = payload?.dimensions || [];
  const cases = payload?.cases || [];
  push(errors, unique(metricIds), "Benchmark metric IDs must be unique");
  push(errors, unique(dimensions.map((item) => item?.dimensionId)), "Benchmark dimension IDs must be unique");
  push(errors, unique(cases.map((item) => item?.caseId)), "Benchmark case IDs must be unique");
  const known = new Set(metricIds);
  for (const dimension of dimensions) for (const id of dimension.metricIds || []) push(errors, known.has(id), `${dimension.dimensionId}: unknown metric ${id}`);
  push(errors, cases.some((item) => item?.category === "rights"), "ControlBench must include a rights case");
  push(errors, payload?.acceptance?.blockingDimensionPassRate === 1, "Blocking dimensions require perfect pass rate");
}

function validateIntegratedImage(payload, errors) {
  const sceneBlocks = ["sceneGeography", "sceneArchitecture", "sceneMaterials", "sceneLighting", "sceneAtmosphere", "spatialContinuity"];
  const hasSceneBlocks = sceneBlocks.some((name) => Array.isArray(payload?.promptBlocks?.[name]) && payload.promptBlocks[name].length > 0);
  if (hasSceneBlocks) push(errors, isObject(payload?.sceneBinding), "Scene prompt blocks require sceneBinding");
  if (Array.isArray(payload?.characterBindings) && payload.characterBindings.length > 0) push(errors, payload?.validation?.characterBindingsResolved === true, "Character bindings must be marked resolved");
  if (payload?.sceneBinding) push(errors, payload?.validation?.sceneBindingResolved === true, "Scene binding must be marked resolved");
  if (payload?.sceneBinding && payload?.characterBindings?.length) push(errors, payload?.validation?.crossSkillReceiptsChecked === true, "Integrated prompt must check cross-skill receipts");
  if (payload?.productionContext) push(errors, payload?.validation?.productionContextResolved === true, "Production context must be marked resolved");
  const hasInteraction = Array.isArray(payload?.promptBlocks?.sceneInteraction) && payload.promptBlocks.sceneInteraction.length > 0;
  if (hasInteraction) {
    push(errors, isObject(payload?.sceneBinding?.interactionConstraints), "sceneInteraction prompt block requires resolved interaction constraints");
    push(errors, payload?.validation?.interactionConstraintsResolved === true, "Interaction constraints must be marked resolved");
  }
}

function validateIntegratedStoryboard(payload, errors) {
  for (const shot of payload?.shots || []) {
    if (shot.sceneBinding) {
      push(errors, nonEmpty(shot?.continuity?.sceneState), `${shot.shotId}: sceneBinding requires continuity.sceneState`);
      push(errors, Array.isArray(shot?.continuity?.geographyAnchors) && shot.continuity.geographyAnchors.length > 0, `${shot.shotId}: sceneBinding requires geographyAnchors`);
    }
    if (shot.interactionConstraints || shot?.sceneBinding?.interactionConstraints) {
      push(errors, nonEmpty(shot?.continuity?.interactionState), `${shot.shotId}: interaction constraints require continuity.interactionState`);
      push(errors, nonEmpty(shot?.continuity?.propState), `${shot.shotId}: interaction constraints require continuity.propState`);
    }
  }
}

function validateByKind(payload, context = {}) {
  const errors = [];
  switch (payload?.kind) {
    case "cineweave_codex_character_spec": validateCharacterSpec(payload, errors); break;
    case "cineweave_codex_character_reference_plan": validateCharacterReferencePlan(payload, errors); break;
    case "cineweave_codex_character_appearance_state": validateAppearanceState(payload, errors); break;
    case "cineweave_codex_character_review": validateReview(payload, errors, "Character"); break;
    case "cineweave_codex_character_repair": validateRepair(payload, errors, "Character"); break;
    case "cineweave_codex_scene_spec": validateSceneSpec(payload, errors); break;
    case "cineweave_codex_scene_state": validateSceneState(payload, errors, context.sceneSpec); break;
    case "cineweave_codex_scene_reference_plan": push(errors, payload?.validation?.geographyFirst === true, "SceneReferencePlan must be geography-first"); break;
    case "cineweave_codex_interaction_constraint_set": validateInteractionSet(payload, errors); break;
    case "cineweave_codex_scene_review": validateReview(payload, errors, "Scene"); break;
    case "cineweave_codex_scene_repair": validateRepair(payload, errors, "Scene"); break;
    case "cineweave_codex_asset_recipe": validateAssetRecipe(payload, errors, context.controlSet); break;
    case "cineweave_codex_control_channel_set": validateControlSet(payload, errors); break;
    case "cineweave_codex_evidence_bundle": validateEvidenceBundle(payload, errors); break;
    case "cineweave_codex_capability_profile": validateCapabilityProfile(payload, errors); break;
    case "cineweave_codex_license_profile": validateLicenseProfile(payload, errors); break;
    case "cineweave_codex_control_benchmark": validateBenchmark(payload, errors); break;
    case "cineweave_codex_image_prompt": validateIntegratedImage(payload, errors); break;
    case "cineweave_codex_storyboard_sequence": validateIntegratedStoryboard(payload, errors); break;
    default:
      if (payload?.characterSpecRef && payload?.performanceState) validateCharacterBinding(payload, errors);
      else if (payload?.sceneSpecRef && payload?.cameraPlacement) validateSceneBinding(payload, errors, context.sceneSpec);
  }
  return errors;
}

async function readJson(relativePath) { return JSON.parse(await readFile(resolve(repoRoot, relativePath), "utf8")); }

async function runSelfTest(mode = "all") {
  const sceneSpec = await readJson("examples/scene-spec.json");
  const controlSet = await readJson("examples/control-channel-set.json");
  const cases = [
    ["examples/character-spec.json", {}], ["examples/character-binding.json", {}], ["examples/character-reference-plan.json", {}], ["examples/character-appearance-state.json", {}], ["examples/character-review.json", {}], ["examples/character-repair.json", {}],
  ];
  if (mode === "all") cases.push(
    ["examples/scene-spec.json", {}], ["examples/scene-state.json", { sceneSpec }], ["examples/scene-binding.json", { sceneSpec }], ["examples/scene-reference-plan.json", { sceneSpec }], ["examples/interaction-constraint-set.json", {}], ["examples/scene-review.json", { sceneSpec }], ["examples/scene-repair.json", { sceneSpec }],
    ["examples/asset-recipe.json", { controlSet }], ["examples/control-channel-set.json", {}], ["examples/evidence-bundle.json", {}], ["examples/capability-profile.json", {}], ["examples/license-profile.json", {}], ["examples/control-benchmark.json", {}],
    ["examples/v1-integrated-image-prompt.json", { sceneSpec }], ["examples/v1-integrated-storyboard.json", { sceneSpec }],
  );

  let ok = true;
  for (const [path, context] of cases) {
    const payload = await readJson(path);
    const errors = validateByKind(payload, context);
    if (errors.length) {
      ok = false;
      console.error(`Semantic validation failed: ${path}`);
      for (const error of errors) console.error(`- ${error}`);
    } else console.log(`Semantic pass: ${path}`);
  }

  const negative = [];
  const badReview = await readJson("examples/character-review.json"); badReview.decision.nextAction = "accept"; negative.push(["reject accept with blocking character failure", badReview, {}]);
  const badScene = await readJson("examples/scene-spec.json"); badScene.geography.connections[0].toZone = "zone.unknown"; negative.push(["reject unknown SceneSpec zone", badScene, {}]);
  const badPrompt = await readJson("examples/v1-integrated-image-prompt.json"); delete badPrompt.sceneBinding; negative.push(["reject scene blocks without SceneBinding", badPrompt, {}]);
  const badControl = await readJson("examples/control-channel-set.json"); badControl.channels[0].fallback.action = "warn"; negative.push(["reject hard control that does not block", badControl, {}]);
  const badRecipe = await readJson("examples/asset-recipe.json"); badRecipe.assembly.ordering.pop(); negative.push(["reject incomplete recipe assembly", badRecipe, { controlSet }]);
  const badEvidence = await readJson("examples/evidence-bundle.json"); badEvidence.evidence = badEvidence.evidence.filter((item) => item.role !== "body_identity"); negative.push(["reject missing required evidence role", badEvidence, {}]);
  const badCapability = await readJson("examples/capability-profile.json"); badCapability.capabilities.push(structuredClone(badCapability.capabilities[0])); negative.push(["reject duplicate capability", badCapability, {}]);
  const badInteraction = await readJson("examples/interaction-constraint-set.json"); badInteraction.constraints.occlusions.push({ frontRef: badInteraction.constraints.occlusions[0].backRef, backRef: badInteraction.constraints.occlusions[0].frontRef, region: "reverse", ordering: "front_before_back" }); negative.push(["reject cyclic occlusion", badInteraction, {}]);

  if (mode === "all") for (const [label, payload, context] of negative) {
    const errors = validateByKind(payload, context);
    if (!errors.length) { ok = false; console.error(`Negative semantic test failed: ${label}`); }
    else console.log(`Rejected as expected: ${label}`);
  }
  return ok;
}

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--self-test") { process.exitCode = (await runSelfTest("all")) ? 0 : 1; return; }
  if (args[0] === "--character-self-test") { process.exitCode = (await runSelfTest("character")) ? 0 : 1; return; }
  if (args.length !== 1) { console.error("Usage: node scripts/validate-v1-semantics.mjs <payload.json> | --self-test | --character-self-test"); process.exitCode = 2; return; }
  const payload = JSON.parse(await readFile(resolve(args[0]), "utf8"));
  const errors = validateByKind(payload);
  if (errors.length) { console.error(JSON.stringify({ valid: false, errors }, null, 2)); process.exitCode = 2; return; }
  console.log(JSON.stringify({ valid: true, payload: resolve(args[0]) }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
