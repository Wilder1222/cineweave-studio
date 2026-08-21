import { readFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import { listArtifacts, readStrictJson, verifyProject } from "./artifact-store.mjs";
import { sha256Canonical } from "./canonical-json.mjs";

const identifierPattern = /^[a-z0-9][a-z0-9._-]{1,159}$/;
const contentHashPattern = /^sha256:[0-9a-f]{64}$/;

function exactKeys(value, expected) {
  const keys = Object.keys(value).sort();
  return keys.length === expected.length && expected.every((key, index) => keys[index] === key);
}

export function normalizeArtifactRef(value, label = "artifactRef") {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
  if (!exactKeys(value, ["contentHash", "id", "kind", "version"])) throw new TypeError(`${label} must contain exactly kind, id, version and contentHash`);
  if (!identifierPattern.test(value.kind || "")) throw new TypeError(`${label}.kind is invalid`);
  if (!identifierPattern.test(value.id || "")) throw new TypeError(`${label}.id is invalid`);
  if (!Number.isSafeInteger(value.version) || value.version < 1) throw new TypeError(`${label}.version must be a positive safe integer`);
  if (!contentHashPattern.test(value.contentHash || "")) throw new TypeError(`${label}.contentHash must be a lowercase SHA-256 hash`);
  return { kind: value.kind, id: value.id, version: value.version, contentHash: value.contentHash };
}

export function artifactRefKey(value) {
  const ref = normalizeArtifactRef(value);
  return `${ref.kind}/${ref.id}@${ref.version}:${ref.contentHash}`;
}

function identityKey(ref) {
  return `${ref.kind}/${ref.id}`;
}

function versionKey(ref) {
  return `${identityKey(ref)}@${ref.version}`;
}

function pointerToken(value) {
  return String(value).replaceAll("~", "~0").replaceAll("/", "~1");
}

export function collectContractRefs(value, pointer = "", result = []) {
  if (!value || typeof value !== "object") return result;
  if (!Array.isArray(value)) {
    try {
      result.push({ artifactRef: normalizeArtifactRef(value), jsonPointer: pointer });
      return result;
    } catch {
      // Continue traversing non-reference objects.
    }
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectContractRefs(item, `${pointer}/${index}`, result));
  } else {
    for (const [key, child] of Object.entries(value)) collectContractRefs(child, `${pointer}/${pointerToken(key)}`, result);
  }
  return result;
}

async function listApprovalRecords(projectRoot) {
  const directory = join(resolve(projectRoot), ".cineweave", "approvals");
  if (!existsSync(directory)) return [];
  const records = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".json")) continue;
    const path = join(directory, entry.name);
    const record = await readStrictJson(path);
    const { approvalHash, ...body } = record;
    if (sha256Canonical(body) !== approvalHash) throw new Error(`Approval hash mismatch: ${path}`);
    if (record.kind !== "cineweave_approval_record" || !["2.2.0", "2.3.0", "2.3.1", "2.4.0"].includes(record.contractVersion)) throw new Error(`Approval kind/version mismatch: ${path}`);
    if (!identifierPattern.test(record.approvalId || "") || !["approved", "rejected"].includes(record.decision)) throw new Error(`Approval identity/decision mismatch: ${path}`);
    if (typeof record.actor !== "string" || !record.actor.trim() || Number.isNaN(Date.parse(record.decidedAt))) throw new Error(`Approval actor/time mismatch: ${path}`);
    if (!contentHashPattern.test(approvalHash || "")) throw new Error(`Approval hash format mismatch: ${path}`);
    const artifactRef = normalizeArtifactRef(record.artifactRef, "approval.artifactRef");
    records.push({ path, record, artifactRef });
  }
  return records;
}

function latestApprovalsByArtifact(records) {
  const grouped = new Map();
  for (const item of records) {
    const key = artifactRefKey(item.artifactRef);
    const current = grouped.get(key);
    if (!current) {
      grouped.set(key, item);
      continue;
    }
    const time = Date.parse(item.record.decidedAt) - Date.parse(current.record.decidedAt);
    if (time > 0 || time === 0 && item.record.approvalHash.localeCompare(current.record.approvalHash) > 0) grouped.set(key, item);
  }
  return grouped;
}

