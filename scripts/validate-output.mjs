#!/usr/bin/env node

import { readFile } from "node:fs/promises";

function usage() {
  console.error("Usage: node scripts/validate-output.mjs <schema.json> <payload.json>");
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requiredString(value, path, errors) {
  if (typeof value !== "string" || !value.trim()) errors.push(`${path} must be a non-empty string`);
}

function optionalString(value, path, errors) {
  if (value !== undefined) requiredString(value, path, errors);
}

function allowedKeys(value, keys, path, errors) {
  if (!isRecord(value)) return;
  const allowed = new Set(keys);
  Object.keys(value).forEach((key) => {
    if (!allowed.has(key)) errors.push(`${path}.${key} is not allowed`);
  });
}

function stringArray(value, path, errors, { min = 1, max = 32 } = {}) {
  if (!Array.isArray(value)) {
    errors.push(`${path} must be an array`);
    return;
  }
  if (value.length < min || value.length > max) errors.push(`${path} must contain ${min}–${max} items`);
  value.forEach((item, index) => requiredString(item, `${path}[${index}]`, errors));
}

function validateReceipt(receipt, errors) {
  if (!isRecord(receipt)) {
    errors.push("skillReceipt must be an object");
    return;
  }
  allowedKeys(receipt, ["repository", "ref", "commit", "contentHash", "installedBy", "environmentId", "usedAt"], "skillReceipt", errors);
  requiredString(receipt.repository, "skillReceipt.repository", errors);
  requiredString(receipt.ref, "skillReceipt.ref", errors);
  requiredString(receipt.commit, "skillReceipt.commit", errors);
  if (receipt.installedBy !== "codex-environment") errors.push("skillReceipt.installedBy must be codex-environment");
  requiredString(receipt.usedAt, "skillReceipt.usedAt", errors);
  if (typeof receipt.repository === "string" && !/^https:\/\/(www\.)?github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/.test(receipt.repository)) errors.push("skillReceipt.repository must be a GitHub HTTPS repository URL");
  if (typeof receipt.commit === "string" && !/^[0-9a-f]{7,64}$/i.test(receipt.commit)) errors.push("skillReceipt.commit must be a Git SHA");
  if (receipt.contentHash !== undefined && (typeof receipt.contentHash !== "string" || !/^sha256:[0-9a-f]{64}$/i.test(receipt.contentHash))) errors.push("skillReceipt.contentHash must be sha256:<64 hex chars>");
  if (typeof receipt.usedAt === "string" && Number.isNaN(Date.parse(receipt.usedAt))) errors.push("skillReceipt.usedAt must be an ISO date-time");
  if (receipt.environmentId !== undefined) optionalString(receipt.environmentId, "skillReceipt.environmentId", errors);
}

function validateLens(lens, path, errors) {
  if (!isRecord(lens)) {
    errors.push(`${path} must be an object`);
    return;
  }
  allowedKeys(lens, ["focalLengthMm", "character"], path, errors);
  if (typeof lens.focalLengthMm !== "number" || !Number.isFinite(lens.focalLengthMm) || lens.focalLengthMm < 12 || lens.focalLengthMm > 400) errors.push(`${path}.focalLengthMm must be a finite number between 12 and 400`);
  requiredString(lens.character, `${path}.character`, errors);
}

function validateMovement(movement, path, errors) {
  if (!isRecord(movement)) {
    errors.push(`${path} must be an object`);
    return;
  }
  allowedKeys(movement, ["type", "direction", "speedCurve", "startState", "peakState", "endState"], path, errors);
  const types = new Set(["static", "dolly", "truck", "pan", "tilt", "arc", "crane", "handheld", "gimbal", "rack-focus"]);
  if (!types.has(movement.type)) errors.push(`${path}.type is unsupported`);
  ["direction", "speedCurve", "startState", "peakState", "endState"].forEach((field) => requiredString(movement[field], `${path}.${field}`, errors));
}

function validateStyleStack(styleStack, path, errors) {
  if (!Array.isArray(styleStack) || styleStack.length < 1 || styleStack.length > 5) {
    errors.push(`${path} must contain 1–5 items`);
    return;
  }
  let total = 0;
  styleStack.forEach((item, index) => {
    const itemPath = `${path}[${index}]`;
    if (!isRecord(item)) {
      errors.push(`${itemPath} must be an object`);
      return;
    }
    allowedKeys(item, ["label", "weight"], itemPath, errors);
    requiredString(item.label, `${itemPath}.label`, errors);
    if (typeof item.weight !== "number" || !Number.isFinite(item.weight) || item.weight < 0) errors.push(`${itemPath}.weight must be a finite non-negative number`);
    else total += item.weight;
  });
  if (total <= 0) errors.push(`${path} must contain a positive total weight`);
}

function validateProposalPayload(payload, errors) {
  allowedKeys(payload, ["skillReceipt", "sourceInput", "proposals"], "payload", errors);
  validateReceipt(payload.skillReceipt, errors);
  if (payload.sourceInput !== undefined) optionalString(payload.sourceInput, "sourceInput", errors);
  if (!Array.isArray(payload.proposals) || payload.proposals.length < 2 || payload.proposals.length > 5) {
    errors.push("proposals must contain 2–5 items");
    return;
  }
  const fields = ["title", "summary", "narrativeIntent", "audienceFeeling", "composition", "camera", "performance", "visualTreatment", "soundEdit", "cost", "risk"];
  payload.proposals.forEach((proposal, index) => {
    const prefix = `proposals[${index}]`;
    if (!isRecord(proposal)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    allowedKeys(proposal, [...fields, "styleStack", "preserve", "allowedChanges", "recommendedProvider"], prefix, errors);
    fields.forEach((field) => requiredString(proposal[field], `${prefix}.${field}`, errors));
    validateStyleStack(proposal.styleStack, `${prefix}.styleStack`, errors);
    stringArray(proposal.preserve, `${prefix}.preserve`, errors);
    stringArray(proposal.allowedChanges, `${prefix}.allowedChanges`, errors);
    if (proposal.recommendedProvider !== "codex" && proposal.recommendedProvider !== "libtv") errors.push(`${prefix}.recommendedProvider must be codex or libtv`);
  });
}

function validateDraftBrief(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "shotId", "shotPurpose", "primaryFocus", "composition", "camera", "visualTreatment", "preserve", "allowedChanges", "negativeConstraints", "importContract"], "payload", errors);
  if (payload.kind !== "cineweave_codex_interactive_draft_brief") errors.push("kind must be cineweave_codex_interactive_draft_brief");
  ["worldId", "shotPurpose", "primaryFocus", "composition", "camera", "visualTreatment"].forEach((field) => requiredString(payload[field], field, errors));
  ["preserve", "allowedChanges", "negativeConstraints"].forEach((field) => stringArray(payload[field], field, errors));
  if (!isRecord(payload.importContract)) {
    errors.push("importContract must be an object");
    return;
  }
  allowedKeys(payload.importContract, ["source", "statusOnCreation", "requiredMedia", "nextAction"], "importContract", errors);
  if (payload.importContract.source !== "codex_interactive") errors.push("importContract.source must be codex_interactive");
  if (payload.importContract.statusOnCreation !== "draft") errors.push("importContract.statusOnCreation must be draft");
  ["requiredMedia", "nextAction"].forEach((field) => requiredString(payload.importContract[field], `importContract.${field}`, errors));
}

function validateHypothesisPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "sourceInput", "skillReceipt", "hypotheses"], "payload", errors);
  if (payload.kind !== "cineweave_codex_prompt_hypothesis") errors.push("kind must be cineweave_codex_prompt_hypothesis");
  requiredString(payload.worldId, "worldId", errors);
  validateReceipt(payload.skillReceipt, errors);
  if (payload.sourceInput !== undefined) optionalString(payload.sourceInput, "sourceInput", errors);
  if (!Array.isArray(payload.hypotheses) || payload.hypotheses.length < 1 || payload.hypotheses.length > 12) {
    errors.push("hypotheses must contain 1–12 items");
    return;
  }
  const categories = new Set(["subject", "identity", "state", "environment", "composition", "camera", "light", "color", "material", "style", "atmosphere", "negative"]);
  const confidences = new Set(["high", "medium", "low", "unknown"]);
  payload.hypotheses.forEach((hypothesis, index) => {
    const prefix = `hypotheses[${index}]`;
    if (!isRecord(hypothesis)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    allowedKeys(hypothesis, ["hypothesisId", "fragment", "category", "confidence", "unknowns", "observationIds", "analysisRunId", "modelSnapshot", "inputHash", "alternativeHypotheses"], prefix, errors);
    ["fragment", "category", "confidence"].forEach((field) => requiredString(hypothesis[field], `${prefix}.${field}`, errors));
    if (!categories.has(hypothesis.category)) errors.push(`${prefix}.category is unsupported`);
    if (!confidences.has(hypothesis.confidence)) errors.push(`${prefix}.confidence is unsupported`);
    stringArray(hypothesis.unknowns, `${prefix}.unknowns`, errors);
    stringArray(hypothesis.observationIds, `${prefix}.observationIds`, errors);
    ["hypothesisId", "analysisRunId", "modelSnapshot", "inputHash"].forEach((field) => optionalString(hypothesis[field], `${prefix}.${field}`, errors));
    if (hypothesis.alternativeHypotheses !== undefined) stringArray(hypothesis.alternativeHypotheses, `${prefix}.alternativeHypotheses`, errors);
  });
}

function validateIntent(intent, errors) {
  if (!isRecord(intent)) {
    errors.push("intent must be an object");
    return;
  }
  allowedKeys(intent, ["narrativePurpose", "audienceFeeling", "primaryTarget", "secondaryTarget"], "intent", errors);
  ["narrativePurpose", "audienceFeeling", "primaryTarget"].forEach((field) => requiredString(intent[field], `intent.${field}`, errors));
  optionalString(intent.secondaryTarget, "intent.secondaryTarget", errors);
}

