import type { ToolResult } from "./types.js";

export function checkEnvironment(args: {
  subscriptionId?: string;
  resourceGroup?: string;
  foundryProjectEndpoint?: string;
  requirePrivateNetworking: boolean;
}): ToolResult {
  const checklist = [
    { id: "auth", title: "Azure CLI login", evidence: "Active account from `az account show`." },
    { id: "azd", title: "Azure Developer CLI", evidence: "`azd version` and Foundry extension availability." },
    { id: "subscription", title: "Subscription selected", evidence: args.subscriptionId ?? "Subscription id captured from the active account." },
    { id: "resource-group", title: "Resource group selected", evidence: args.resourceGroup ?? "Resource group name for the Foundry project." },
    { id: "project-endpoint", title: "Foundry project endpoint", evidence: args.foundryProjectEndpoint ?? "Project endpoint from Foundry portal, azd env, or Azure resource lookup." },
    { id: "managed-identity", title: "Managed identity configured", evidence: "Identity used for runtime access to data, search, storage, and telemetry." },
    { id: "app-insights", title: "Telemetry connected", evidence: "Application Insights connection string or OpenTelemetry exporter configured." }
  ];

  if (args.requirePrivateNetworking) {
    checklist.push({
      id: "private-networking",
      title: "Private networking verified",
      evidence: "Private endpoint, DNS, and public network access settings checked from an allowed network."
    });
  }

  return {
    status: "review",
    summary: "Environment checklist generated. Run each evidence check before deployment work.",
    findings: [
      {
        severity: args.foundryProjectEndpoint ? "low" : "medium",
        title: "Project context must be proven",
        detail: "Foundry engineering actions should resolve subscription, resource group, project endpoint, and environment before touching deployments.",
        evidence: ["Azure account", "Foundry project endpoint", "azd environment values if used"],
        nextAction: "Capture these values in your environment or project metadata."
      }
    ],
    checklist
  };
}
