import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { sha256Bytes } from "./canonical-json.mjs";

export const entrypointId = "fixture.svg.v1";
export const implementationContentHash = sha256Bytes(await readFile(fileURLToPath(import.meta.url)));

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parameter(request, name, fallback) {
  return request.parameters?.find((item) => item.name === name)?.value ?? fallback;
}

export const fixtureSvgAdapter = Object.freeze({
  entrypointId,
  implementationContentHash,
  async estimate() {
    return { amount: 0, currency: "USD" };
  },
  async execute({ request }) {
    if (request.executionMode !== "fixture") throw new Error("The core SVG adapter accepts fixture mode only");
    const width = 512;
    const height = 512;
    const label = String(parameter(request, "label", "CineWeave execution fixture"));
    const outputs = [];
    for (let index = 0; index < request.outputRequest.variantCount; index += 1) {
      const number = String(index + 1).padStart(2, "0");
      const fingerprint = request.promptRef.contentHash.slice(7, 19);
      const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
        '<rect width="512" height="512" fill="#0b1020"/>',
        '<circle cx="256" cy="214" r="122" fill="#1d6fff" opacity="0.92"/>',
        '<path d="M167 249 C208 169 303 163 345 249 C305 222 207 222 167 249Z" fill="#f4f7ff" opacity="0.94"/>',
        `<text x="256" y="382" text-anchor="middle" fill="#f4f7ff" font-family="sans-serif" font-size="22">${escapeXml(label)}</text>`,
        `<text x="256" y="417" text-anchor="middle" fill="#91a4cb" font-family="monospace" font-size="15">${escapeXml(`${fingerprint} · ${number}`)}</text>`,
        "</svg>\n"
      ].join("");
      outputs.push({
        filename: `output-${number}.svg`,
        mediaKind: "image",
        mimeType: "image/svg+xml",
        bytes: Buffer.from(svg, "utf8"),
        width,
        height,
        durationMs: null
      });
    }
    return { providerRequestId: null, costAmount: 0, currency: "USD", outputs };
  }
});

export function createFixtureAdapterDescriptor({ capabilityProfileRef, licenseProfileRefs, skillReceipt, timestamp = new Date().toISOString() }) {
  return {
    kind: "cineweave_adapter_descriptor",
    contractVersion: "2.3.0",
    adapterId: "adapter.fixture-svg",
    adapterVersion: "1.0.0",
    protocolVersion: "1.0.0",
    displayName: "Deterministic SVG fixture adapter",
    status: "active",
    adapterClass: "fixture",
    skillReceipt,
    implementation: { distribution: "core_fixture", entrypointId, contentHash: implementationContentHash },
    capabilityProfileRef,
    licenseProfileRefs,
    executionModes: ["dry_run", "fixture"],
    operations: [{
      operationId: "image.generate.fixture",
      mediaKinds: ["image"],
      requestModes: ["generate"],
      requiredCapabilityIds: ["image_generation"],
      acceptedInputRoles: [],
      outputMimeTypes: ["image/svg+xml"],
      maxInputs: 0,
      maxOutputs: 8,
      supportsIdempotency: true,
      parameterSchemaId: null
    }],
    security: {
      networkAccess: "forbidden",
      networkPolicyId: null,
      credentialEnvVars: [],
      contractsMayContainSecrets: false,
      externalEffectsDefaultDenied: true,
      arbitraryCommandExecution: false,
      outputRootConstrained: true
    },
    costPolicy: { currency: "USD", estimateSupport: "exact", unknownCostAction: "block", retryCostAccounting: "include_all_attempts" },
    validation: {
      operationIdsUnique: true,
      capabilityProfileExact: true,
      licenseProfilesExact: true,
      implementationHashVerified: true,
      noEndpointOrCredentialValues: true
    },
    provenance: { source: "suite_builtin", createdAt: timestamp, updatedAt: timestamp, changeLog: ["v1: runtime-bound fixture descriptor"] }
  };
}