function validateComposition(composition, path, errors) {
  if (!isRecord(composition)) {
    errors.push(`${path} must be an object`);
    return;
  }
  allowedKeys(composition, ["primaryTarget", "layout", "depthLayers", "subjectScale", "negativeSpace"], path, errors);
  ["primaryTarget", "layout", "subjectScale"].forEach((field) => requiredString(composition[field], `${path}.${field}`, errors));
  stringArray(composition.depthLayers, `${path}.depthLayers`, errors);
  optionalString(composition.negativeSpace, `${path}.negativeSpace`, errors);
}

function validateImagePromptPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "shotId", "skillReceipt", "intent", "shotDesign", "promptBlocks", "prompt", "negativePrompt", "preserve", "allowedChanges", "validation"], "payload", errors);
  if (payload.kind !== "cineweave_codex_image_prompt") errors.push("kind must be cineweave_codex_image_prompt");
  requiredString(payload.worldId, "worldId", errors);
  optionalString(payload.shotId, "shotId", errors);
  validateReceipt(payload.skillReceipt, errors);
  validateIntent(payload.intent, errors);

  if (!isRecord(payload.shotDesign)) {
    errors.push("shotDesign must be an object");
  } else {
    allowedKeys(payload.shotDesign, ["primaryTarget", "shotScale", "cameraAngle", "cameraHeight", "lens", "depth", "movementCue", "focusTarget", "composition", "actionMoment", "endState", "styleStack"], "shotDesign", errors);
    ["primaryTarget", "shotScale", "cameraAngle", "cameraHeight", "focusTarget", "actionMoment", "endState"].forEach((field) => requiredString(payload.shotDesign[field], `shotDesign.${field}`, errors));
    validateLens(payload.shotDesign.lens, "shotDesign.lens", errors);
    stringArray(payload.shotDesign.depth, "shotDesign.depth", errors);
    validateMovement(payload.shotDesign.movementCue, "shotDesign.movementCue", errors);
    validateComposition(payload.shotDesign.composition, "shotDesign.composition", errors);
    validateStyleStack(payload.shotDesign.styleStack, "shotDesign.styleStack", errors);
  }

  if (!isRecord(payload.promptBlocks)) {
    errors.push("promptBlocks must be an object");
  } else {
    const blockNames = ["world", "story", "subject", "miseEnScene", "camera", "lighting", "realism", "style", "technical"];
    allowedKeys(payload.promptBlocks, blockNames, "promptBlocks", errors);
    blockNames.forEach((name) => stringArray(payload.promptBlocks[name], `promptBlocks.${name}`, errors, { min: 1, max: 12 }));
  }

  if (!isRecord(payload.prompt)) {
    errors.push("prompt must be an object");
  } else {
    allowedKeys(payload.prompt, ["language", "concise", "expanded"], "prompt", errors);
    if (!["zh-CN", "en", "bilingual"].includes(payload.prompt.language)) errors.push("prompt.language is unsupported");
    requiredString(payload.prompt.concise, "prompt.concise", errors);
    requiredString(payload.prompt.expanded, "prompt.expanded", errors);
  }

  stringArray(payload.negativePrompt, "negativePrompt", errors);
  stringArray(payload.preserve, "preserve", errors);
  stringArray(payload.allowedChanges, "allowedChanges", errors);
  if (!isRecord(payload.validation)) {
    errors.push("validation must be an object");
  } else {
    allowedKeys(payload.validation, ["onePrimaryTarget", "physicalLight", "cameraCoherent", "realismAnchors", "providerNeutral"], "validation", errors);
    ["onePrimaryTarget", "physicalLight", "cameraCoherent", "providerNeutral"].forEach((field) => {
      if (payload.validation[field] !== true) errors.push(`validation.${field} must be true`);
    });
    stringArray(payload.validation.realismAnchors, "validation.realismAnchors", errors, { min: 3, max: 12 });
  }
}

