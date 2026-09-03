import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { buildDeploymentPlan } from "./tools/deployments.js";
import { buildAgentManifest } from "./tools/agents.js";
import { buildEvalPlan } from "./tools/evaluations.js";
import { checkEnvironment } from "./tools/environment.js";
import { checkRbac } from "./tools/rbac.js";
import { checkEuAiAct } from "./tools/euAiAct.js";
import { buildGoLiveReport, runDoctor } from "./tools/reports.js";
const server = new McpServer({
    name: "microsoft-foundry-engineer-mcp",
    version: "0.1.0"
});
function jsonText(value) {
    return {
        content: [
            {
                type: "text",
                text: JSON.stringify(value, null, 2)
            }
        ]
    };
}
server.tool("foundry_validate_environment", "Create a practical readiness checklist for a local Microsoft Foundry engineering environment.", {
    subscriptionId: z.string().optional(),
    resourceGroup: z.string().optional(),
    foundryProjectEndpoint: z.string().url().optional(),
    requirePrivateNetworking: z.boolean().default(false)
}, async (args) => jsonText(checkEnvironment(args)));
server.tool("foundry_create_deployment_plan", "Generate a model deployment plan for Microsoft Foundry, including quota, region, cost, and smoke-test evidence.", {
    environment: z.enum(["dev", "test", "prod"]).default("dev"),
    region: z.string(),
    model: z.string(),
    sku: z.string().optional(),
    capacity: z.number().int().positive().optional(),
    dataResidencyRequired: z.boolean().default(true),
    privateNetworking: z.boolean().default(false)
}, async (args) => jsonText(buildDeploymentPlan(args)));
server.tool("foundry_generate_agent_manifest", "Generate a Foundry agent manifest draft with tools, safety, eval, and deployment metadata.", {
    name: z.string(),
    description: z.string(),
    modelDeployment: z.string(),
    tools: z.array(z.string()).default([]),
    environments: z.array(z.string()).default(["dev", "test", "prod"])
}, async (args) => jsonText(buildAgentManifest(args)));
server.tool("foundry_generate_eval_plan", "Generate an evaluation plan for a Foundry agent or model deployment.", {
    targetName: z.string(),
    targetType: z.enum(["agent", "model-deployment"]),
    riskLevel: z.enum(["low", "medium", "high"]).default("medium"),
    includeEuAiActEvidence: z.boolean().default(true)
}, async (args) => jsonText(buildEvalPlan(args)));
server.tool("foundry_check_rbac", "Generate RBAC checks for a Foundry project, managed identity, and CI/CD principal.", {
    principalName: z.string().optional(),
    ciCdPrincipalName: z.string().optional(),
    needsDeploymentWrite: z.boolean().default(true),
    needsDataAccess: z.boolean().default(false)
}, async (args) => jsonText(checkRbac(args)));
server.tool("foundry_check_eu_ai_act", "Screen a Foundry workload for EU AI Act readiness and evidence gaps.", {
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
}, async (args) => jsonText(checkEuAiAct(args)));
server.tool("foundry_generate_go_live_report", "Generate a go-live report that combines Foundry engineering, security, evaluation, and EU AI Act checks.", {
    systemName: z.string(),
    environment: z.enum(["dev", "test", "prod"]).default("prod"),
    useCase: z.string(),
    modelDeployment: z.string().optional(),
    privateNetworking: z.boolean().default(false),
    euUsersOrMarket: z.boolean().default(true)
}, async (args) => jsonText(buildGoLiveReport(args)));
server.tool("foundry_doctor", "Run the top-level Foundry readiness review and return required evidence before go-live.", {
    systemName: z.string().default("Foundry workload"),
    environment: z.enum(["dev", "test", "prod"]).default("dev"),
    useCase: z.string().default("Unspecified Foundry workload"),
    euUsersOrMarket: z.boolean().default(true)
}, async (args) => jsonText(runDoctor(args)));
const transport = new StdioServerTransport();
await server.connect(transport);
