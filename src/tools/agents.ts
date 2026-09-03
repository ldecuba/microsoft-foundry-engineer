export function buildAgentManifest(args: {
  name: string;
  description: string;
  modelDeployment: string;
  tools: string[];
  environments: string[];
}) {
  return {
    name: args.name,
    description: args.description,
    kind: "foundry-agent-manifest",
    modelDeployment: args.modelDeployment,
    tools: args.tools.map((tool) => ({
      name: tool,
      auth: "managed identity or scoped secret",
      allowedActions: [],
      auditRequired: true
    })),
    environments: args.environments.map((environment) => ({
      name: environment,
      approvalRequired: environment === "prod",
      evalRequired: environment !== "dev"
    })),
    safety: {
      userDisclosure: "Tell users they are interacting with AI where applicable.",
      contentFiltering: "Use Foundry content safety and log filter outcomes.",
      blockedUses: "Screen against prohibited AI practices and organization policy."
    },
    evidence: [
      "agent instructions",
      "tool permission list",
      "evaluation suite",
      "test transcript",
      "EU AI Act readiness result",
      "owner and reviewer"
    ]
  };
}
