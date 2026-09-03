#!/usr/bin/env node

const checks = [
  ["Azure login", "Run `az account show` and capture tenant, subscription, and user."],
  ["Foundry CLI", "Run `azd version` and confirm required Foundry extension or workflow support."],
  ["Project context", "Capture subscription, resource group, Foundry account, project name, and endpoint."],
  ["Model deployments", "List deployments, versions, SKU, capacity, region, and owner."],
  ["Quota", "Check quota in the target region before any deployment attempt."],
  ["RBAC", "Export role assignments for humans, CI/CD, runtime identities, storage, search, and telemetry."],
  ["Networking", "For production, verify private endpoint, DNS, and public network access posture."],
  ["Evaluations", "Run smoke, regression, safety, prompt-injection, and tool-use tests."],
  ["Observability", "Prove traces include model version, prompt, response, tool calls, latency, and failures where lawful."],
  ["EU AI Act", "Run prohibited-practice, high-risk, transparency, GPAI, logging, oversight, and monitoring checks."]
];

console.log("Microsoft Foundry Engineer Doctor");
console.log("Status: review required");
console.log("");

for (const [title, detail] of checks) {
  console.log(`- ${title}: ${detail}`);
}
