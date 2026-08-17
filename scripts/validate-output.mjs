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

function validateReceipt(receipt, errors) {
  if (!isRecord(receipt)) {
    errors.push("skillReceipt must be an object");
    return;
  }
  requiredString(receipt.repository, "skillReceipt.repository", errors);
  requiredString(receipt.ref, "skillReceipt.ref", errors);
  requiredString(receipt.commit, "skillReceipt.commit", errors);
  if (receipt.installedBy !== "codex-environment") errors.push("skillReceipt.installedBy must be codex-environment");
  requiredString(receipt.usedAt, "skillReceipt.usedAt", errors);
  if (typeof receipt.repository === "string" && !/^https:\/\/(www\.)?github\.com\/[^/]+\/[^/]+\/?$/.test(receipt.repository)) errors.push("skillReceipt.repository must be a GitHub HTTPS repository URL");
  if (typeof receipt.commit === "string" && !/^[0-9a-f]{7,64}$/i.test(receipt.commit)) errors.push("skillReceipt.commit must be a Git SHA");
  if (receipt.contentHash !== undefined && (typeof receipt.contentHash !== "string" || !/^sha256:[0-9a-f]{64}$/i.test(receipt.contentHash))) errors.push("skillReceipt.contentHash must be sha256:<64 hex chars>");
}

function validateProposalPayload(payload, errors) {
  validateReceipt(payload.skillReceipt, errors);
  if (!Array.isArray(payload.proposals) || payload.proposals.length < 2 || payload.proposals.length > 5) {
    errors.push("proposals must contain 2–5 items");
    return;
  }
  payload.proposals.forEach((proposal, index) => {
    const prefix = `proposals[${index}]`;
    if (!isRecord(proposal)) {
      errors.push(`${prefix} must be an object`);
      return;
    }
    ["title", "summary", "narrativeIntent", "audienceFeeling", "composition", "camera", "performance", "visualTreatment", "soundEdit", "cost", "risk"].forEach((field) => requiredString(proposal[field], `${prefix}.${field}`, errors));
    if (!Array.isArray(proposal.styleStack) || proposal.styleStack.length < 1) errors.push(`${prefix}.styleStack must not be empty`);
    if (!Array.isArray(proposal.preserve) || proposal.preserve.length < 1) errors.push(`${prefix}.preserve must not be empty`);
    if (!Array.isArray(proposal.allowedChanges) || proposal.allowedChanges.length < 1) errors.push(`${prefix}.allowedChanges must not be empty`);
    if (proposal.recommendedProvider !== "codex" && proposal.recommendedProvider !== "libtv") errors.push(`${prefix}.recommendedProvider must be codex or libtv`);
  });
}

function validateDraftBrief(payload, errors) {
  if (payload.kind !== "cineweave_codex_interactive_draft_brief") errors.push("kind must be cineweave_codex_interactive_draft_brief");
  ["worldId", "shotPurpose", "primaryFocus", "composition", "camera", "visualTreatment"].forEach((field) => requiredString(payload[field], field, errors));
  ["preserve", "allowedChanges", "negativeConstraints"].forEach((field) => {
    if (!Array.isArray(payload[field]) || payload[field].length < 1) errors.push(`${field} must not be empty`);
  });
  if (!isRecord(payload.importContract)) {
    errors.push("importContract must be an object");
    return;
  }
  if (payload.importContract.source !== "codex_interactive") errors.push("importContract.source must be codex_interactive");
  if (payload.importContract.statusOnCreation !== "draft") errors.push("importContract.statusOnCreation must be draft");
  ["requiredMedia", "nextAction"].forEach((field) => requiredString(payload.importContract[field], `importContract.${field}`, errors));
}

function validateHypothesisPayload(payload, errors) {
  if (payload.kind !== "cineweave_codex_prompt_hypothesis") errors.push("kind must be cineweave_codex_prompt_hypothesis");
  requiredString(payload.worldId, "worldId", errors);
  validateReceipt(payload.skillReceipt, errors);
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
    ["fragment", "category", "confidence"].forEach((field) => requiredString(hypothesis[field], `${prefix}.${field}`, errors));
    if (!categories.has(hypothesis.category)) errors.push(`${prefix}.category is unsupported`);
    if (!confidences.has(hypothesis.confidence)) errors.push(`${prefix}.confidence is unsupported`);
    ["unknowns", "observationIds"].forEach((field) => {
      if (!Array.isArray(hypothesis[field])) errors.push(`${prefix}.${field} must be an array`);
    });
    if (hypothesis.alternativeHypotheses !== undefined && !Array.isArray(hypothesis.alternativeHypotheses)) errors.push(`${prefix}.alternativeHypotheses must be an array when provided`);
  });
}

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
  if (!isRecord(schema) || !schema.$id) errors.push("schema must expose an $id");
  if (!isRecord(payload)) errors.push("payload must be an object");
  else if (schema.title?.includes("Proposal")) validateProposalPayload(payload, errors);
  else if (schema.title?.includes("Draft Brief")) validateDraftBrief(payload, errors);
  else if (schema.title?.includes("Prompt Hypothesis")) validateHypothesisPayload(payload, errors);
  else errors.push("unsupported schema title");
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