function stronglyConnectedComponents(nodeKeys, edges) {
  const adjacency = new Map([...nodeKeys].map((key) => [key, []]));
  for (const edge of edges) if (edge.status === "resolved" && adjacency.has(edge.sourceKey) && adjacency.has(edge.targetKey)) adjacency.get(edge.sourceKey).push(edge.targetKey);
  for (const values of adjacency.values()) values.sort();

  let index = 0;
  const indices = new Map();
  const lowLinks = new Map();
  const stack = [];
  const onStack = new Set();
  const components = [];

  function visit(key) {
    indices.set(key, index);
    lowLinks.set(key, index);
    index += 1;
    stack.push(key);
    onStack.add(key);
    for (const target of adjacency.get(key) || []) {
      if (!indices.has(target)) {
        visit(target);
        lowLinks.set(key, Math.min(lowLinks.get(key), lowLinks.get(target)));
      } else if (onStack.has(target)) {
        lowLinks.set(key, Math.min(lowLinks.get(key), indices.get(target)));
      }
    }
    if (lowLinks.get(key) !== indices.get(key)) return;
    const component = [];
    while (stack.length) {
      const member = stack.pop();
      onStack.delete(member);
      component.push(member);
      if (member === key) break;
    }
    component.sort();
    const selfLoop = component.length === 1 && (adjacency.get(component[0]) || []).includes(component[0]);
    if (component.length > 1 || selfLoop) components.push(component);
  }

  for (const key of [...nodeKeys].sort()) if (!indices.has(key)) visit(key);
  return components.sort((left, right) => left[0].localeCompare(right[0]));
}

export function detectDependencyCycles(nodeKeys, edges) {
  return stronglyConnectedComponents(new Set(nodeKeys), edges);
}

function closure(rootKey, direction, allEdges) {
  const outgoing = new Map();
  const incoming = new Map();
  for (const edge of allEdges) {
    if (edge.status !== "resolved") continue;
    if (!outgoing.has(edge.sourceKey)) outgoing.set(edge.sourceKey, []);
    if (!incoming.has(edge.targetKey)) incoming.set(edge.targetKey, []);
    outgoing.get(edge.sourceKey).push(edge.targetKey);
    incoming.get(edge.targetKey).push(edge.sourceKey);
  }
  const selected = new Set([rootKey]);
  const queue = [rootKey];
  while (queue.length) {
    const current = queue.shift();
    const next = [];
    if (direction === "dependencies" || direction === "both") next.push(...(outgoing.get(current) || []));
    if (direction === "dependents" || direction === "both") next.push(...(incoming.get(current) || []));
    for (const key of next.sort()) if (!selected.has(key)) { selected.add(key); queue.push(key); }
  }
  return selected;
}

function approvalView(item) {
  if (!item) return { state: "unreviewed", approvalId: null, decision: null, actor: null, decidedAt: null, approvalHash: null };
  return {
    state: item.record.decision,
    approvalId: item.record.approvalId,
    decision: item.record.decision,
    actor: item.record.actor,
    decidedAt: item.record.decidedAt,
    approvalHash: item.record.approvalHash
  };
}

function createGate(rootKey, selectedKeys, nodesByKey, edges, cycles, policy) {
  const root = nodesByKey.get(rootKey);
  const selectedEdges = edges.filter((edge) => selectedKeys.has(edge.sourceKey));
  const missing = selectedEdges.filter((edge) => edge.status === "missing");
  const mismatched = selectedEdges.filter((edge) => edge.status === "hash_mismatch");
  const staleEdges = selectedEdges.filter((edge) => edge.status === "resolved" && edge.targetVersionState === "superseded");
  const cycleCount = cycles.filter((cycle) => cycle.some((key) => selectedKeys.has(key))).length;
  const unapprovedDependencies = [...selectedKeys]
    .filter((key) => key !== rootKey && nodesByKey.get(key)?.approval.state !== "approved")
    .sort();
  const blockingReasons = [];
  const warnings = [];
  if (root.approval.state === "rejected") blockingReasons.push("artifact_rejected");
  else if (root.approval.state !== "approved") blockingReasons.push("artifact_unapproved");
  if (missing.length) blockingReasons.push("missing_dependencies");
  if (mismatched.length) blockingReasons.push("hash_mismatched_dependencies");
  if (cycleCount) blockingReasons.push("dependency_cycle");
  if (policy.requireDependencyApprovals && unapprovedDependencies.length) blockingReasons.push("unapproved_dependencies");
  if (root.versionState === "superseded") {
    if (policy.requireCurrent) blockingReasons.push("artifact_superseded");
    else warnings.push("artifact_superseded");
  }
  if (staleEdges.length) {
    if (policy.requireCurrent) blockingReasons.push("superseded_dependency_refs");
    else warnings.push("superseded_dependency_refs");
  }
  return {
    artifactRef: root.artifactRef,
    policy,
    approvalState: root.approval.state,
    allowed: blockingReasons.length === 0,
    blockingReasons,
    warnings,
    missingDependencyCount: missing.length,
    hashMismatchDependencyCount: mismatched.length,
    supersededDependencyRefCount: staleEdges.length,
    unapprovedDependencyCount: unapprovedDependencies.length,
    cycleCount
  };
}

