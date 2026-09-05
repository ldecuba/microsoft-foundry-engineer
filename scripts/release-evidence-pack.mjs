#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { generateReleaseEvidencePack } from "../dist/tools/liveAzure.js";

const [
  resourceGroup = "rg-aifoundry-dev",
  accountName = "ais-aifoundry-dev",
  deploymentName = "gpt-4o",
  outputPath
] = process.argv.slice(2);

const result = await generateReleaseEvidencePack({
  systemName: "Microsoft Foundry Engineer MCP",
  useCase: "Engineering assistant for Microsoft Foundry project readiness, live checks, and EU AI Act evidence.",
  resourceGroup,
  accountName,
  location: "westeurope",
  containerAppName: "foundry-engineer-mcp",
  deploymentName,
  includeSmokePrompt: true
});

if (outputPath) {
  await writeFile(outputPath, result.markdown, "utf8");
  console.log(JSON.stringify({ status: result.status, outputPath, checks: result.checks }, null, 2));
} else {
  console.log(JSON.stringify(result, null, 2));
}
