#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contractRoot = join(repoRoot, "packages", "cineweave-contracts");
const manifestPath = join(contractRoot, "contracts", "manifest.json");
const expectedSkills = ["cineweave", "cineweave-story", "cineweave-character", "cineweave-scene", "cineweave-style", "cineweave-director", "cineweave-prompt", "cineweave-production"];

function fail(errors, condition, message) { if (!condition) errors.push(message); }
function unique(values) { return new Set(values).size === values.length; }

async function main() {
  const errors = [];
  const plugin = JSON.parse(await readFile(join(repoRoot, ".codex-plugin", "plugin.json"), "utf8"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  fail(errors, plugin.name === "cineweave-studio", "plugin package name must be cineweave-studio");
  fail(errors, plugin.version === "2.2.0", "plugin version must be 2.2.0");
  fail(errors, manifest.suite === "cineweave-studio" && manifest.version === "2.2.0", "contract package must be CineWeave Studio v2.2");
  fail(errors, manifest.entrySkill === "cineweave", "manifest entrySkill must be cineweave");
  fail(errors, manifest.composition?.specialistsMayRunWithoutRouter === true, "manifest must declare router-independent specialists");
  fail(errors, manifest.composition?.allowsImplicitConversationState === false, "manifest must forbid hidden conversational state");
  fail(errors, manifest.composition?.allowsCycles === false, "manifest must forbid workflow cycles");

  const skillNames = (manifest.skills || []).map((skill) => skill.name);
  fail(errors, unique(skillNames), "skill names must be unique");
  fail(errors, expectedSkills.length === skillNames.length && expectedSkills.every((name) => skillNames.includes(name)), "manifest must include exactly the router and seven specialists");
  const routes = [];
  const contractKinds = new Map();
  for (const contract of manifest.contracts || []) {
    fail(errors, !contractKinds.has(contract.kind), `duplicate contract kind ${contract.kind}`);
    contractKinds.set(contract.kind, contract);
    fail(errors, existsSync(join(contractRoot, contract.schema)), `missing schema ${contract.schema}`);
    fail(errors, existsSync(join(contractRoot, contract.example)), `missing example ${contract.example}`);
  }
  for (const skill of manifest.skills || []) {
    routes.push(...(skill.owns || []));
    const root = join(repoRoot, "skills", skill.name);
    const skillPath = join(root, "SKILL.md");
    const agentPath = join(root, "agents", "openai.yaml");
    const contractsPath = join(root, "contracts.json");
    fail(errors, existsSync(skillPath), `${skill.name} must have SKILL.md`);
    fail(errors, existsSync(agentPath), `${skill.name} must have agents/openai.yaml`);
    fail(errors, existsSync(contractsPath), `${skill.name} must have contracts.json`);
    if (!existsSync(skillPath) || !existsSync(contractsPath)) continue;
    const skillText = await readFile(skillPath, "utf8");
    const index = JSON.parse(await readFile(contractsPath, "utf8"));
    fail(errors, skillText.includes(`name: ${skill.name}`), `${skill.name} frontmatter name mismatch`);
    fail(errors, !skillText.includes("../../schemas/"), `${skill.name} retains a V1 schema path`);
    fail(errors, index.contractPackage === "cineweave-contracts@2.2.0", `${skill.name} must point to the V2.2 contract package`);
    fail(errors, Array.isArray(index.standalone?.accepts) && index.standalone.accepts.length > 0, `${skill.name} lacks standalone inputs`);
    fail(errors, Array.isArray(index.standalone?.produces) && index.standalone.produces.length > 0, `${skill.name} lacks standalone outputs`);
    fail(errors, Array.isArray(index.contractKinds) && index.contractKinds.length > 0, `${skill.name} must declare portable contracts`);
    for (const kind of index.contractKinds || []) fail(errors, contractKinds.has(kind), `${skill.name} references unknown contract ${kind}`);
    if (skill.name !== "cineweave") {
      fail(errors, skill.standalone === true && skill.composable === true, `${skill.name} must be both standalone and composable`);
    }
  }
  fail(errors, unique(routes), "each route must have one owner");
  const brief = contractKinds.get("cineweave_codex_creative_brief");
  const workflow = contractKinds.get("cineweave_codex_workflow_plan");
  fail(errors, brief?.owner === "cineweave", "CreativeBrief must be owned by cineweave");
  fail(errors, workflow?.owner === "cineweave", "WorkflowPlan must be owned by cineweave");
  fail(errors, contractKinds.get("cineweave_codex_story_brief")?.owner === "cineweave-story", "StoryBrief must be owned by cineweave-story");
  fail(errors, contractKinds.get("cineweave_codex_prompt_record")?.owner === "cineweave-prompt", "PromptRecord must be owned by cineweave-prompt");
  fail(errors, contractKinds.get("cineweave_codex_shot_spec")?.owner === "cineweave-director", "ShotSpec must be owned by cineweave-director");
  fail(errors, contractKinds.get("cineweave_codex_scene_light_state")?.owner === "cineweave-scene", "SceneLightState must be owned by cineweave-scene");
  fail(errors, contractKinds.get("cineweave_codex_style_light_grammar")?.owner === "cineweave-style", "StyleLightGrammar must be owned by cineweave-style");
  const director = await readFile(join(repoRoot, "skills", "cineweave-director", "SKILL.md"), "utf8");
  fail(errors, !director.includes("`brief_compile`"), "Director must not own brief_compile in V2");

  if (errors.length) { console.error(errors.map((error) => `- ${error}`).join("\n")); process.exitCode = 1; return; }
  console.log(`CineWeave Studio v2.2 architecture passes: ${skillNames.length} Skills, ${contractKinds.size} contracts and ${routes.length} owned routes.`);
}

main().catch((error) => { console.error(error instanceof Error ? error.stack || error.message : String(error)); process.exitCode = 2; });
