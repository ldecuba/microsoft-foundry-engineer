import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { buildDeploymentPlan } from "./tools/deployments.js";
import { buildAgentManifest } from "./tools/agents.js";
import { buildEvalPlan } from "./tools/evaluations.js";
import { checkEnvironment } from "./tools/environment.js";
import { checkRbac } from "./tools/rbac.js";
import { checkEuAiAct } from "./tools/euAiAct.js";
import { buildGoLiveReport, runDoctor } from "./tools/reports.js";
import {
  getAzureAccount,
  checkNetworkPosture,
  getContainerAppStatus,
  getFoundryResource,
  listAppInsightsComponents,
  listCognitiveServicesUsage,
  listFoundryResources,
  listModelDeployments,
  listPrivateEndpoints,
  listRoleAssignments,
  queryAppInsightsTraces,
  runLiveDoctor
} from "./tools/liveAzure.js";

function jsonText(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export function createFoundryEngineerMcpServer() {
  const server = new McpServer({
    name: "microsoft-foundry-engineer-mcp",
    version: "0.1.0"
  });

  server.tool(
    "foundry_validate_environment",
    "Create a practical readiness checklist for a local Microsoft Foundry engineering environment.",
    {
      subscriptionId: z.string().optional(),
      resourceGroup: z.string().optional(),
      foundryProjectEndpoint: z.string().url().optional(),
      requirePrivateNetworking: z.boolean().default(false)
    },
    async (args) => jsonText(checkEnvironment(args))
  );

  server.tool(
    "foundry_create_deployment_plan",
    "Generate a model deployment plan for Microsoft Foundry, including quota, region, cost, and smoke-test evidence.",
    {
      environment: z.enum(["dev", "test", "prod"]).default("dev"),
      region: z.string(),
      model: z.string(),
      sku: z.string().optional(),
      capacity: z.number().int().positive().optional(),
      dataResidencyRequired: z.boolean().default(true),
      privateNetworking: z.boolean().default(false)
    },
    async (args) => jsonText(buildDeploymentPlan(args))
  );

  server.tool(
    "foundry_generate_agent_manifest",
    "Generate a Foundry agent manifest draft with tools, safety, eval, and deployment metadata.",
    {
      name: z.string(),
      description: z.string(),
      modelDeployment: z.string(),
      tools: z.array(z.string()).default([]),
      environments: z.array(z.string()).default(["dev", "test", "prod"])
    },
    async (args) => jsonText(buildAgentManifest(args))
  );

  server.tool(
    "foundry_generate_eval_plan",
    "Generate an evaluation plan for a Foundry agent or model deployment.",
    {
      targetName: z.string(),
      targetType: z.enum(["agent", "model-deployment"]),
      riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
      includeEuAiActEvidence: z.boolean().default(true)
    },
    async (args) => jsonText(buildEvalPlan(args))
  );

  server.tool(
    "foundry_check_rbac",
    "Generate RBAC checks for a Foundry project, managed identity, and CI/CD principal.",
    {
      principalName: z.string().optional(),
      ciCdPrincipalName: z.string().optional(),
      needsDeploymentWrite: z.boolean().default(true),
      needsDataAccess: z.boolean().default(false)
    },
    async (args) => jsonText(checkRbac(args))
  );

  server.tool(
    "foundry_check_eu_ai_act",
    "Screen a Foundry workload for EU AI Act readiness and evidence gaps.",
    {
      systemName: z.string(),
      useCase: z.string(),
      euUsersOrMarket: z.boolean().default(true),
      interactsWithPeople: z.boolean().default(true),
      generatesOrAltersContent: z.boolean().default(false),
      biometricUse: z.boolean().default(false),
      employmentEducationCreditHealthLawMigrationJusticeUse: z.boolean().default(false),
      manipulativeOrExploitativeRisk: z.boolean().default(false),
      providerOfGpaiModel: z.boolean().default(false),
      usesThirdPartyGpaiModel: z.boolean().default(true),
      highRiskClaimed: z.boolean().optional()
    },
    async (args) => jsonText(checkEuAiAct(args))
  );

  server.tool(
    "foundry_generate_go_live_report",
    "Generate a go-live report that combines Foundry engineering, security, evaluation, and EU AI Act checks.",
    {
      systemName: z.string(),
      environment: z.enum(["dev", "test", "prod"]).default("prod"),
      useCase: z.string(),
      modelDeployment: z.string().optional(),
      privateNetworking: z.boolean().default(false),
      euUsersOrMarket: z.boolean().default(true)
    },
    async (args) => jsonText(buildGoLiveReport(args))
  );

  server.tool(
    "foundry_doctor",
    "Run the top-level Foundry readiness review and return required evidence before go-live.",
    {
      systemName: z.string().default("Foundry workload"),
      environment: z.enum(["dev", "test", "prod"]).default("dev"),
      useCase: z.string().default("Unspecified Foundry workload"),
      euUsersOrMarket: z.boolean().default(true)
    },
    async (args) => jsonText(runDoctor(args))
  );

  server.tool(
    "foundry_live_account",
    "Read the active Azure tenant, subscription, and user from Azure CLI.",
    {},
    async () => jsonText(await getAzureAccount())
  );

  server.tool(
    "foundry_live_list_resources",
    "List Azure AI Services and Foundry account resources visible to the active Azure CLI login.",
    {
      resourceGroup: z.string().optional()
    },
    async (args) => jsonText(await listFoundryResources(args))
  );

  server.tool(
    "foundry_live_get_resource",
    "Get one Azure AI Services or Foundry account resource, including network posture.",
    {
      name: z.string(),
      resourceGroup: z.string()
    },
    async (args) => jsonText(await getFoundryResource(args))
  );

  server.tool(
    "foundry_live_list_model_deployments",
    "List model deployments on an Azure AI Services or Foundry account.",
    {
      accountName: z.string(),
      resourceGroup: z.string()
    },
    async (args) => jsonText(await listModelDeployments(args))
  );

  server.tool(
    "foundry_live_list_role_assignments",
    "List Azure RBAC role assignments for a scope or assignee.",
    {
      scope: z.string().optional(),
      assignee: z.string().optional()
    },
    async (args) => jsonText(await listRoleAssignments(args))
  );

  server.tool(
    "foundry_live_check_quota",
    "List Cognitive Services quota and usage for a region.",
    {
      location: z.string().default("westeurope")
    },
    async (args) => jsonText(await listCognitiveServicesUsage(args))
  );

  server.tool(
    "foundry_live_check_network_posture",
    "Inspect public network access, firewall rules, and private endpoint states for a Foundry or Azure AI Services account.",
    {
      accountName: z.string(),
      resourceGroup: z.string()
    },
    async (args) => jsonText(await checkNetworkPosture(args))
  );

  server.tool(
    "foundry_live_list_private_endpoints",
    "List private endpoints in a resource group, optionally filtered to one Foundry or Azure AI Services account.",
    {
      resourceGroup: z.string(),
      accountName: z.string().optional()
    },
    async (args) => jsonText(await listPrivateEndpoints(args))
  );

  server.tool(
    "foundry_live_get_container_app_status",
    "Get Azure Container Apps status for the hosted MCP or another app.",
    {
      name: z.string(),
      resourceGroup: z.string()
    },
    async (args) => jsonText(await getContainerAppStatus(args))
  );

  server.tool(
    "foundry_live_list_app_insights",
    "List Application Insights components visible to the active Azure CLI login.",
    {
      resourceGroup: z.string().optional()
    },
    async (args) => jsonText(await listAppInsightsComponents(args))
  );

  server.tool(
    "foundry_live_query_app_insights_traces",
    "Query recent Application Insights traces, requests, and exceptions.",
    {
      app: z.string(),
      resourceGroup: z.string().optional(),
      offset: z.string().default("1h"),
      query: z.string().optional()
    },
    async (args) => jsonText(await queryAppInsightsTraces(args))
  );

  server.tool(
    "foundry_live_doctor",
    "Run a read-only live Azure CLI readiness pass for Foundry resources and the hosted MCP.",
    {
      resourceGroup: z.string().optional(),
      accountName: z.string().optional(),
      containerAppName: z.string().optional(),
      location: z.string().optional(),
      appInsightsApp: z.string().optional()
    },
    async (args) => jsonText(await runLiveDoctor(args))
  );

  return server;
}
