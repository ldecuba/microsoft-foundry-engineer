#!/usr/bin/env node

import { runSmokePrompt } from "../dist/tools/liveAzure.js";

const resourceGroup = process.argv[2] ?? "rg-aifoundry-dev";
const accountName = process.argv[3] ?? "ais-aifoundry-dev";
const deploymentName = process.argv[4] ?? "gpt-4o";
const prompt = process.argv[5] ?? "Reply with one short sentence confirming this Foundry deployment is responding.";

const result = await runSmokePrompt({
  resourceGroup,
  accountName,
  deploymentName,
  prompt,
  maxTokens: 128,
  temperature: 0
});

console.log(JSON.stringify(result, null, 2));