function validatePromptRecordPayload(payload, errors) {
  allowedKeys(payload, ["kind", "promptId", "title", "version", "status", "domain", "generationMode", "skillReceipt", "worldId", "collection", "purpose", "sourceText", "tags", "prompt", "variables", "references", "variants", "evaluation", "provenance", "validation"], "payload", errors);
  if (payload.kind !== "cineweave_codex_prompt_record") errors.push("kind must be cineweave_codex_prompt_record");
  requiredString(payload.promptId, "promptId", errors);
  if (typeof payload.promptId === "string" && !/^[a-z0-9][a-z0-9._-]{2,159}$/.test(payload.promptId)) errors.push("promptId must be a lowercase stable identifier");
  requiredString(payload.title, "title", errors);
  if (!Number.isInteger(payload.version) || payload.version < 1) errors.push("version must be a positive integer");
  if (!["draft", "active", "archived", "retired"].includes(payload.status)) errors.push("status is unsupported");
  const domains = new Set(["general", "cinematic", "portrait", "product", "fashion", "architecture", "landscape", "interior", "food", "vehicle", "character", "fantasy", "illustration", "anime", "editorial", "social", "abstract", "technical", "other"]);
  if (!domains.has(payload.domain)) errors.push("domain is unsupported");
  if (!["generate", "edit", "inpaint", "multi_reference"].includes(payload.generationMode)) errors.push("generationMode is unsupported");
  validateReceipt(payload.skillReceipt, errors);
  optionalString(payload.worldId, "worldId", errors);
  optionalString(payload.collection, "collection", errors);
  requiredString(payload.purpose, "purpose", errors);
  optionalString(payload.sourceText, "sourceText", errors);
  if (payload.tags !== undefined) stringArray(payload.tags, "tags", errors, { min: 0, max: 24 });

  if (!isRecord(payload.prompt)) {
    errors.push("prompt must be an object");
  } else {
    allowedKeys(payload.prompt, ["language", "positive", "negative", "blocks"], "prompt", errors);
    if (!["zh-CN", "en", "bilingual"].includes(payload.prompt.language)) errors.push("prompt.language is unsupported");
    requiredString(payload.prompt.positive, "prompt.positive", errors);
    optionalString(payload.prompt.negative, "prompt.negative", errors);
    if (!isRecord(payload.prompt.blocks)) {
      errors.push("prompt.blocks must be an object");
    } else {
      const blockNames = ["context", "subject", "action", "composition", "environment", "camera", "lighting", "materials", "style", "technical", "constraints"];
      allowedKeys(payload.prompt.blocks, blockNames, "prompt.blocks", errors);
      stringArray(payload.prompt.blocks.subject, "prompt.blocks.subject", errors, { min: 1, max: 16 });
      blockNames.filter((name) => name !== "subject").forEach((name) => {
        if (payload.prompt.blocks[name] !== undefined) stringArray(payload.prompt.blocks[name], `prompt.blocks.${name}`, errors, { min: 1, max: 16 });
      });
    }
  }

  const variableNames = new Set();
  if (!Array.isArray(payload.variables) || payload.variables.length > 24) {
    errors.push("variables must contain 0–24 items");
  } else {
    payload.variables.forEach((variable, index) => {
      const prefix = `variables[${index}]`;
      if (!isRecord(variable)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      allowedKeys(variable, ["name", "type", "description", "required", "default", "values"], prefix, errors);
      requiredString(variable.name, `${prefix}.name`, errors);
      if (typeof variable.name === "string") {
        if (!/^[a-zA-Z][a-zA-Z0-9_]{0,63}$/.test(variable.name)) errors.push(`${prefix}.name must be a variable identifier`);
        if (variableNames.has(variable.name)) errors.push(`variables contains duplicate name: ${variable.name}`);
        variableNames.add(variable.name);
      }
      if (!["string", "number", "boolean", "enum"].includes(variable.type)) errors.push(`${prefix}.type is unsupported`);
      requiredString(variable.description, `${prefix}.description`, errors);
      if (typeof variable.required !== "boolean") errors.push(`${prefix}.required must be boolean`);
      if (variable.default !== undefined && variable.default !== null && !["string", "number", "boolean"].includes(typeof variable.default)) errors.push(`${prefix}.default must be a primitive value or null`);
      if (variable.values !== undefined) stringArray(variable.values, `${prefix}.values`, errors, { min: 1, max: 24 });
      if (variable.type === "enum" && (!Array.isArray(variable.values) || variable.values.length < 1)) errors.push(`${prefix}.values is required for enum variables`);
    });
  }
  if (isRecord(payload.prompt) && isRecord(payload.prompt.blocks) && Array.isArray(payload.variables)) {
    const searchablePrompt = `${payload.prompt.positive || ""} ${JSON.stringify(payload.prompt.blocks)}`;
    payload.variables.forEach((variable, index) => {
      if (typeof variable?.name === "string" && !searchablePrompt.includes(`{{${variable.name}}}`)) errors.push(`variables[${index}].name is not bound with {{${variable.name}}}`);
    });
  }

  const observationIds = new Set();
  if (!Array.isArray(payload.references) || payload.references.length > 8) {
    errors.push("references must contain 0–8 items");
  } else {
    payload.references.forEach((reference, index) => {
      const prefix = `references[${index}]`;
      if (!isRecord(reference)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      allowedKeys(reference, ["observationId", "role", "purpose", "preserve", "allowedTransforms", "excluded"], prefix, errors);
      requiredString(reference.observationId, `${prefix}.observationId`, errors);
      if (typeof reference.observationId === "string") {
        if (/https?:|file:|[\\/?#]/i.test(reference.observationId)) errors.push(`${prefix}.observationId must be a scoped ID, not a URL or path`);
        if (observationIds.has(reference.observationId)) errors.push(`references contains duplicate observationId: ${reference.observationId}`);
        observationIds.add(reference.observationId);
      }
      if (!["identity", "composition", "lighting", "style", "material", "background", "mask", "reference"].includes(reference.role)) errors.push(`${prefix}.role is unsupported`);
      requiredString(reference.purpose, `${prefix}.purpose`, errors);
      stringArray(reference.preserve, `${prefix}.preserve`, errors);
      stringArray(reference.allowedTransforms, `${prefix}.allowedTransforms`, errors);
      if (reference.excluded !== undefined) stringArray(reference.excluded, `${prefix}.excluded`, errors);
    });
  }

  const variantIds = new Set();
  if (!Array.isArray(payload.variants) || payload.variants.length < 1 || payload.variants.length > 12) {
    errors.push("variants must contain 1–12 items");
  } else {
    payload.variants.forEach((variant, index) => {
      const prefix = `variants[${index}]`;
      if (!isRecord(variant)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      allowedKeys(variant, ["variantId", "label", "change", "positive", "negative", "status"], prefix, errors);
      requiredString(variant.variantId, `${prefix}.variantId`, errors);
      if (typeof variant.variantId === "string") {
        if (!/^[a-z0-9][a-z0-9._-]{2,159}$/.test(variant.variantId)) errors.push(`${prefix}.variantId must be a stable identifier`);
        if (variantIds.has(variant.variantId)) errors.push(`variants contains duplicate variantId: ${variant.variantId}`);
        variantIds.add(variant.variantId);
      }
      requiredString(variant.label, `${prefix}.label`, errors);
      requiredString(variant.change, `${prefix}.change`, errors);
      requiredString(variant.positive, `${prefix}.positive`, errors);
      optionalString(variant.negative, `${prefix}.negative`, errors);
      if (variant.status !== undefined && !["draft", "selected", "rejected", "archived"].includes(variant.status)) errors.push(`${prefix}.status is unsupported`);
    });
  }

  if (!isRecord(payload.evaluation)) {
    errors.push("evaluation must be an object");
  } else {
    allowedKeys(payload.evaluation, ["criteria", "knownRisks", "nextExperiment"], "evaluation", errors);
    if (!Array.isArray(payload.evaluation.criteria) || payload.evaluation.criteria.length < 1 || payload.evaluation.criteria.length > 12) {
      errors.push("evaluation.criteria must contain 1–12 items");
    } else {
      payload.evaluation.criteria.forEach((criterion, index) => {
        const prefix = `evaluation.criteria[${index}]`;
        if (!isRecord(criterion)) {
          errors.push(`${prefix} must be an object`);
          return;
        }
        allowedKeys(criterion, ["criterion", "check", "status", "evidence"], prefix, errors);
        requiredString(criterion.criterion, `${prefix}.criterion`, errors);
        requiredString(criterion.check, `${prefix}.check`, errors);
        if (!["pending", "pass", "fail"].includes(criterion.status)) errors.push(`${prefix}.status is unsupported`);
        optionalString(criterion.evidence, `${prefix}.evidence`, errors);
      });
    }
    stringArray(payload.evaluation.knownRisks, "evaluation.knownRisks", errors);
    requiredString(payload.evaluation.nextExperiment, "evaluation.nextExperiment", errors);
  }

  if (!isRecord(payload.provenance)) {
    errors.push("provenance must be an object");
  } else {
    allowedKeys(payload.provenance, ["source", "createdAt", "updatedAt", "parentPromptId", "changeLog"], "provenance", errors);
    if (!["user_authored", "codex_authored", "adapted", "imported"].includes(payload.provenance.source)) errors.push("provenance.source is unsupported");
    ["createdAt", "updatedAt"].forEach((field) => {
      requiredString(payload.provenance[field], `provenance.${field}`, errors);
      if (typeof payload.provenance[field] === "string" && Number.isNaN(Date.parse(payload.provenance[field]))) errors.push(`provenance.${field} must be an ISO date-time`);
    });
    optionalString(payload.provenance.parentPromptId, "provenance.parentPromptId", errors);
    stringArray(payload.provenance.changeLog, "provenance.changeLog", errors);
  }

  if (!isRecord(payload.validation)) {
    errors.push("validation must be an object");
  } else {
    allowedKeys(payload.validation, ["onePrimaryTarget", "providerNeutral", "variablesBound", "referencesScoped"], "validation", errors);
    ["onePrimaryTarget", "providerNeutral", "variablesBound", "referencesScoped"].forEach((field) => {
      if (payload.validation[field] !== true) errors.push(`validation.${field} must be true`);
    });
  }
}

function validateContinuity(continuity, path, errors) {
  if (!isRecord(continuity)) {
    errors.push(`${path} must be an object`);
    return;
  }
  allowedKeys(continuity, ["screenDirection", "eyeline", "axis", "preserve"], path, errors);
  ["screenDirection", "eyeline", "axis"].forEach((field) => requiredString(continuity[field], `${path}.${field}`, errors));
  stringArray(continuity.preserve, `${path}.preserve`, errors);
}

function validateStoryboardPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "skillReceipt", "sequenceId", "sequenceTitle", "scenePurpose", "shots"], "payload", errors);
  if (payload.kind !== "cineweave_codex_storyboard_sequence") errors.push("kind must be cineweave_codex_storyboard_sequence");
  requiredString(payload.worldId, "worldId", errors);
  validateReceipt(payload.skillReceipt, errors);
  optionalString(payload.sequenceId, "sequenceId", errors);
  ["sequenceTitle", "scenePurpose"].forEach((field) => requiredString(payload[field], field, errors));
  if (!Array.isArray(payload.shots) || payload.shots.length < 1 || payload.shots.length > 24) {
    errors.push("shots must contain 1–24 items");
    return;
  }
  const transitions = new Set(["cut", "dissolve", "match-cut", "smash-cut", "fade", "hold", "j-cut", "l-cut"]);
  payload.shots.forEach((shot, index) => {
    const prefix = `shots[${index}]`;
    if (!isRecord(shot)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    const fields = ["shotId", "purpose", "shotScale", "cameraAngle", "cameraHeight", "composition", "actionBeat", "performance", "lighting", "soundEdit", "framePrompt"];
    allowedKeys(shot, [...fields, "order", "durationSeconds", "lens", "movement", "transition", "continuity", "imagePromptId"], prefix, errors);
    fields.forEach((field) => requiredString(shot[field], `${prefix}.${field}`, errors));
    optionalString(shot.imagePromptId, `${prefix}.imagePromptId`, errors);
    if (!Number.isInteger(shot.order) || shot.order < 1) errors.push(`${prefix}.order must be a positive integer`);
    if (typeof shot.durationSeconds !== "number" || !Number.isFinite(shot.durationSeconds) || shot.durationSeconds < 0.5 || shot.durationSeconds > 120) errors.push(`${prefix}.durationSeconds must be between 0.5 and 120 seconds`);
    validateLens(shot.lens, `${prefix}.lens`, errors);
    validateMovement(shot.movement, `${prefix}.movement`, errors);
    if (!transitions.has(shot.transition)) errors.push(`${prefix}.transition is unsupported`);
    validateContinuity(shot.continuity, `${prefix}.continuity`, errors);
  });
}

function validateCanvas(canvas, errors) {
  if (!isRecord(canvas)) {
    errors.push("canvas must be an object");
    return;
  }
  allowedKeys(canvas, ["aspectRatio", "sizeClass", "pixelDimensions"], "canvas", errors);
  if (typeof canvas.aspectRatio !== "string" || !/^\d+:\d+$/.test(canvas.aspectRatio)) errors.push("canvas.aspectRatio must look like 16:9");
  if (!["square", "portrait", "landscape", "wide", "tall", "custom", "unspecified"].includes(canvas.sizeClass)) errors.push("canvas.sizeClass is unsupported");
  optionalString(canvas.pixelDimensions, "canvas.pixelDimensions", errors);
}

function validateRenderInput(input, path, errors) {
  if (!isRecord(input)) {
    errors.push(`${path} must be an object`);
    return;
  }
  allowedKeys(input, ["observationId", "role", "preserve", "transformation"], path, errors);
  requiredString(input.observationId, `${path}.observationId`, errors);
  if (!["identity", "composition", "lighting", "style", "material", "background", "mask", "reference"].includes(input.role)) errors.push(`${path}.role is unsupported`);
  stringArray(input.preserve, `${path}.preserve`, errors);
  optionalString(input.transformation, `${path}.transformation`, errors);
}

function validateMask(mask, errors) {
  if (!isRecord(mask)) {
    errors.push("mask must be an object");
    return;
  }
  allowedKeys(mask, ["observationId", "opaqueMeans", "transparentMeans", "purpose"], "mask", errors);
  requiredString(mask.observationId, "mask.observationId", errors);
  if (mask.opaqueMeans !== "preserve") errors.push("mask.opaqueMeans must be preserve");
  if (mask.transparentMeans !== "regenerate") errors.push("mask.transparentMeans must be regenerate");
  requiredString(mask.purpose, "mask.purpose", errors);
}

function validateExecutionGate(gate, errors) {
  if (!isRecord(gate)) {
    errors.push("executionGate must be an object");
    return;
  }
  allowedKeys(gate, ["requiresHumanApproval", "status", "approvedBy", "approvedAt"], "executionGate", errors);
  if (gate.requiresHumanApproval !== true) errors.push("executionGate.requiresHumanApproval must be true");
  if (!["planned", "approved", "blocked", "rejected"].includes(gate.status)) errors.push("executionGate.status is unsupported");
  optionalString(gate.approvedBy, "executionGate.approvedBy", errors);
  optionalString(gate.approvedAt, "executionGate.approvedAt", errors);
}

function validateChecks(checks, path, errors) {
  if (!Array.isArray(checks) || checks.length < 1 || checks.length > 24) {
    errors.push(`${path} must contain 1–24 items`);
    return;
  }
  checks.forEach((check, index) => {
    const prefix = `${path}[${index}]`;
    if (!isRecord(check)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    allowedKeys(check, ["code", "status", "message"], prefix, errors);
    requiredString(check.code, `${prefix}.code`, errors);
    if (!["pending", "pass", "fail"].includes(check.status)) errors.push(`${prefix}.status is unsupported`);
    requiredString(check.message, `${prefix}.message`, errors);
  });
}

function validateRenderPlanPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "shotId", "proposalId", "skillReceipt", "mode", "promptPayloadRef", "canvas", "qualityBudget", "variantCount", "inputs", "mask", "requiredCapabilities", "executionGate", "preflight", "postflight", "notes"], "payload", errors);
  if (payload.kind !== "cineweave_codex_render_plan") errors.push("kind must be cineweave_codex_render_plan");
  requiredString(payload.worldId, "worldId", errors);
  optionalString(payload.shotId, "shotId", errors);
  optionalString(payload.proposalId, "proposalId", errors);
  validateReceipt(payload.skillReceipt, errors);
  const modes = new Set(["generate", "edit", "inpaint", "multi_reference"]);
  if (!modes.has(payload.mode)) errors.push("mode is unsupported");
  requiredString(payload.promptPayloadRef, "promptPayloadRef", errors);
  validateCanvas(payload.canvas, errors);
  if (!["draft", "explore", "final"].includes(payload.qualityBudget)) errors.push("qualityBudget is unsupported");
  if (!Number.isInteger(payload.variantCount) || payload.variantCount < 1 || payload.variantCount > 12) errors.push("variantCount must be an integer between 1 and 12");

  const inputIds = new Set();
  if (!Array.isArray(payload.inputs) || payload.inputs.length > 8) {
    errors.push("inputs must contain 0–8 items");
  } else {
    payload.inputs.forEach((input, index) => {
      validateRenderInput(input, `inputs[${index}]`, errors);
      if (isRecord(input) && typeof input.observationId === "string") {
        if (inputIds.has(input.observationId)) errors.push(`inputs contains duplicate observationId: ${input.observationId}`);
        inputIds.add(input.observationId);
      }
    });
  }
  if (payload.mask !== undefined) validateMask(payload.mask, errors);
  if (payload.requiredCapabilities !== undefined) {
    stringArray(payload.requiredCapabilities, "requiredCapabilities", errors, { min: 1, max: 8 });
    const capabilities = new Set(["native_image_generation", "multi_reference", "mask_inpaint", "exact_text", "high_resolution", "transparent_background"]);
    payload.requiredCapabilities.forEach((capability, index) => {
      if (!capabilities.has(capability)) errors.push(`requiredCapabilities[${index}] is unsupported`);
    });
  }
  validateExecutionGate(payload.executionGate, errors);

  if (!isRecord(payload.preflight)) {
    errors.push("preflight must be an object");
  } else {
    allowedKeys(payload.preflight, ["status", "checks"], "preflight", errors);
    if (!["pending", "ready", "blocked"].includes(payload.preflight.status)) errors.push("preflight.status is unsupported");
    validateChecks(payload.preflight.checks, "preflight.checks", errors);
  }

  if (!isRecord(payload.postflight)) {
    errors.push("postflight must be an object");
  } else {
    allowedKeys(payload.postflight, ["requiredArtifacts", "verify", "importStatus"], "postflight", errors);
    stringArray(payload.postflight.requiredArtifacts, "postflight.requiredArtifacts", errors);
    stringArray(payload.postflight.verify, "postflight.verify", errors);
    if (payload.postflight.importStatus !== "draft") errors.push("postflight.importStatus must be draft");
  }
  optionalString(payload.notes, "notes", errors);

  if (payload.mode === "edit" && inputIds.size < 1) errors.push("edit mode requires at least one reference input");
  if (payload.mode === "inpaint" && (inputIds.size < 1 || !payload.mask)) errors.push("inpaint mode requires a reference input and mask");
  if (payload.mode === "multi_reference" && inputIds.size < 2) errors.push("multi_reference mode requires at least two reference inputs");
  if (payload.mask && payload.mode !== "inpaint") errors.push("mask is only allowed for inpaint mode");
}

function validateReferenceSetPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "skillReceipt", "purpose", "references", "validation"], "payload", errors);
  if (payload.kind !== "cineweave_codex_reference_set") errors.push("kind must be cineweave_codex_reference_set");
  requiredString(payload.worldId, "worldId", errors);
  validateReceipt(payload.skillReceipt, errors);
  requiredString(payload.purpose, "purpose", errors);
  if (!Array.isArray(payload.references) || payload.references.length < 1 || payload.references.length > 8) {
    errors.push("references must contain 1–8 items");
  } else {
    const ids = new Set();
    payload.references.forEach((reference, index) => {
      const prefix = `references[${index}]`;
      if (!isRecord(reference)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      allowedKeys(reference, ["observationId", "role", "sourceType", "sourceLabel", "preserve", "allowedTransforms", "excluded"], prefix, errors);
      requiredString(reference.observationId, `${prefix}.observationId`, errors);
      if (!["identity", "composition", "lighting", "style", "material", "background", "mask", "reference"].includes(reference.role)) errors.push(`${prefix}.role is unsupported`);
      if (!["world_observation", "user_upload", "candidate_media"].includes(reference.sourceType)) errors.push(`${prefix}.sourceType is unsupported`);
      optionalString(reference.sourceLabel, `${prefix}.sourceLabel`, errors);
      stringArray(reference.preserve, `${prefix}.preserve`, errors);
      stringArray(reference.allowedTransforms, `${prefix}.allowedTransforms`, errors);
      if (reference.excluded !== undefined) stringArray(reference.excluded, `${prefix}.excluded`, errors);
      if (typeof reference.observationId === "string") {
        if (ids.has(reference.observationId)) errors.push(`references contains duplicate observationId: ${reference.observationId}`);
        ids.add(reference.observationId);
      }
    });
  }
  if (!isRecord(payload.validation)) {
    errors.push("validation must be an object");
  } else {
    allowedKeys(payload.validation, ["scopeChecked", "noPrivateUrls", "noSecrets"], "validation", errors);
    ["scopeChecked", "noPrivateUrls", "noSecrets"].forEach((field) => {
      if (payload.validation[field] !== true) errors.push(`validation.${field} must be true`);
    });
  }
}

