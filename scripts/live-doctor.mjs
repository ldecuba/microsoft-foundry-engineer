#!/usr/bin/env node

import { runLiveDoctor } from "../dist/tools/liveAzure.js";

const resourceGroup = process.argv[2] ?? "rg-aifoundry-dev";
const accountName = process.argv[3] ?? "ais-aifoundry-dev";
const containerAppName = process.argv[4] ?? "foundry-engineer-mcp";
const location = process.argv[5] ?? "westeurope";
const appInsightsApp = process.argv[6];

const result = await runLiveDoctor({
  resourceGroup,
  accountName,
  containerAppName,
  location,
  appInsightsApp
});

console.log(JSON.stringify(result, null, 2));
