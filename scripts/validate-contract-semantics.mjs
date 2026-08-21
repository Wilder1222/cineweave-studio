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

function validateCharacterExplorationBrief(payload, errors) {
  const temperament = payload?.experienceAxes?.temperament || [];
  push(errors, temperament.length > 0 && unique(temperament.map((item) => item?.axisId)), "CharacterExplorationBrief temperament axis IDs must be unique");
  const weight = temperament.reduce((total, item) => total + (typeof item?.weight === "number" ? item.weight : 0), 0);
  push(errors, weight > 0 && weight <= 1.000001, "CharacterExplorationBrief temperament weights must total no more than 1");
  const locks = payload?.locks || {};
  const lockValues = ["hard", "soft", "free", "undefined"].flatMap((level) => locks[level] || []);
  push(errors, unique(lockValues), "CharacterExplorationBrief lock values must appear in one level only");
  for (const reference of payload?.referenceBindings || []) {
    const overlap = (reference?.preserve || []).filter((item) => (reference?.ignore || []).includes(item));
    push(errors, overlap.length === 0, `${reference?.referenceId}: preserve and ignore scopes must not overlap`);
  }
  push(errors, payload?.validation?.userControlsPreference === true, "CharacterExplorationBrief must keep preference under user control");
  push(errors, payload?.validation?.noUniversalBeautyScore === true, "CharacterExplorationBrief must prohibit universal beauty scores");
  push(errors, payload?.validation?.noBiometricInference === true, "CharacterExplorationBrief must prohibit biometric inference");
  push(errors, payload?.validation?.styleDoesNotOwnIdentity === true, "CharacterExplorationBrief must keep style separate from identity");
  push(errors, payload?.executionBoundary?.generatesMedia === false, "CharacterExplorationBrief must not claim media generation");
}

function validateCharacterOptionSet(payload, errors) {
  const options = payload?.options || [];
  push(errors, options.length >= 2 && options.length <= 6, "CharacterOptionSet requires two to six options");
  push(errors, unique(options.map((item) => item?.optionId)), "CharacterOptionSet option IDs must be unique");
  for (const option of options) {
    push(errors, option?.primaryDelta?.axis === payload?.explorationAxis, `${option?.optionId}: primary delta must match the option set exploration axis`);
    push(errors, option?.primaryDelta?.direction && option?.primaryDelta?.hypothesis, `${option?.optionId}: primary delta requires direction and hypothesis`);
  }
  push(errors, payload?.qualityGate?.blocksIdentityLockOnFailure === true, "CharacterOptionSet quality gate must block identity lock on failure");
  push(errors, payload?.qualityGate?.doesNotScoreAttractiveness === true, "CharacterOptionSet must not score attractiveness");
  push(errors, payload?.selectionPolicy?.requiresHumanSelection === true, "CharacterOptionSet requires human selection");
  push(errors, payload?.selectionPolicy?.onePrimaryDeltaPerRound === true, "CharacterOptionSet requires one primary delta per round");
  push(errors, payload?.selectionPolicy?.convergenceRequiresNeutralEvidence === true, "CharacterOptionSet requires neutral evidence before convergence");
  push(errors, payload?.validation?.sharedFixtureLocked === true, "CharacterOptionSet must lock the shared fixture");
  push(errors, payload?.validation?.onePrimaryDeltaPerOption === true, "CharacterOptionSet must declare one primary delta per option");
  push(errors, payload?.validation?.noUniversalBeautyScore === true, "CharacterOptionSet must prohibit universal beauty scores");
  push(errors, payload?.executionBoundary?.generatesMedia === false, "CharacterOptionSet must not claim media generation");
}