function validateMediaImportPayload(payload, errors) {
  allowedKeys(payload, ["kind", "worldId", "shotId", "renderPlanRef", "skillReceipt", "status", "media", "verification", "importContract"], "payload", errors);
  if (payload.kind !== "cineweave_codex_media_import") errors.push("kind must be cineweave_codex_media_import");
  requiredString(payload.worldId, "worldId", errors);
  optionalString(payload.shotId, "shotId", errors);
  requiredString(payload.renderPlanRef, "renderPlanRef", errors);
  validateReceipt(payload.skillReceipt, errors);
  if (payload.status !== "draft") errors.push("status must be draft");
  if (!Array.isArray(payload.media) || payload.media.length < 1 || payload.media.length > 12) {
    errors.push("media must contain 1–12 items");
  } else {
    payload.media.forEach((item, index) => {
      const prefix = `media[${index}]`;
      if (!isRecord(item)) {
        errors.push(`${prefix} must be an object`);
        return;
      }
      allowedKeys(item, ["mediaId", "mediaType", "fileName", "format", "byteSize", "contentHash", "width", "height", "source"], prefix, errors);
      requiredString(item.mediaId, `${prefix}.mediaId`, errors);
      if (!["still", "storyboard_frame", "keyframe_candidate"].includes(item.mediaType)) errors.push(`${prefix}.mediaType is unsupported`);
      requiredString(item.fileName, `${prefix}.fileName`, errors);
      if (typeof item.fileName === "string" && /[\\/?%*:|"<>]/.test(item.fileName)) errors.push(`${prefix}.fileName must be a basename without path or URL characters`);
      if (!["png", "jpeg", "webp"].includes(item.format)) errors.push(`${prefix}.format is unsupported`);
      if (!Number.isInteger(item.byteSize) || item.byteSize < 1) errors.push(`${prefix}.byteSize must be a positive integer`);
      if (typeof item.contentHash !== "string" || !/^sha256:[0-9a-f]{64}$/i.test(item.contentHash)) errors.push(`${prefix}.contentHash must be sha256:<64 hex chars>`);
      if (!Number.isInteger(item.width) || item.width < 1) errors.push(`${prefix}.width must be a positive integer`);
      if (!Number.isInteger(item.height) || item.height < 1) errors.push(`${prefix}.height must be a positive integer`);
      if (!["codex_interactive", "user_upload", "external_adapter"].includes(item.source)) errors.push(`${prefix}.source is unsupported`);
    });
  }
  if (!isRecord(payload.verification)) {
    errors.push("verification must be an object");
  } else {
    allowedKeys(payload.verification, ["fileExists", "contentHashPresent", "dimensionsDetected", "privateUrlAbsent", "status"], "verification", errors);
    ["fileExists", "contentHashPresent", "dimensionsDetected", "privateUrlAbsent"].forEach((field) => {
      if (payload.verification[field] !== true) errors.push(`verification.${field} must be true`);
    });
    if (!["verified", "blocked"].includes(payload.verification.status)) errors.push("verification.status is unsupported");
  }
  if (!isRecord(payload.importContract)) {
    errors.push("importContract must be an object");
  } else {
    allowedKeys(payload.importContract, ["source", "statusOnCreation", "nextAction"], "importContract", errors);
    if (!["codex_interactive", "user_upload", "external_adapter"].includes(payload.importContract.source)) errors.push("importContract.source is unsupported");
    if (payload.importContract.statusOnCreation !== "draft") errors.push("importContract.statusOnCreation must be draft");
    requiredString(payload.importContract.nextAction, "importContract.nextAction", errors);
  }
}

const validators = new Map([
  ["proposal-output.schema.json", validateProposalPayload],
  ["hypothesis-output.schema.json", validateHypothesisPayload],
  ["draft-brief.schema.json", validateDraftBrief],
  ["image-prompt-output.schema.json", validateImagePromptPayload],
  ["prompt-record.schema.json", validatePromptRecordPayload],
  ["storyboard-output.schema.json", validateStoryboardPayload],
  ["render-plan.schema.json", validateRenderPlanPayload],
  ["reference-set.schema.json", validateReferenceSetPayload],
  ["media-import.schema.json", validateMediaImportPayload]
]);

async function main() {
  const [, , schemaPath, payloadPath] = process.argv;
  if (!schemaPath || !payloadPath) {
    usage();
    process.exitCode = 2;
    return;
  }
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  const payload = JSON.parse(await readFile(payloadPath, "utf8"));
  const errors = [];
  if (!isRecord(schema) || typeof schema.$id !== "string") errors.push("schema must expose a string $id");
  if (!isRecord(payload)) errors.push("payload must be an object");
  const schemaName = typeof schema?.$id === "string" ? schema.$id.split("/").pop() : "";
  const validator = validators.get(schemaName);
  if (!validator) errors.push(`unsupported schema id: ${schemaName || "missing"}`);
  else if (isRecord(payload)) validator(payload, errors);
  if (errors.length) {
    console.error(JSON.stringify({ valid: false, errors }, null, 2));
    process.exitCode = 2;
    return;
  }
  console.log(JSON.stringify({ valid: true, schema: schema.$id, payload: payloadPath }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