export async function buildArtifactGraph(projectRoot, options = {}) {
  const root = resolve(projectRoot);
  const verification = await verifyProject(root);
  if (!verification.valid) throw new Error(`Project verification failed before graph construction: ${verification.errors.join("; ")}`);
  const projectPath = join(root, ".cineweave", "project.json");
  const projectBytes = await readFile(projectPath);
  const project = await readStrictJson(projectPath);
  const artifacts = await listArtifacts(root);
  const records = await listApprovalRecords(root);
  const latestApprovals = latestApprovalsByArtifact(records);
  const artifactsByKey = new Map();
  const versionHashes = new Map();
  const latestVersions = new Map();

  for (const item of artifacts) {
    const ref = normalizeArtifactRef(item.envelope.artifactRef);
    const key = artifactRefKey(ref);
    artifactsByKey.set(key, { ...item, ref, key });
    versionHashes.set(versionKey(ref), ref.contentHash);
    latestVersions.set(identityKey(ref), Math.max(latestVersions.get(identityKey(ref)) || 0, ref.version));
  }

  const allEdges = [];
  for (const item of artifactsByKey.values()) {
    for (const reference of collectContractRefs(item.envelope.payload)) {
      const targetRef = reference.artifactRef;
      const targetKey = artifactRefKey(targetRef);
      const availableHash = versionHashes.get(versionKey(targetRef));
      const status = artifactsByKey.has(targetKey) ? "resolved" : availableHash ? "hash_mismatch" : "missing";
      const targetLatest = latestVersions.get(identityKey(targetRef)) || null;
      const targetVersionState = status !== "resolved" ? "unresolved" : targetRef.version < targetLatest ? "superseded" : "current";
      allEdges.push({
        sourceKey: item.key,
        targetKey,
        sourceArtifactRef: item.ref,
        targetArtifactRef: targetRef,
        jsonPointer: reference.jsonPointer,
        status,
        targetVersionState,
        latestAvailableVersion: targetLatest
      });
    }
  }
  allEdges.sort((left, right) => left.sourceKey.localeCompare(right.sourceKey) || left.jsonPointer.localeCompare(right.jsonPointer) || left.targetKey.localeCompare(right.targetKey));

  const nodesByKey = new Map();
  for (const item of artifactsByKey.values()) {
    const latestVersion = latestVersions.get(identityKey(item.ref));
    nodesByKey.set(item.key, {
      key: item.key,
      artifactRef: item.ref,
      artifactStatus: item.envelope.status,
      createdAt: item.envelope.createdAt,
      createdBy: item.envelope.createdBy,
      latestVersion,
      versionState: item.ref.version < latestVersion ? "superseded" : "current",
      approval: approvalView(latestApprovals.get(item.key)),
      inboundReferenceCount: 0,
      outboundReferenceCount: 0
    });
  }

  const direction = options.direction || (options.rootArtifactRef ? "dependencies" : "both");
  if (!new Set(["dependencies", "dependents", "both"]).has(direction)) throw new TypeError("direction must be dependencies, dependents or both");
  let rootKey = null;
  let selectedKeys = new Set(nodesByKey.keys());
  let rootArtifactRef = null;
  if (options.rootArtifactRef) {
    rootArtifactRef = normalizeArtifactRef(options.rootArtifactRef, "rootArtifactRef");
    rootKey = artifactRefKey(rootArtifactRef);
    if (!nodesByKey.has(rootKey)) throw new Error(`Graph root does not exist: ${rootKey}`);
    selectedKeys = closure(rootKey, direction, allEdges);
  }

  const edges = allEdges.filter((edge) => selectedKeys.has(edge.sourceKey) && (edge.status !== "resolved" || selectedKeys.has(edge.targetKey)));
  for (const edge of edges) {
    nodesByKey.get(edge.sourceKey).outboundReferenceCount += 1;
    if (edge.status === "resolved" && nodesByKey.has(edge.targetKey)) nodesByKey.get(edge.targetKey).inboundReferenceCount += 1;
  }
  const nodes = [...selectedKeys].map((key) => nodesByKey.get(key)).sort((left, right) => left.key.localeCompare(right.key));
  const cyclesAsKeys = stronglyConnectedComponents(selectedKeys, edges);
  const cycles = cyclesAsKeys.map((members, index) => ({
    cycleId: `cycle.${String(index + 1).padStart(3, "0")}`,
    artifactRefs: members.map((key) => nodesByKey.get(key).artifactRef),
    edgeCount: edges.filter((edge) => edge.status === "resolved" && members.includes(edge.sourceKey) && members.includes(edge.targetKey)).length
  }));
  const approvalCounts = { unreviewed: 0, approved: 0, rejected: 0 };
  for (const node of nodes) approvalCounts[node.approval.state] += 1;
  const gatePolicy = {
    requireCurrent: options.requireCurrent === true,
    requireDependencyApprovals: options.requireDependencyApprovals === true
  };
  let gate = null;
  if (options.gateArtifactRef) {
    const gateKey = artifactRefKey(normalizeArtifactRef(options.gateArtifactRef, "gateArtifactRef"));
    if (!rootKey || gateKey !== rootKey) throw new Error("Gate queries require the same exact rootArtifactRef");
    if (!selectedKeys.has(gateKey)) throw new Error(`Gate artifact is outside the selected graph scope: ${gateKey}`);
    gate = createGate(gateKey, selectedKeys, nodesByKey, edges, cyclesAsKeys, gatePolicy);
  }

  return {
    kind: "cineweave_artifact_graph",
    contractVersion: "2.4.0",
    generatedAt: options.generatedAt || new Date().toISOString(),
    project: {
      projectId: project.projectId,
      projectManifestHash: `sha256:${createHash("sha256").update(projectBytes).digest("hex")}`,
      runtimeVersion: project.runtimeVersion
    },
    scope: {
      mode: rootArtifactRef ? "artifact_closure" : "project",
      rootArtifactRef,
      direction
    },
    nodes,
    edges: edges.map(({ sourceKey, targetKey, ...edge }) => edge),
    cycles,
    gate,
    summary: {
      artifactCount: nodes.length,
      referenceCount: edges.length,
      resolvedReferenceCount: edges.filter((edge) => edge.status === "resolved").length,
      missingReferenceCount: edges.filter((edge) => edge.status === "missing").length,
      hashMismatchReferenceCount: edges.filter((edge) => edge.status === "hash_mismatch").length,
      supersededArtifactCount: nodes.filter((node) => node.versionState === "superseded").length,
      supersededReferenceCount: edges.filter((edge) => edge.status === "resolved" && edge.targetVersionState === "superseded").length,
      rootCount: nodes.filter((node) => node.inboundReferenceCount === 0).length,
      leafCount: nodes.filter((node) => node.outboundReferenceCount === 0).length,
      cycleCount: cycles.length,
      approvalCounts
    }
  };
}

export async function loadEnvelopeArtifactRef(path) {
  const envelope = await readStrictJson(resolve(path));
  if (envelope.kind !== "cineweave_artifact_envelope") throw new TypeError(`Expected a CineWeave artifact envelope: ${basename(path)}`);
  return normalizeArtifactRef(envelope.artifactRef);
}

export async function evaluateApprovalGate(projectRoot, artifactRef, options = {}) {
  return buildArtifactGraph(projectRoot, {
    ...options,
    rootArtifactRef: artifactRef,
    gateArtifactRef: artifactRef,
    direction: "dependencies"
  });
}
