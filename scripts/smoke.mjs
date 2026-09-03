#!/usr/bin/env node

import { existsSync } from "node:fs";

const requiredFiles = [
  "package.json",
  "tsconfig.json",
  "src/server.ts",
  "src/httpServer.ts",
  "src/services/azureCli.ts",
  "src/tools/euAiAct.ts",
  "src/tools/liveAzure.ts",
  "scripts/live-doctor.mjs",
  "Dockerfile",
  "infra/container-app.bicep",
  "docs/hosting-azure-container-apps.md",
  "templates/eu-ai-act-evidence-pack.md",
  "templates/foundry-agent-manifest.json",
  "templates/foundry-go-live-report.md"
];

const missing = requiredFiles.filter((file) => !existsSync(file));

if (missing.length > 0) {
  console.error(`Missing required files: ${missing.join(", ")}`);
  process.exit(1);
}

console.log("Smoke check passed.");