function validateCharacterPreferenceFeedback(payload, errors) {
  const signals = payload?.signals || [];
  push(errors, unique(signals.map((item) => item?.signalId)), "CharacterPreferenceFeedback signal IDs must be unique");
  for (const signal of signals) {
    if (signal?.type === "compare") {
      push(errors, nonEmpty(signal?.comparisonOptionId), `${signal?.signalId}: compare feedback requires comparisonOptionId`);
      push(errors, signal?.comparisonOptionId !== signal?.optionId, `${signal?.signalId}: compare feedback must name a different option`);
    }
  }
  if (payload?.convergence?.nextAction === "draft_character_spec") push(errors, (payload?.convergence?.selectedOptionIds || []).length > 0, "CharacterPreferenceFeedback needs a selected option before drafting CharacterSpec");
  push(errors, payload?.convergence?.identityLockRequested === false, "CharacterPreferenceFeedback cannot auto-lock identity");
  push(errors, payload?.policy?.userCanEditOrDelete === true, "CharacterPreferenceFeedback must remain editable and deletable by the user");
  push(errors, payload?.policy?.universalBeautyScoreProhibited === true, "CharacterPreferenceFeedback must prohibit universal beauty scores");
  push(errors, payload?.policy?.sensitiveInferenceProhibited === true, "CharacterPreferenceFeedback must prohibit sensitive inference");
  push(errors, payload?.policy?.realPersonLikenessNotInferred === true, "CharacterPreferenceFeedback must not infer real-person likeness");
  push(errors, payload?.validation?.optionSetBound === true, "CharacterPreferenceFeedback must bind to an option set");
  push(errors, payload?.validation?.identityNotAutoLocked === true, "CharacterPreferenceFeedback must not auto-lock identity");
  push(errors, payload?.executionBoundary?.generatesMedia === false, "CharacterPreferenceFeedback must not claim media generation");
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

function validateAdapterDescriptor(payload, errors, capabilityProfile) {
  const operations = payload?.operations || [];
  push(errors, unique(operations.map((item) => item?.operationId)), "Adapter operation IDs must be unique");
  push(errors, payload?.security?.contractsMayContainSecrets === false, "Adapter contracts must forbid secrets");
  push(errors, payload?.security?.externalEffectsDefaultDenied === true, "Adapter external effects must default to denied");
  push(errors, payload?.security?.arbitraryCommandExecution === false, "Adapter descriptors must not authorize arbitrary commands");
  push(errors, payload?.security?.outputRootConstrained === true, "Adapter outputs must stay under the execution root");
  if ((payload?.executionModes || []).includes("external")) {
    push(errors, payload?.security?.networkAccess === "external_mode_only", "External adapters may use network only in external mode");
    push(errors, nonEmpty(payload?.security?.networkPolicyId), "External adapters require a network policy ID");
  } else {
    push(errors, payload?.security?.networkAccess === "forbidden", "Non-external adapters must forbid network access");
  }
  if (payload?.adapterClass === "fixture") {
    push(errors, !(payload?.executionModes || []).includes("external"), "Fixture adapters must not expose external mode");
    push(errors, (payload?.security?.credentialEnvVars || []).length === 0, "Fixture adapters must not request credentials");
  }
  if (capabilityProfile) {
    push(errors, payload?.adapterId === capabilityProfile?.adapterId, "AdapterDescriptor adapterId must match CapabilityProfile adapterId");
    push(errors, payload?.capabilityProfileRef?.kind === capabilityProfile?.kind, "AdapterDescriptor must bind the CapabilityProfile kind");
  }
}

function validateExecutionRequest(payload, errors) {
  const parameters = payload?.parameters || [];
  push(errors, unique(parameters.map((item) => item?.name)), "ExecutionRequest parameter names must be unique");
  const sensitiveName = /(?:api.?key|token|secret|password|credential|endpoint|signed.?url|url)/i;
  for (const parameter of parameters) {
    push(errors, !sensitiveName.test(parameter?.name || ""), `${parameter?.name}: sensitive or endpoint-like parameter names are forbidden`);
    push(errors, parameter?.sensitive === false, `${parameter?.name}: sensitive values must not enter an ExecutionRequest`);
  }
  push(errors, payload?.adapterDescriptorRef?.kind === "cineweave_adapter_descriptor", "ExecutionRequest must bind an AdapterDescriptor");
  push(errors, payload?.capabilityProfileRef?.kind === "cineweave_codex_capability_profile", "ExecutionRequest must bind a CapabilityProfile");
  push(errors, payload?.renderPlanRef?.kind === "cineweave_codex_render_plan", "ExecutionRequest must bind a RenderPlan");
  push(errors, ["cineweave_codex_prompt_record", "cineweave_codex_image_prompt"].includes(payload?.promptRef?.kind), "ExecutionRequest must bind a PromptRecord or ImagePrompt");
  const checks = ["exactRefsResolved", "operationSupported", "hardCapabilitiesSatisfied", "rightsResolved", "budgetResolved", "secretsAbsent"];
  const ready = checks.every((key) => payload?.preflight?.[key] === true);
  if (payload?.status === "ready" || payload?.preflight?.status === "ready") push(errors, ready, "Ready ExecutionRequest requires every preflight check to pass");
  if (payload?.executionMode === "external") {
    push(errors, payload?.authorization?.externalEffects === "exact_request_approval_required", "External execution requires exact-request approval");
    push(errors, payload?.authorization?.approvalScope === "exact_execution_request", "External approval scope must be the exact ExecutionRequest");
  } else {
    push(errors, payload?.authorization?.externalEffects === "denied", "Dry-run and fixture requests must deny external effects");
    push(errors, payload?.authorization?.approvalScope === "none", "Local-only requests must not claim an external approval scope");
  }
}

function validateExecutionReceipt(payload, errors, request) {
  const attempts = payload?.attempts || [];
  const outputs = payload?.outputs || [];
  push(errors, unique(outputs.map((item) => item?.outputId)), "ExecutionReceipt output IDs must be unique");
  push(errors, unique(outputs.map((item) => item?.storageRef)), "ExecutionReceipt storage refs must be unique");
  for (let index = 0; index < attempts.length; index += 1) push(errors, attempts[index]?.attempt === index + 1, "ExecutionReceipt attempts must be sequential from one");
  const totalCost = attempts.reduce((sum, item) => sum + Number(item?.costAmount || 0), 0);
  push(errors, Math.abs(totalCost - Number(payload?.costSummary?.actualAmount || 0)) < 1e-9, "ExecutionReceipt actual cost must include all attempts");
  if (payload?.status === "succeeded") {
    push(errors, outputs.length > 0, "Successful execution requires verified outputs");
    push(errors, payload?.failure === null, "Successful execution must not carry a failure");
    push(errors, attempts.length > 0 && attempts.at(-1)?.status === "succeeded", "Successful execution requires a successful final attempt");
    for (const key of ["adapterMatched", "requestHashMatched", "inputsMatched", "outputHashesVerified", "secretsAbsent", "externalSideEffectAuthorized"]) {
      push(errors, payload?.validation?.[key] === true, `Successful execution requires validation.${key}`);
    }
  }
  if (payload?.status === "dry_run") {
    push(errors, payload?.executionMode === "dry_run", "Dry-run status requires dry_run execution mode");
    push(errors, outputs.length === 0, "Dry-run receipt must not claim media outputs");
    push(errors, attempts.length === 0, "Dry-run receipt must not claim adapter attempts");
    push(errors, payload?.failure === null, "Successful dry-run must not carry a failure");
  }
  if (payload?.status === "failed") {
    push(errors, isObject(payload?.failure), "Failed execution requires a normalized failure");
    push(errors, attempts.length > 0 && attempts.at(-1)?.status === "failed", "Failed execution requires a failed final attempt");
    push(errors, outputs.length === 0, "Failed execution must not claim completed outputs");
  }
  if (payload?.status === "blocked") {
    push(errors, isObject(payload?.failure), "Blocked execution requires a normalized failure");
    push(errors, attempts.length === 0, "Blocked execution must occur before adapter attempts");
    push(errors, outputs.length === 0, "Blocked execution must not claim outputs");
  }
  if (payload?.executionMode === "external") {
    push(errors, payload?.authorizationEvidence?.required === true, "External receipt requires authorization evidence");
    if (payload?.status === "blocked") {
      const decision = payload?.authorizationEvidence?.decision;
      push(errors, ["approved", "missing", "rejected"].includes(decision), "Blocked external receipt has an invalid authorization decision");
      if (decision === "missing") {
        push(errors, payload?.authorizationEvidence?.approvalRecordHash === null, "Missing external approval must not claim an approval hash");
        push(errors, payload?.authorizationEvidence?.exactRequestHashMatched === false, "Missing external approval cannot claim an exact hash match");
      } else {
        push(errors, payload?.authorizationEvidence?.exactRequestHashMatched === true, "External decision must match the exact request hash");
        push(errors, nonEmpty(payload?.authorizationEvidence?.approvalRecordHash), "External decision requires an approval record hash");
      }
      push(errors, payload?.validation?.externalSideEffectAuthorized === false, "Blocked external execution must not claim authorized side effects");
    } else {
      push(errors, payload?.authorizationEvidence?.decision === "approved", "Attempted external execution must record an approved decision");
      push(errors, payload?.authorizationEvidence?.exactRequestHashMatched === true, "External approval must match the exact request hash");
      push(errors, nonEmpty(payload?.authorizationEvidence?.approvalRecordHash), "External receipt requires an approval record hash");
      push(errors, payload?.validation?.externalSideEffectAuthorized === true, "Attempted external execution requires authorized side effects");
    }
  } else {
    push(errors, payload?.authorizationEvidence?.required === false, "Local-only receipt must not claim external authorization was required");
    push(errors, payload?.authorizationEvidence?.decision === "not_required", "Local-only receipt authorization decision must be not_required");
  }
  if (request) {
    push(errors, payload?.idempotencyKey === request?.idempotencyKey, "ExecutionReceipt idempotency key must match its request");
    push(errors, payload?.executionMode === request?.executionMode, "ExecutionReceipt mode must match its request");
    push(errors, payload?.costSummary?.currency === request?.budget?.currency, "ExecutionReceipt currency must match its request budget");
    push(errors, payload?.costSummary?.actualAmount <= request?.budget?.maxAmount, "ExecutionReceipt cost exceeds request budget");
    push(errors, attempts.length <= request?.budget?.maxAttempts, "ExecutionReceipt attempts exceed request budget");
  }
}

function validateSkillEvaluationRun(payload, errors) {
  const results = payload?.results || [];
  const datasetCaseIds = payload?.dataset?.caseIds || [];
  const resultCaseIds = results.map((item) => item?.caseId);
  push(errors, unique(resultCaseIds), "SkillEvaluationRun case result IDs must be unique");
  push(errors, datasetCaseIds.length === resultCaseIds.length && datasetCaseIds.every((id, index) => id === resultCaseIds[index]), "SkillEvaluationRun results must preserve the declared dataset case order");
  push(errors, Date.parse(payload?.startedAt) <= Date.parse(payload?.finishedAt), "SkillEvaluationRun finish time must not precede start time");

  for (const result of results) {
    const checks = result?.checks || [];
    const errorsForCase = result?.errors || [];
    push(errors, unique(checks.map((item) => item?.checkId)), `${result?.caseId}: check IDs must be unique`);
    const hasFailedCheck = checks.some((item) => item?.status === "fail");
    if (result?.status === "pass") {
      push(errors, checks.length > 0 && !hasFailedCheck && errorsForCase.length === 0, `${result?.caseId}: pass requires passing checks and no errors`);
      push(errors, nonEmpty(result?.responseHash), `${result?.caseId}: pass requires a response hash`);
    } else if (result?.status === "fail") {
      push(errors, hasFailedCheck && errorsForCase.length === 0, `${result?.caseId}: fail requires a failed check and no runner error`);
      push(errors, nonEmpty(result?.responseHash), `${result?.caseId}: graded failure requires a response hash`);
    } else if (result?.status === "error") {
      push(errors, errorsForCase.length > 0, `${result?.caseId}: error requires runner error evidence`);
    }
  }

  const passed = results.filter((item) => item?.status === "pass").length;
  const failed = results.filter((item) => item?.status === "fail").length;
  const runnerErrors = results.filter((item) => item?.status === "error").length;
  const activationChecks = results.flatMap((item) => item?.checks || []).filter((item) => item?.scope === "activation");
  const outputChecks = results.flatMap((item) => item?.checks || []).filter((item) => ["output", "safety"].includes(item?.scope));
  const passRate = (checks) => checks.length ? checks.filter((item) => item?.status === "pass").length / checks.length : 1;
  const close = (left, right) => Math.abs(Number(left) - Number(right)) < 1e-12;
  push(errors, payload?.summary?.total === results.length, "SkillEvaluationRun summary total must equal result count");
  push(errors, payload?.summary?.passed === passed && payload?.summary?.failed === failed && payload?.summary?.errors === runnerErrors, "SkillEvaluationRun summary status counts are inconsistent");
  push(errors, close(payload?.summary?.activationPassRate, passRate(activationChecks)), "SkillEvaluationRun activation pass rate is inconsistent");
  push(errors, close(payload?.summary?.outputPassRate, passRate(outputChecks)), "SkillEvaluationRun output pass rate is inconsistent");
  push(errors, payload?.summary?.releaseGatePassed === results.every((item) => item?.status === "pass"), "SkillEvaluationRun release gate is inconsistent");
  if (payload?.mode === "fixture_replay") {
    push(errors, payload?.environment?.sandbox === "fixture-replay", "Fixture replay must declare the fixture-replay sandbox");
    push(errors, payload?.environment?.pluginSourceRef === null, "Fixture replay must not claim an installed plugin source ref");
    push(errors, payload?.privacy?.rawResponsePolicy === "discarded", "Fixture replay must discard raw responses");
  } else if (payload?.mode === "live_codex") {
    push(errors, payload?.environment?.sandbox === "read-only", "Live Codex evaluation must use a read-only sandbox");
    push(errors, payload?.environment?.pluginSourceRef === `v${payload?.environment?.pluginVersion}`, "Live Codex evaluation must bind the immutable installed plugin tag");
    push(errors, payload?.privacy?.rawResponsePolicy === "local_uncommitted", "Live Codex responses must remain local and uncommitted");
  }
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
  if (payload?.styleBinding) validateStyleBinding(payload.styleBinding, errors, "Image Prompt style binding");
}

function validateStyleBinding(binding, errors, label = "Style binding") {
  const mode = binding?.mode;
  push(errors, ["inline_atoms", "package", "compiled"].includes(mode), `${label} mode is invalid`);
  push(errors, binding?.visualTemporalSeparated === true, `${label} must separate visual and temporal style`);
  push(errors, Array.isArray(binding?.preserve) && binding.preserve.length > 0, `${label} requires preserve rules`);
  push(errors, Array.isArray(binding?.allowedVariation) && binding.allowedVariation.length > 0, `${label} requires bounded variation`);
  push(errors, Array.isArray(binding?.forbidden) && binding.forbidden.length > 0, `${label} requires forbidden rules`);
  if (mode === "inline_atoms") push(errors, Array.isArray(binding?.atoms) && binding.atoms.length > 0, `${label} inline_atoms requires atoms`);
  if (mode === "package" || mode === "compiled") push(errors, isObject(binding?.stylePackageRef), `${label} package mode requires an exact StylePackage ref`);
  if (mode === "compiled") push(errors, isObject(binding?.styleCompileRef), `${label} compiled mode requires an exact StyleCompile ref`);
}

function validatePromptRecord(payload, errors) {
  if (payload?.styleBinding) validateStyleBinding(payload.styleBinding, errors, "PromptRecord style binding");
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

function validateStylePackage(payload, errors) {
  const atoms = payload?.atoms || [];
  const atomIds = atoms.map((item) => item?.atomId);
  push(errors, atoms.length > 0 && unique(atomIds), "StylePackage atom IDs must be present and unique");
  const knownAtoms = new Set(atomIds);
  for (const ref of payload?.recipe?.atomRefs || []) push(errors, knownAtoms.has(ref?.atomId), `StyleRecipe references unknown atom: ${ref?.atomId}`);
  push(errors, Array.isArray(payload?.semanticSpec?.visualDna) && payload.semanticSpec.visualDna.length > 0, "StylePackage requires visual DNA");
  push(errors, Array.isArray(payload?.semanticSpec?.temporalDna) && payload.semanticSpec.temporalDna.length > 0, "StylePackage requires temporal DNA");
  push(errors, Array.isArray(payload?.validationSuite?.cases) && payload.validationSuite.cases.length >= 2, "StylePackage requires positive and boundary validation cases");
  push(errors, payload?.activationGate?.humanApprovalRequired === true, "StylePackage activation requires a human gate");
  if (payload?.status === "active") {
    push(errors, payload?.activationGate?.status === "approved", "Active StylePackage requires approved activation gate");
    push(errors, payload?.activationGate?.rightsResolved === true, "Active StylePackage requires resolved rights");
    push(errors, payload?.activationGate?.validationPassed === true, "Active StylePackage requires passed validation");
  }
  push(errors, payload?.executionBoundary?.generatesMedia === false, "StylePackage must not claim media generation");
}

function validateStyleReferencePlan(payload, errors) {
  const refs = payload?.references || [];
  push(errors, unique(refs.map((item) => item?.referenceId)), "StyleReferencePlan reference IDs must be unique");
  for (const ref of refs) {
    push(errors, Array.isArray(ref?.extract) && ref.extract.length > 0, `${ref?.referenceId}: extraction scope is required`);
    push(errors, Array.isArray(ref?.ignore) && ref.ignore.length > 0, `${ref?.referenceId}: ignore scope is required`);
    if (ref?.sourceType === "video") push(errors, ["camera_motion", "performance", "temporal_atmosphere"].includes(ref?.role), `${ref?.referenceId}: video reference must use a temporal role`);
  }
  push(errors, payload?.validation?.temporalRolesSeparated === true, "StyleReferencePlan must separate temporal roles");
}

function validateStyleCompile(payload, errors) {
  const channels = payload?.blocks || [];
  push(errors, unique(channels.map((item) => item?.channel)), "StyleCompile channels must be unique");
  push(errors, payload?.validation?.identityNotOverwritten === true, "StyleCompile must preserve identity");
  push(errors, payload?.validation?.sceneNotOverwritten === true, "StyleCompile must preserve scene facts");
  push(errors, payload?.validation?.temporalSeparated === true, "StyleCompile must separate temporal directives");
  push(errors, payload?.executionBoundary?.generatesMedia === false, "StyleCompile must not claim media generation");
}

function validateStyleReview(payload, errors) {
  push(errors, unique((payload?.dimensions || []).map((item) => item?.dimensionId)), "StyleReview dimensions must be unique");
  push(errors, (payload?.candidateObservationIds || []).length > 0, "StyleReview requires candidate Observation IDs");
  if (payload?.decision?.nextAction === "repair") push(errors, nonEmpty(payload?.decision?.smallestRepairVariable), "StyleReview repair requires one smallest variable");
  push(errors, payload?.validation?.identityPreserved === true, "StyleReview must state identity preservation");
}

function validateCreativeBrief(payload, errors) {
  const stages = payload?.stagePlan || [];
  push(errors, stages.length > 0 && unique(stages.map((item) => item?.stageId)), "CreativeBrief stage IDs must be present and unique");
  push(errors, Array.isArray(payload?.locks?.hard) && Array.isArray(payload?.locks?.soft) && Array.isArray(payload?.locks?.free) && Array.isArray(payload?.locks?.undefined), "CreativeBrief requires four lock levels");
  push(errors, payload?.styleSelection?.temporalRequired !== undefined, "CreativeBrief must declare temporal style requirement");
  for (const item of payload?.missingHighImpact || []) push(errors, item?.impact === "high" || item?.impact === "medium", "CreativeBrief missing questions must be prioritized");
  push(errors, payload?.validation?.styleDoesNotOwnIdentity === true, "CreativeBrief must keep style separate from identity");
}

function validateWorkflowPlan(payload, errors) {
  const steps = payload?.steps || [];
  const stepIds = steps.map((item) => item?.stepId);
  push(errors, steps.length > 0 && unique(stepIds), "WorkflowPlan requires unique step IDs");
  const known = new Set(stepIds);
  for (const step of steps) {
    push(errors, step?.skill !== "cineweave", `${step?.stepId}: WorkflowPlan steps must target a specialist Skill`);
    push(errors, Array.isArray(step?.requires), `${step?.stepId}: WorkflowPlan requires must be an array`);
    push(errors, Array.isArray(step?.produces) && step.produces.length > 0, `${step?.stepId}: WorkflowPlan must declare produced contracts`);
    for (const dependency of step?.dependsOn || []) push(errors, known.has(dependency) && dependency !== step.stepId, `${step?.stepId}: WorkflowPlan has an unknown or self dependency`);
  }
  const visiting = new Set(); const visited = new Set();
  const lookup = new Map(steps.map((step) => [step.stepId, step]));
  const visit = (id) => {
    if (visiting.has(id)) return false;
    if (visited.has(id)) return true;
    visiting.add(id);
    for (const dependency of lookup.get(id)?.dependsOn || []) if (!visit(dependency)) return false;
    visiting.delete(id); visited.add(id); return true;
  };
  for (const id of stepIds) push(errors, visit(id), "WorkflowPlan must be acyclic");
  for (const output of payload?.outputs || []) push(errors, known.has(output?.producer), "WorkflowPlan output producer must name a step");
  push(errors, payload?.executionBoundary?.generatesMedia === false, "WorkflowPlan must not claim media generation");
  push(errors, payload?.executionBoundary?.requiresHumanApproval === true, "WorkflowPlan requires a human execution gate");
}

function validateStoryBrief(payload, errors) {
  push(errors, nonEmpty(payload?.dramaticQuestion), "StoryBrief requires one dramatic question");
  for (const key of ["want", "need", "fear", "contradiction"]) push(errors, nonEmpty(payload?.protagonist?.[key]), `StoryBrief protagonist.${key} is required`);
  push(errors, payload?.validation?.protagonistCausality === true, "StoryBrief must be protagonist-causal");
  push(errors, payload?.validation?.stakesEscalate === true, "StoryBrief stakes must escalate");
  push(errors, payload?.validation?.noShotDecisions === true, "StoryBrief cannot own shot decisions");
}

function validateBeatSheet(payload, errors) {
  const beats = payload?.beats || [];
  push(errors, unique(beats.map((item) => item?.beatId)), "BeatSheet beat IDs must be unique");
  beats.forEach((beat, index) => {
    push(errors, beat?.order === index + 1, `${beat?.beatId}: BeatSheet order must be contiguous`);
    for (const key of ["objective", "conflict", "choice", "change", "causesNext"]) push(errors, nonEmpty(beat?.[key]), `${beat?.beatId}: ${key} is required`);
  });
  const shares = beats.map((item) => item?.estimatedShare).filter((value) => typeof value === "number");
  if (shares.length === beats.length) push(errors, Math.abs(shares.reduce((a, b) => a + b, 0) - 1) <= 0.001, "BeatSheet estimated shares must total 1");
  push(errors, payload?.validation?.causal === true, "BeatSheet must declare causal structure");
}

function validateScriptScene(payload, errors) {
  const participantIds = new Set((payload?.participants || []).map((item) => item?.participantId));
  const beats = payload?.beats || [];
  beats.forEach((beat, index) => {
    push(errors, beat?.order === index + 1, `ScriptScene beat ${index + 1} order must be contiguous`);
    if (beat?.speakerId) push(errors, participantIds.has(beat.speakerId), `ScriptScene references unknown speaker ${beat.speakerId}`);
  });
  push(errors, payload?.entryState !== payload?.exitState, "ScriptScene exit state must differ from entry state");
  push(errors, payload?.validation?.noCameraDirections === true, "ScriptScene cannot own camera directions");
}

function validateContinuityLedger(payload, errors) {
  const entries = payload?.entries || [];
  push(errors, unique(entries.map((item) => item?.entryId)), "ContinuityLedger entry IDs must be unique");
  for (const entry of entries) push(errors, Array.isArray(entry?.sourceRefs) && entry.sourceRefs.length > 0, `${entry?.entryId}: continuity fact needs exact sources`);
  push(errors, payload?.validation?.noSilentOverwrite === true, "ContinuityLedger must prohibit silent overwrite");
  push(errors, payload?.validation?.blockingConflictsVisible === true, "ContinuityLedger must surface blocking conflicts");
}

function validatePerformanceTimeline(payload, errors) {
  const phases = payload?.phases || [];
  push(errors, unique(phases.map((item) => item?.phaseId)), "PerformanceTimeline phase IDs must be unique");
  let previousEnd = 0;
  for (const phase of phases) {
    push(errors, phase?.startSeconds >= previousEnd, `${phase?.phaseId}: phases overlap or are unordered`);
    push(errors, phase?.endSeconds > phase?.startSeconds, `${phase?.phaseId}: end must follow start`);
    push(errors, phase?.endSeconds <= payload?.durationSeconds, `${phase?.phaseId}: phase exceeds duration`);
    previousEnd = phase?.endSeconds;
  }
  push(errors, payload?.validation?.noCameraDirections === true, "PerformanceTimeline cannot own camera directions");
}

function validateSceneLightState(payload, errors) {
  const sources = payload?.sources || [];
  push(errors, unique(sources.map((item) => item?.sourceId)), "SceneLightState source IDs must be unique");
  for (const source of sources) {
    push(errors, nonEmpty(source?.positionAnchor) && nonEmpty(source?.direction), `${source?.sourceId}: source must be geography-bound`);
    push(errors, nonEmpty(source?.motivatedBy), `${source?.sourceId}: source must be motivated`);
  }
  push(errors, payload?.validation?.noPostprocessOwnership === true, "SceneLightState cannot own post-process treatment");
}

function validateStyleLightGrammar(payload, errors) {
  push(errors, payload?.validation?.noPhysicalSourcePlacement === true, "StyleLightGrammar cannot place physical sources");
  push(errors, payload?.validation?.noGeographyOwnership === true, "StyleLightGrammar cannot own geography");
  push(errors, payload?.validation?.visualTemporalSeparated === true, "StyleLightGrammar must separate visual and temporal behavior");
}

function validateShotSpec(payload, errors) {
  const characterIds = new Set((payload?.bindings?.characters || []).map((item) => item?.id));
  for (const item of payload?.blocking || []) if (characterIds.size) push(errors, characterIds.has(item?.subjectRef), `ShotSpec blocking references unknown subject ${item?.subjectRef}`);
  push(errors, nonEmpty(payload?.camera?.movementIntent), "ShotSpec needs a motivated movement intent, including static");
  push(errors, payload?.validation?.oneDominantCameraIdea === true, "ShotSpec requires one dominant camera idea");
  push(errors, payload?.validation?.axisCoherent === true, "ShotSpec must preserve axis coherence");
}

function validateShotLightingPlan(payload, errors, sceneLightState) {
  const known = new Set((sceneLightState?.sources || []).map((item) => item?.sourceId));
  const uses = [payload?.key, payload?.fill, payload?.rim, ...(payload?.practicals || [])].filter(Boolean);
  if (known.size) for (const use of uses) push(errors, known.has(use?.sourceId), `ShotLightingPlan uses unknown source ${use?.sourceId}`);
  push(errors, payload?.validation?.stylePhysicalSeparated === true, "ShotLightingPlan must separate style from physical sources");
  push(errors, payload?.validation?.continuityBound === true, "ShotLightingPlan must bind continuity");
}

function validateTemporalSpec(payload, errors) {
  for (const [label, events] of [["focus", payload?.focusTimeline || []], ["action", payload?.actionTimeline || []], ["dynamic light", payload?.dynamicLighting || []]]) {
    let last = -1;
    for (const event of events) {
      push(errors, event?.timeSeconds >= last, `TemporalSpec ${label} events must be ordered`);
      push(errors, event?.timeSeconds <= payload?.durationSeconds, `TemporalSpec ${label} event exceeds duration`);
      last = event?.timeSeconds;
    }
  }
  push(errors, nonEmpty(payload?.cameraMotion?.motivation), "TemporalSpec camera movement must be motivated");
  push(errors, payload?.validation?.endStateStable === true, "TemporalSpec needs a stable end state");
}

function validatePromptRepair(payload, errors) {
  push(errors, Array.isArray(payload?.changeOnly) && payload.changeOnly.length === 1, "PromptRepair changes exactly one variable");
  push(errors, Array.isArray(payload?.evidenceObservationIds) && payload.evidenceObservationIds.length > 0, "PromptRepair requires observed evidence");
  push(errors, payload?.validation?.parentImmutable === true, "PromptRepair keeps its parent immutable");
}

function validateByKind(payload, context = {}) {
  const errors = [];
  switch (payload?.kind) {
    case "cineweave_codex_story_brief": validateStoryBrief(payload, errors); break;
    case "cineweave_codex_beat_sheet": validateBeatSheet(payload, errors); break;
    case "cineweave_codex_script_scene": validateScriptScene(payload, errors); break;
    case "cineweave_codex_continuity_ledger": validateContinuityLedger(payload, errors); break;
    case "cineweave_codex_character_spec": validateCharacterSpec(payload, errors); break;
    case "cineweave_codex_character_exploration_brief": validateCharacterExplorationBrief(payload, errors); break;
    case "cineweave_codex_character_option_set": validateCharacterOptionSet(payload, errors); break;
    case "cineweave_codex_character_preference_feedback": validateCharacterPreferenceFeedback(payload, errors); break;
    case "cineweave_codex_character_reference_plan": validateCharacterReferencePlan(payload, errors); break;
    case "cineweave_codex_character_appearance_state": validateAppearanceState(payload, errors); break;
    case "cineweave_codex_character_review": validateReview(payload, errors, "Character"); break;
    case "cineweave_codex_character_repair": validateRepair(payload, errors, "Character"); break;
    case "cineweave_codex_performance_timeline": validatePerformanceTimeline(payload, errors); break;
    case "cineweave_codex_scene_spec": validateSceneSpec(payload, errors); break;
    case "cineweave_codex_scene_state": validateSceneState(payload, errors, context.sceneSpec); break;
    case "cineweave_codex_scene_reference_plan": push(errors, payload?.validation?.geographyFirst === true, "SceneReferencePlan must be geography-first"); break;
    case "cineweave_codex_interaction_constraint_set": validateInteractionSet(payload, errors); break;
    case "cineweave_codex_scene_review": validateReview(payload, errors, "Scene"); break;
    case "cineweave_codex_scene_repair": validateRepair(payload, errors, "Scene"); break;
    case "cineweave_codex_scene_light_state": validateSceneLightState(payload, errors); break;
    case "cineweave_codex_asset_recipe": validateAssetRecipe(payload, errors, context.controlSet); break;
    case "cineweave_codex_control_channel_set": validateControlSet(payload, errors); break;
    case "cineweave_codex_evidence_bundle": validateEvidenceBundle(payload, errors); break;
    case "cineweave_codex_capability_profile": validateCapabilityProfile(payload, errors); break;
    case "cineweave_codex_license_profile": validateLicenseProfile(payload, errors); break;
    case "cineweave_codex_control_benchmark": validateBenchmark(payload, errors); break;
    case "cineweave_adapter_descriptor": validateAdapterDescriptor(payload, errors, context.capabilityProfile); break;
    case "cineweave_execution_request": validateExecutionRequest(payload, errors); break;
    case "cineweave_execution_receipt": validateExecutionReceipt(payload, errors, context.executionRequest); break;
    case "cineweave_skill_evaluation_run": validateSkillEvaluationRun(payload, errors); break;
    case "cineweave_codex_image_prompt": validateIntegratedImage(payload, errors); break;
    case "cineweave_codex_prompt_record": validatePromptRecord(payload, errors); break;
    case "cineweave_codex_storyboard_sequence": validateIntegratedStoryboard(payload, errors); break;
    case "cineweave_codex_style_package": validateStylePackage(payload, errors); break;
    case "cineweave_codex_style_reference_plan": validateStyleReferencePlan(payload, errors); break;
    case "cineweave_codex_style_compile": validateStyleCompile(payload, errors); break;
    case "cineweave_codex_style_review": validateStyleReview(payload, errors); break;
    case "cineweave_codex_style_light_grammar": validateStyleLightGrammar(payload, errors); break;
    case "cineweave_codex_shot_spec": validateShotSpec(payload, errors); break;
    case "cineweave_codex_shot_lighting_plan": validateShotLightingPlan(payload, errors, context.sceneLightState); break;
    case "cineweave_codex_temporal_spec": validateTemporalSpec(payload, errors); break;
    case "cineweave_codex_prompt_repair": validatePromptRepair(payload, errors); break;
    case "cineweave_codex_creative_brief": validateCreativeBrief(payload, errors); break;
    case "cineweave_codex_workflow_plan": validateWorkflowPlan(payload, errors); break;
    default:
      if (payload?.characterSpecRef && payload?.performanceState) validateCharacterBinding(payload, errors);
      else if (payload?.sceneSpecRef && payload?.cameraPlacement) validateSceneBinding(payload, errors, context.sceneSpec);
  }
  return errors;
}

async function readJson(relativePath) { return JSON.parse(await readFile(resolve(repoRoot, "packages/cineweave-contracts", relativePath), "utf8")); }

async function runSelfTest(mode = "all") {
  const sceneSpec = await readJson("examples/scene-spec.json");
  const sceneLightState = await readJson("examples/scene-light-state.json");
  const controlSet = await readJson("examples/control-channel-set.json");
  const cases = [
    ["examples/character-spec.json", {}], ["examples/character-exploration-brief.json", {}], ["examples/character-option-set.json", {}], ["examples/character-preference-feedback.json", {}], ["examples/character-binding.json", {}], ["examples/character-reference-plan.json", {}], ["examples/character-appearance-state.json", {}], ["examples/character-review.json", {}], ["examples/character-repair.json", {}],
  ];
  if (mode === "all") cases.push(
    ["examples/story-brief.json", {}], ["examples/beat-sheet.json", {}], ["examples/script-scene.json", {}], ["examples/continuity-ledger.json", {}],
    ["examples/performance-timeline.json", {}],
    ["examples/scene-spec.json", {}], ["examples/scene-state.json", { sceneSpec }], ["examples/scene-binding.json", { sceneSpec }], ["examples/scene-reference-plan.json", { sceneSpec }], ["examples/interaction-constraint-set.json", {}], ["examples/scene-review.json", { sceneSpec }], ["examples/scene-repair.json", { sceneSpec }],
    ["examples/scene-light-state.json", {}],
    ["examples/asset-recipe.json", { controlSet }], ["examples/control-channel-set.json", {}], ["examples/evidence-bundle.json", {}], ["examples/capability-profile.json", {}], ["examples/license-profile.json", {}], ["examples/control-benchmark.json", {}],
    ["examples/adapter-descriptor.json", {}], ["examples/execution-request.json", {}], ["examples/execution-receipt.json", {}], ["examples/execution-receipt-blocked.json", {}], ["examples/skill-evaluation-run.json", {}],
    ["examples/integrated-image-prompt.json", { sceneSpec }], ["examples/integrated-storyboard.json", { sceneSpec }], ["examples/prompt-record.json", {}],
    ["examples/style-package.json", {}], ["examples/style-reference-plan.json", {}], ["examples/style-compile.json", {}], ["examples/style-light-grammar.json", {}], ["examples/style-review.json", {}],
    ["examples/shot-spec.json", {}], ["examples/shot-lighting-plan.json", { sceneLightState }], ["examples/temporal-spec.json", {}], ["examples/prompt-repair.json", {}],
    ["examples/creative-brief.json", {}], ["examples/creative-brief-zero-prompt.json", {}], ["examples/workflow-plan.json", {}], ["examples/workflow-plan-character-exploration.json", {}],
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
  const badPrompt = await readJson("examples/integrated-image-prompt.json"); delete badPrompt.sceneBinding; negative.push(["reject scene blocks without SceneBinding", badPrompt, {}]);
  const badControl = await readJson("examples/control-channel-set.json"); badControl.channels[0].fallback.action = "warn"; negative.push(["reject hard control that does not block", badControl, {}]);
  const badRecipe = await readJson("examples/asset-recipe.json"); badRecipe.assembly.ordering.pop(); negative.push(["reject incomplete recipe assembly", badRecipe, { controlSet }]);
  const badEvidence = await readJson("examples/evidence-bundle.json"); badEvidence.evidence = badEvidence.evidence.filter((item) => item.role !== "body_identity"); negative.push(["reject missing required evidence role", badEvidence, {}]);
  const badCapability = await readJson("examples/capability-profile.json"); badCapability.capabilities.push(structuredClone(badCapability.capabilities[0])); negative.push(["reject duplicate capability", badCapability, {}]);
  const badInteraction = await readJson("examples/interaction-constraint-set.json"); badInteraction.constraints.occlusions.push({ frontRef: badInteraction.constraints.occlusions[0].backRef, backRef: badInteraction.constraints.occlusions[0].frontRef, region: "reverse", ordering: "front_before_back" }); negative.push(["reject cyclic occlusion", badInteraction, {}]);
  const badStyle = await readJson("examples/style-package.json"); badStyle.recipe.atomRefs[0].atomId = "unknown.style.atom"; negative.push(["reject StylePackage unknown atom", badStyle, {}]);
  const badStyleActivation = await readJson("examples/style-package.json"); badStyleActivation.status = "active"; negative.push(["reject active StylePackage without activation approval", badStyleActivation, {}]);
  const badBrief = await readJson("examples/creative-brief.json"); badBrief.validation.styleDoesNotOwnIdentity = false; negative.push(["reject CreativeBrief style identity overwrite", badBrief, {}]);
  const badStyleBinding = await readJson("examples/prompt-record.json"); badStyleBinding.styleBinding.mode = "compiled"; delete badStyleBinding.styleBinding.styleCompileRef; negative.push(["reject compiled PromptRecord without StyleCompile ref", badStyleBinding, {}]);
  const badWorkflow = await readJson("examples/workflow-plan.json"); badWorkflow.steps[0].dependsOn = [badWorkflow.steps[2].stepId]; negative.push(["reject cyclic WorkflowPlan", badWorkflow, {}]);
  const badOptionSet = await readJson("examples/character-option-set.json"); badOptionSet.options[0].primaryDelta.axis = "eye_expression"; negative.push(["reject CharacterOptionSet with mixed exploration axes", badOptionSet, {}]);
  const badFeedbackLock = await readJson("examples/character-preference-feedback.json"); badFeedbackLock.convergence.identityLockRequested = true; negative.push(["reject CharacterPreferenceFeedback automatic identity lock", badFeedbackLock, {}]);
  const badFeedbackScore = await readJson("examples/character-preference-feedback.json"); badFeedbackScore.policy.universalBeautyScoreProhibited = false; negative.push(["reject CharacterPreferenceFeedback beauty score policy", badFeedbackScore, {}]);
  const badBeatSheet = await readJson("examples/beat-sheet.json"); badBeatSheet.beats[1].order = 1; negative.push(["reject unordered BeatSheet", badBeatSheet, {}]);
  const badPerformanceTimeline = await readJson("examples/performance-timeline.json"); badPerformanceTimeline.phases[1].startSeconds = 0.5; negative.push(["reject overlapping PerformanceTimeline", badPerformanceTimeline, {}]);
  const badSceneLight = await readJson("examples/scene-light-state.json"); badSceneLight.sources[1].sourceId = badSceneLight.sources[0].sourceId; negative.push(["reject duplicate SceneLightState source", badSceneLight, {}]);
  const badStyleLight = await readJson("examples/style-light-grammar.json"); badStyleLight.validation.noPhysicalSourcePlacement = false; negative.push(["reject StyleLightGrammar physical placement", badStyleLight, {}]);
  const badShot = await readJson("examples/shot-spec.json"); badShot.blocking[0].subjectRef = "binding.unknown"; negative.push(["reject ShotSpec unknown blocking subject", badShot, {}]);
  const badShotLight = await readJson("examples/shot-lighting-plan.json"); badShotLight.key.sourceId = "light.unknown"; negative.push(["reject ShotLightingPlan unknown source", badShotLight, { sceneLightState }]);
  const badTemporal = await readJson("examples/temporal-spec.json"); badTemporal.actionTimeline[1].timeSeconds = 0.1; negative.push(["reject unordered TemporalSpec", badTemporal, {}]);
  const badPromptRepair = await readJson("examples/prompt-repair.json"); badPromptRepair.changeOnly.push("also change composition"); negative.push(["reject multi-variable PromptRepair", badPromptRepair, {}]);
  const badAdapter = await readJson("examples/adapter-descriptor.json"); badAdapter.executionModes.push("external"); negative.push(["reject network-free adapter exposing external mode", badAdapter, {}]);
  const badExecutionRequest = await readJson("examples/execution-request.json"); badExecutionRequest.parameters.push({ name: "api_key", value: "not-a-real-value", sensitive: false }); negative.push(["reject sensitive execution parameter", badExecutionRequest, {}]);
  const badExecutionReceipt = await readJson("examples/execution-receipt.json"); badExecutionReceipt.costSummary.actualAmount = 1; negative.push(["reject receipt cost that omits attempt accounting", badExecutionReceipt, {}]);
  const badEvaluationRun = await readJson("examples/skill-evaluation-run.json"); badEvaluationRun.summary.passed = 1; negative.push(["reject inconsistent SkillEvaluationRun summary", badEvaluationRun, {}]);

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
  if (args.length !== 1) { console.error("Usage: node scripts/validate-contract-semantics.mjs <payload.json> | --self-test | --character-self-test"); process.exitCode = 2; return; }
  const payload = JSON.parse(await readFile(resolve(args[0]), "utf8"));
  const errors = validateByKind(payload);
  if (errors.length) { console.error(JSON.stringify({ valid: false, errors }, null, 2)); process.exitCode = 2; return; }
  console.log(JSON.stringify({ valid: true, payload: resolve(args[0]) }, null, 2));
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
