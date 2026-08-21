import { lstat, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { readStrictJson, verifyProject } from "./artifact-store.mjs";
import { parseJsonStrict, sha256Bytes, sha256Canonical } from "./canonical-json.mjs";

export const BUNDLE_FORMAT_VERSION = "1.1.0";
export const BUNDLE_MANIFEST_NAME = "cineweave-bundle.json";
const MAX_BUNDLE_ENTRIES = 500000;
const contentHashPattern = /^sha256:[0-9a-f]{64}$/;
const identifier = "[a-z0-9][a-z0-9._-]{1,159}";
const artifactEnvelopePattern = new RegExp(`^artifacts/${identifier}/${identifier}/v[1-9][0-9]*-[0-9a-f]{16}\\.json$`);
const versionPointerPattern = new RegExp(`^artifacts/${identifier}/${identifier}/v[1-9][0-9]*\\.ref$`);
const approvalPattern = /^approvals\/[0-9a-f]{64}\.json$/;
const idempotencyPattern = /^idempotency\/[0-9a-f]{64}\.json$/;
const executionPattern = new RegExp(`^executions/${identifier}/[a-zA-Z0-9][a-zA-Z0-9._-]{0,159}$`);
const referenceBlobPattern = /^reference-blobs\/sha256\/[0-9a-f]{2}\/[0-9a-f]{64}\.blob$/;

function slashPath(value) {
  return value.split(sep).join("/");
}

function assertPlainObject(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be an object`);
}

function assertExactKeys(value, required, optional = [], label = "object") {
  const allowed = new Set([...required, ...optional]);
  for (const key of required) if (!(key in value)) throw new TypeError(`${label}.${key} is required`);
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new TypeError(`${label}.${key} is not allowed`);
}

function assertSafeBundlePath(value) {
  if (typeof value !== "string" || value.length < 7 || value.length > 800) throw new TypeError("bundle entry path is invalid");
  if (value.includes("\\") || value.includes(":") || value.includes("\0") || value.startsWith("/") || !value.startsWith("store/")) throw new TypeError(`Unsafe bundle entry path: ${value}`);
  const parts = value.split("/");
  if (parts.some((part) => !part || part === "." || part === "..")) throw new TypeError(`Unsafe bundle entry path: ${value}`);
  return value;
}

export function classifyStorePath(value) {
  const path = slashPath(value);
  if (path === "project.json") return "project_manifest";
  if (artifactEnvelopePattern.test(path)) return "artifact_envelope";
  if (versionPointerPattern.test(path)) return "version_pointer";
  if (approvalPattern.test(path)) return "approval_record";
  if (idempotencyPattern.test(path)) return "idempotency_claim";
  if (executionPattern.test(path)) return "execution_output";
  if (referenceBlobPattern.test(path)) return "reference_blob";
  throw new Error(`Project store contains an unsupported path: ${path}`);
}

async function pathInfo(path) {
  try { return await lstat(path); }
  catch (error) { if (error?.code === "ENOENT") return null; throw error; }
}

async function walkRegularFiles(root) {
  const rootInfo = await pathInfo(root);
  if (!rootInfo) throw new Error(`Directory does not exist: ${root}`);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory()) throw new Error(`Expected a real directory, not a link: ${root}`);
  const files = [];
  async function visit(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const current = join(directory, entry.name);
      const info = await lstat(current);
      if (info.isSymbolicLink()) throw new Error(`Symbolic links are not allowed in project bundles: ${current}`);
      if (info.isDirectory()) await visit(current);
      else if (info.isFile()) files.push(current);
      else throw new Error(`Only regular files are allowed in project bundles: ${current}`);
    }
  }
  await visit(root);
  return files.sort((left, right) => slashPath(relative(root, left)).localeCompare(slashPath(relative(root, right))));
}

function summaryFor(entries, bundleFormatVersion = BUNDLE_FORMAT_VERSION) {
  const summary = {
    fileCount: entries.length,
    totalBytes: entries.reduce((total, entry) => total + entry.byteLength, 0),
    projectManifestCount: 0,
    artifactEnvelopeCount: 0,
    versionPointerCount: 0,
    approvalRecordCount: 0,
    idempotencyClaimCount: 0,
    executionOutputCount: 0,
    ...(bundleFormatVersion === "1.1.0" ? { referenceBlobCount: 0 } : {})
  };
  const fields = {
    project_manifest: "projectManifestCount",
    artifact_envelope: "artifactEnvelopeCount",
    version_pointer: "versionPointerCount",
    approval_record: "approvalRecordCount",
    idempotency_claim: "idempotencyClaimCount",
    execution_output: "executionOutputCount",
    reference_blob: "referenceBlobCount"
  };
  for (const entry of entries) {
    const field = fields[entry.category];
    if (!(field in summary)) throw new TypeError(`Bundle format ${bundleFormatVersion} does not support ${entry.category}`);
    summary[field] += 1;
  }
  return summary;
}

function bundleHashInput(manifest) {
  return {
    bundleFormatVersion: manifest.bundleFormatVersion,
    sourceProject: manifest.sourceProject,
    purpose: manifest.purpose,
    contentPolicy: manifest.contentPolicy,
    storeDirectory: manifest.storeDirectory,
    entries: manifest.entries,
    summary: manifest.summary
  };
}

function assertBundleManifest(manifest) {
  assertPlainObject(manifest, "bundle manifest");
  assertExactKeys(manifest, ["kind", "contractVersion", "bundleFormatVersion", "bundleHash", "createdAt", "sourceProject", "purpose", "contentPolicy", "storeDirectory", "entries", "summary"], [], "bundle manifest");
  const supportedPair = manifest.contractVersion === "2.3.1" && manifest.bundleFormatVersion === "1.0.0" || manifest.contractVersion === "2.4.0" && manifest.bundleFormatVersion === "1.1.0";
  if (manifest.kind !== "cineweave_project_bundle_manifest" || !supportedPair) throw new TypeError("Unsupported CineWeave bundle manifest version");
  if (!contentHashPattern.test(manifest.bundleHash || "")) throw new TypeError("bundleHash must be a lowercase SHA-256 hash");
  if (Number.isNaN(Date.parse(manifest.createdAt))) throw new TypeError("createdAt must be an ISO date-time");
  if (manifest.purpose !== "local_transfer" || manifest.storeDirectory !== "store") throw new TypeError("Bundle purpose or store directory is unsupported");

  assertPlainObject(manifest.sourceProject, "sourceProject");
  assertExactKeys(manifest.sourceProject, ["projectId", "projectManifestHash", "runtimeVersion"], [], "sourceProject");
  if (!new RegExp(`^${identifier}$`).test(manifest.sourceProject.projectId || "")) throw new TypeError("sourceProject.projectId is invalid");
  if (!contentHashPattern.test(manifest.sourceProject.projectManifestHash || "")) throw new TypeError("sourceProject.projectManifestHash is invalid");
  if (!["2.2.0", "2.3.0", "2.3.1", "2.4.0"].includes(manifest.sourceProject.runtimeVersion)) throw new TypeError("sourceProject.runtimeVersion is unsupported");
  assertPlainObject(manifest.contentPolicy, "contentPolicy");
  const contentPolicyKeys = manifest.bundleFormatVersion === "1.1.0" ? ["containsProjectContent", "containsReferenceMedia", "redistributionAuthorized", "rightsApprovalImplied"] : ["containsProjectContent", "redistributionAuthorized", "rightsApprovalImplied"];
  assertExactKeys(manifest.contentPolicy, contentPolicyKeys, [], "contentPolicy");
  if (manifest.contentPolicy.containsProjectContent !== true || manifest.contentPolicy.redistributionAuthorized !== false || manifest.contentPolicy.rightsApprovalImplied !== false) throw new TypeError("Bundle content policy must not imply redistribution or rights approval");
  if (manifest.bundleFormatVersion === "1.1.0" && typeof manifest.contentPolicy.containsReferenceMedia !== "boolean") throw new TypeError("containsReferenceMedia must be boolean");
  if (!Array.isArray(manifest.entries) || !manifest.entries.length || manifest.entries.length > MAX_BUNDLE_ENTRIES) throw new TypeError(`Bundle entries must contain 1 to ${MAX_BUNDLE_ENTRIES} items`);

  const paths = new Set();
  let previous = "";
  for (const [index, entry] of manifest.entries.entries()) {
    assertPlainObject(entry, `entries[${index}]`);
    assertExactKeys(entry, ["path", "category", "contentHash", "byteLength"], [], `entries[${index}]`);
    assertSafeBundlePath(entry.path);
    if (paths.has(entry.path)) throw new TypeError(`Duplicate bundle entry path: ${entry.path}`);
    if (previous && previous.localeCompare(entry.path) >= 0) throw new TypeError("Bundle entries must be sorted by path");
    paths.add(entry.path);
    previous = entry.path;
    const expectedCategory = classifyStorePath(entry.path.slice("store/".length));
    if (entry.category !== expectedCategory) throw new TypeError(`Bundle entry category mismatch: ${entry.path}`);
    if (!contentHashPattern.test(entry.contentHash || "")) throw new TypeError(`Bundle entry hash is invalid: ${entry.path}`);
    if (!Number.isSafeInteger(entry.byteLength) || entry.byteLength < 0) throw new TypeError(`Bundle entry byteLength is invalid: ${entry.path}`);
  }
  if (!paths.has("store/project.json")) throw new TypeError("Bundle is missing store/project.json");
  if (manifest.entries.find((entry) => entry.path === "store/project.json").contentHash !== manifest.sourceProject.projectManifestHash) throw new TypeError("Bundle project entry hash does not match sourceProject.projectManifestHash");
  assertPlainObject(manifest.summary, "summary");
  const summaryKeys = ["fileCount", "totalBytes", "projectManifestCount", "artifactEnvelopeCount", "versionPointerCount", "approvalRecordCount", "idempotencyClaimCount", "executionOutputCount", ...(manifest.bundleFormatVersion === "1.1.0" ? ["referenceBlobCount"] : [])];
  assertExactKeys(manifest.summary, summaryKeys, [], "summary");
  const expectedSummary = summaryFor(manifest.entries, manifest.bundleFormatVersion);
  if (!Number.isSafeInteger(expectedSummary.totalBytes)) throw new TypeError("Bundle total byte length exceeds the safe integer range");
  for (const [key, value] of Object.entries(expectedSummary)) if (manifest.summary[key] !== value) throw new TypeError("Bundle summary does not match its entries");
  if (manifest.bundleFormatVersion === "1.1.0" && manifest.contentPolicy.containsReferenceMedia !== manifest.entries.some((entry) => entry.category === "reference_blob")) throw new TypeError("Bundle reference-media policy does not match its entries");
  if (sha256Canonical(bundleHashInput(manifest)) !== manifest.bundleHash) throw new TypeError("Bundle hash does not match its manifest entries");
  return manifest;
}

function assertCleanupTarget(path, parent, prefix) {
  const absolute = resolve(path);
  const expectedParent = `${resolve(parent)}${sep}`;
  if (!absolute.startsWith(expectedParent) || !basename(absolute).startsWith(prefix)) throw new Error(`Refusing to clean an unexpected temporary path: ${absolute}`);
}

export async function exportProjectBundle(projectRoot, bundleDirectory, options = {}) {
  const project = resolve(projectRoot);
  const store = join(project, ".cineweave");
  const target = resolve(bundleDirectory);
  if (await pathInfo(target)) throw new Error(`Bundle destination already exists: ${target}`);
  const verification = await verifyProject(project);
  if (!verification.valid) throw new Error(`Project verification failed before export: ${verification.errors.join("; ")}`);
  const files = await walkRegularFiles(store);
  const classified = files.map((path) => {
    const relativePath = slashPath(relative(store, path));
    return { path, relativePath, category: classifyStorePath(relativePath) };
  });
  await mkdir(dirname(target), { recursive: true });
  const temporary = await mkdtemp(join(dirname(target), `.${basename(target)}.tmp-`));
  assertCleanupTarget(temporary, dirname(target), `.${basename(target)}.tmp-`);
  try {
    const entries = [];
    for (const item of classified) {
      const info = await lstat(item.path);
      if (info.isSymbolicLink() || !info.isFile()) throw new Error(`Project store changed during export: ${item.path}`);
      const bytes = await readFile(item.path);
      const bundlePath = `store/${item.relativePath}`;
      const destination = join(temporary, ...bundlePath.split("/"));
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes, { flag: "wx" });
      entries.push({ path: bundlePath, category: item.category, contentHash: sha256Bytes(bytes), byteLength: bytes.byteLength });
    }
    entries.sort((left, right) => left.path.localeCompare(right.path));
    const projectEntry = entries.find((entry) => entry.path === "store/project.json");
    const projectManifest = await readStrictJson(join(store, "project.json"));
    const manifest = {
      kind: "cineweave_project_bundle_manifest",
      contractVersion: "2.4.0",
      bundleFormatVersion: BUNDLE_FORMAT_VERSION,
      bundleHash: "",
      createdAt: options.createdAt || new Date().toISOString(),
      sourceProject: {
        projectId: projectManifest.projectId,
        projectManifestHash: projectEntry.contentHash,
        runtimeVersion: projectManifest.runtimeVersion
      },
      purpose: "local_transfer",
      contentPolicy: {
        containsProjectContent: true,
        containsReferenceMedia: entries.some((entry) => entry.category === "reference_blob"),
        redistributionAuthorized: false,
        rightsApprovalImplied: false
      },
      storeDirectory: "store",
      entries,
      summary: summaryFor(entries, BUNDLE_FORMAT_VERSION)
    };
    manifest.bundleHash = sha256Canonical(bundleHashInput(manifest));
    assertBundleManifest(manifest);
    await writeFile(join(temporary, BUNDLE_MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
    if (await pathInfo(target)) throw new Error(`Bundle destination appeared during export: ${target}`);
    await rename(temporary, target);
    return { path: target, manifest, verification };
  } finally {
    if (existsSync(temporary)) await rm(temporary, { recursive: true, force: true });
  }
}

async function inspectBundle(bundleDirectory) {
  const source = resolve(bundleDirectory);
  const files = await walkRegularFiles(source);
  const relativeFiles = files.map((path) => slashPath(relative(source, path)));
  if (!relativeFiles.includes(BUNDLE_MANIFEST_NAME)) throw new Error(`Missing ${BUNDLE_MANIFEST_NAME}`);
  const manifest = assertBundleManifest(parseJsonStrict(await readFile(join(source, BUNDLE_MANIFEST_NAME), "utf8")));
  const expected = new Set([BUNDLE_MANIFEST_NAME, ...manifest.entries.map((entry) => entry.path)]);
  const actual = new Set(relativeFiles);
  for (const path of relativeFiles) if (!expected.has(path)) throw new Error(`Unexpected file in bundle: ${path}`);
  for (const path of expected) if (!actual.has(path)) throw new Error(`Manifest entry is missing from bundle: ${path}`);
  return { source, manifest };
}

export async function importProjectBundle(bundleDirectory, projectRoot) {
  const { source, manifest } = await inspectBundle(bundleDirectory);
  const targetProject = resolve(projectRoot);
  const targetStore = join(targetProject, ".cineweave");
  if (await pathInfo(targetStore)) throw new Error(`Target project already has a .cineweave store: ${targetStore}`);
  await mkdir(dirname(targetProject), { recursive: true });
  const stageProject = await mkdtemp(join(dirname(targetProject), ".cineweave-import-"));
  assertCleanupTarget(stageProject, dirname(targetProject), ".cineweave-import-");
  const stageStore = join(stageProject, ".cineweave");
  try {
    for (const entry of manifest.entries) {
      const sourcePath = join(source, ...entry.path.split("/"));
      const info = await lstat(sourcePath);
      if (info.isSymbolicLink() || !info.isFile()) throw new Error(`Bundle entry is no longer a regular file: ${entry.path}`);
      const bytes = await readFile(sourcePath);
      if (bytes.byteLength !== entry.byteLength || sha256Bytes(bytes) !== entry.contentHash) throw new Error(`Bundle entry verification failed: ${entry.path}`);
      const destination = join(stageStore, ...entry.path.slice("store/".length).split("/"));
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, bytes, { flag: "wx" });
    }
    const importedProject = await readStrictJson(join(stageStore, "project.json"));
    const importedProjectBytes = await readFile(join(stageStore, "project.json"));
    if (importedProject.projectId !== manifest.sourceProject.projectId || sha256Bytes(importedProjectBytes) !== manifest.sourceProject.projectManifestHash) throw new Error("Imported project manifest does not match the bundle source project");
    const verification = await verifyProject(stageProject);
    if (!verification.valid) throw new Error(`Imported project verification failed: ${verification.errors.join("; ")}`);
    if (await pathInfo(targetStore)) throw new Error(`Target project store appeared during import: ${targetStore}`);
    await mkdir(targetProject, { recursive: true });
    await rename(stageStore, targetStore);
    return { path: targetStore, manifest, verification };
  } finally {
    if (existsSync(stageProject)) await rm(stageProject, { recursive: true, force: true });
  }
}

export async function verifyProjectBundle(bundleDirectory) {
  const { source, manifest } = await inspectBundle(bundleDirectory);
  for (const entry of manifest.entries) {
    const path = join(source, ...entry.path.split("/"));
    const info = await lstat(path);
    if (info.isSymbolicLink() || !info.isFile()) throw new Error(`Bundle entry is not a regular file: ${entry.path}`);
    const bytes = await readFile(path);
    if (bytes.byteLength !== entry.byteLength || sha256Bytes(bytes) !== entry.contentHash) throw new Error(`Bundle entry verification failed: ${entry.path}`);
  }
  return { valid: true, path: source, manifest };
}
