import { runAzJson } from "../services/azureCli.js";

interface AccessToken {
  accessToken: string;
  expiresOn?: string;
  expires_on?: number;
  subscription?: string;
  tenant?: string;
  tokenType?: string;
}

interface FoundryResourceSummary {
  endpoint?: string;
}

export async function getAzureAccount() {
  return runAzJson(["account", "show", "--query", "{tenantId:tenantId,subscriptionId:id,name:name,user:user.name}"]);
}

export async function getCognitiveServicesAccessToken() {
  return runAzJson<AccessToken>([
    "account",
    "get-access-token",
    "--resource",
    "https://cognitiveservices.azure.com/",
    "--query",
    "{accessToken:accessToken,expiresOn:expiresOn,expires_on:expires_on,subscription:subscription,tenant:tenant,tokenType:tokenType}"
  ]);
}

export async function listFoundryResources(args: { resourceGroup?: string }) {
  const query = "[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name,endpoint:properties.endpoint,customSubDomainName:properties.customSubDomainName,publicNetworkAccess:properties.publicNetworkAccess}";
  const commandArgs = args.resourceGroup
    ? ["cognitiveservices", "account", "list", "--resource-group", args.resourceGroup, "--query", query]
    : ["cognitiveservices", "account", "list", "--query", query];

  return runAzJson(commandArgs);
}

export async function getFoundryResource(args: { name: string; resourceGroup: string }) {
  return runAzJson([
    "cognitiveservices",
    "account",
    "show",
    "--name",
    args.name,
    "--resource-group",
    args.resourceGroup,
    "--query",
    "{name:name,resourceGroup:resourceGroup,location:location,kind:kind,sku:sku.name,endpoint:properties.endpoint,publicNetworkAccess:properties.publicNetworkAccess,networkAcls:properties.networkAcls,privateEndpointConnections:properties.privateEndpointConnections[].properties.privateLinkServiceConnectionState.status}"
  ]);
}

function normalizeEndpoint(endpoint: string) {
  return endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
}

function summarizeChatCompletion(data: unknown) {
  const response = data as {
    id?: string;
    model?: string;
    created?: number;
    choices?: Array<{
      finish_reason?: string;
      message?: { role?: string; content?: string };
      content_filter_results?: unknown;
    }>;
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
    prompt_filter_results?: unknown;
  };

  return {
    id: response.id,
    model: response.model,
    created: response.created,
    message: response.choices?.[0]?.message,
    finishReason: response.choices?.[0]?.finish_reason,
    usage: response.usage,
    promptFilterResults: response.prompt_filter_results,
    contentFilterResults: response.choices?.[0]?.content_filter_results
  };
}

export async function runSmokePrompt(args: {
  endpoint?: string;
  accountName?: string;
  resourceGroup?: string;
  deploymentName: string;
  prompt: string;
  systemPrompt?: string;
  apiVersion?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  apiKey?: string;
}) {
  const startedAt = new Date();
  const timeoutMs = args.timeoutMs ?? 60000;
  let endpoint = args.endpoint;
  let resourceLookup: Awaited<ReturnType<typeof getFoundryResource>> | undefined;

  if (!endpoint && args.accountName && args.resourceGroup) {
    resourceLookup = await getFoundryResource({
      name: args.accountName,
      resourceGroup: args.resourceGroup
    });

    endpoint = (resourceLookup.data as FoundryResourceSummary | undefined)?.endpoint;
  }

  if (!endpoint) {
    return {
      ok: false,
      status: "failed",
      error: "Provide endpoint, or provide accountName and resourceGroup so the endpoint can be resolved.",
      resourceLookup
    };
  }

  let bearerToken: string | undefined;
  let token: Awaited<ReturnType<typeof getCognitiveServicesAccessToken>> | undefined;
  if (!args.apiKey) {
    token = await getCognitiveServicesAccessToken();
    if (!token.ok || !token.data?.accessToken) {
      return {
        ok: false,
        status: "failed",
        error: "Could not get an Entra token for Cognitive Services.",
        token
      };
    }
    bearerToken = token.data.accessToken;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const url = `${normalizeEndpoint(endpoint)}/openai/deployments/${encodeURIComponent(args.deploymentName)}/chat/completions?api-version=${encodeURIComponent(args.apiVersion ?? "2024-10-21")}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(args.apiKey
          ? { "api-key": args.apiKey }
          : { Authorization: `Bearer ${bearerToken}` })
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: args.systemPrompt ?? "You are a concise Microsoft Foundry smoke-test assistant."
          },
          {
            role: "user",
            content: args.prompt
          }
        ],
        max_tokens: args.maxTokens ?? 128,
        temperature: args.temperature ?? 0
      }),
      signal: controller.signal
    });

    const text = await response.text();
    const elapsedMs = Date.now() - startedAt.getTime();
    const parsed = text ? JSON.parse(text) : undefined;

    return {
      ok: response.ok,
      status: response.ok ? "passed" : "failed",
      httpStatus: response.status,
      elapsedMs,
      endpoint: normalizeEndpoint(endpoint),
      deploymentName: args.deploymentName,
      apiVersion: args.apiVersion ?? "2024-10-21",
      authenticatedWith: args.apiKey ? "api-key" : "entra-id",
      startedAt: startedAt.toISOString(),
      completedAt: new Date().toISOString(),
      resourceLookup,
      result: response.ok ? summarizeChatCompletion(parsed) : parsed
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      elapsedMs: Date.now() - startedAt.getTime(),
      endpoint: normalizeEndpoint(endpoint),
      deploymentName: args.deploymentName,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function listModelDeployments(args: { accountName: string; resourceGroup: string }) {
  return runAzJson([
    "cognitiveservices",
    "account",
    "deployment",
    "list",
    "--name",
    args.accountName,
    "--resource-group",
    args.resourceGroup,
    "--query",
    "[].{name:name,model:properties.model.name,version:properties.model.version,format:properties.model.format,sku:sku.name,capacity:sku.capacity,raiPolicy:properties.raiPolicyName,provisioningState:properties.provisioningState}"
  ]);
}

export async function listCognitiveServicesUsage(args: { location: string }) {
  return runAzJson([
    "cognitiveservices",
    "usage",
    "list",
    "--location",
    args.location,
    "--query",
    "[].{name:name.value,localizedName:name.localizedValue,currentValue:currentValue,limit:limit,unit:unit}"
  ]);
}

export async function listRoleAssignments(args: { scope?: string; assignee?: string }) {
  const commandArgs = ["role", "assignment", "list"];

  if (args.scope) {
    commandArgs.push("--scope", args.scope);
  }

  if (args.assignee) {
    commandArgs.push("--assignee", args.assignee);
  }

  commandArgs.push("--query", "[].{principalName:principalName,principalType:principalType,roleDefinitionName:roleDefinitionName,scope:scope}");
  return runAzJson(commandArgs, 60000);
}

export async function checkNetworkPosture(args: { accountName: string; resourceGroup: string }) {
  const resource = await getFoundryResource({
    name: args.accountName,
    resourceGroup: args.resourceGroup
  });

  const data = resource.data as
    | {
        publicNetworkAccess?: string;
        networkAcls?: { defaultAction?: string; ipRules?: unknown[]; virtualNetworkRules?: unknown[] };
        privateEndpointConnections?: string[];
      }
    | undefined;

  const publicNetworkAccess = data?.publicNetworkAccess ?? "Unknown";
  const privateEndpointConnections = data?.privateEndpointConnections ?? [];
  const networkAcls = data?.networkAcls;

  return {
    status: publicNetworkAccess === "Disabled" || privateEndpointConnections.length > 0 ? "review" : "warning",
    resource,
    assessment: {
      publicNetworkAccess,
      defaultAction: networkAcls?.defaultAction ?? "not configured",
      ipRuleCount: networkAcls?.ipRules?.length ?? 0,
      virtualNetworkRuleCount: networkAcls?.virtualNetworkRules?.length ?? 0,
      privateEndpointConnectionStates: privateEndpointConnections,
      productionConcern:
        publicNetworkAccess === "Enabled" && privateEndpointConnections.length === 0
          ? "Public network access is enabled and no private endpoint connection was found in the account payload."
          : "Network posture has private access or public access restrictions to review."
    },
    nextActions: [
      "Confirm whether production requires Private Link.",
      "Confirm DNS resolution from the runtime network.",
      "Confirm public network access and firewall rules match the data classification.",
      "Record the result in the go-live evidence pack."
    ]
  };
}

export async function listPrivateEndpoints(args: { resourceGroup: string; accountName?: string }) {
  const query = args.accountName
    ? `[?contains(properties.privateLinkServiceConnections[0].properties.privateLinkServiceId, '${args.accountName}')].{name:name,location:location,provisioningState:properties.provisioningState,connectionState:properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status,subnet:properties.subnet.id,privateLinkServiceId:properties.privateLinkServiceConnections[0].properties.privateLinkServiceId}`
    : "[].{name:name,location:location,provisioningState:properties.provisioningState,connectionState:properties.privateLinkServiceConnections[0].properties.privateLinkServiceConnectionState.status,subnet:properties.subnet.id,privateLinkServiceId:properties.privateLinkServiceConnections[0].properties.privateLinkServiceId}";

  return runAzJson(["network", "private-endpoint", "list", "--resource-group", args.resourceGroup, "--query", query]);
}

export async function getContainerAppStatus(args: { name: string; resourceGroup: string }) {
  return runAzJson([
    "containerapp",
    "show",
    "--name",
    args.name,
    "--resource-group",
    args.resourceGroup,
    "--query",
    "{name:name,resourceGroup:resourceGroup,location:location,provisioningState:properties.provisioningState,runningStatus:properties.runningStatus,fqdn:properties.configuration.ingress.fqdn,image:properties.template.containers[0].image,outboundIpAddresses:properties.outboundIpAddresses}"
  ]);
}

export async function listAppInsightsComponents(args: { resourceGroup?: string }) {
  const query = "[].{name:name,resourceGroup:resourceGroup,location:location,kind:kind,id:id,appId:properties.AppId,connectionString:properties.ConnectionString}";
  const commandArgs = args.resourceGroup
    ? ["resource", "list", "--resource-group", args.resourceGroup, "--resource-type", "Microsoft.Insights/components", "--query", query]
    : ["resource", "list", "--resource-type", "Microsoft.Insights/components", "--query", query];

  return runAzJson(commandArgs);
}

export async function queryAppInsightsTraces(args: {
  app: string;
  resourceGroup?: string;
  offset?: string;
  query?: string;
}) {
  const analyticsQuery =
    args.query ??
    "traces | union requests, exceptions | order by timestamp desc | take 20";
  const commandArgs = [
    "monitor",
    "app-insights",
    "query",
    "--app",
    args.app,
    "--analytics-query",
    analyticsQuery,
    "--offset",
    args.offset ?? "1h"
  ];

  if (args.resourceGroup) {
    commandArgs.push("--resource-group", args.resourceGroup);
  }

  return runAzJson(commandArgs, 60000);
}

export async function runLiveDoctor(args: {
  resourceGroup?: string;
  accountName?: string;
  containerAppName?: string;
  location?: string;
  appInsightsApp?: string;
}) {
  const account = await getAzureAccount();
  const resources = await listFoundryResources({ resourceGroup: args.resourceGroup });
  const deployments = args.accountName && args.resourceGroup
    ? await listModelDeployments({ accountName: args.accountName, resourceGroup: args.resourceGroup })
    : {
        ok: false,
        command: "az cognitiveservices account deployment list",
        error: "Provide accountName and resourceGroup to list deployments."
      };
  const containerApp = args.containerAppName && args.resourceGroup
    ? await getContainerAppStatus({ name: args.containerAppName, resourceGroup: args.resourceGroup })
    : undefined;
  const quota = args.location
    ? await listCognitiveServicesUsage({ location: args.location })
    : undefined;
  const networkPosture = args.accountName && args.resourceGroup
    ? await checkNetworkPosture({ accountName: args.accountName, resourceGroup: args.resourceGroup })
    : undefined;
  const privateEndpoints = args.resourceGroup
    ? await listPrivateEndpoints({ resourceGroup: args.resourceGroup, accountName: args.accountName })
    : undefined;
  const appInsightsComponents = await listAppInsightsComponents({ resourceGroup: args.resourceGroup });
  const recentTraces = args.appInsightsApp
    ? await queryAppInsightsTraces({ app: args.appInsightsApp, resourceGroup: args.resourceGroup, offset: "1h" })
    : undefined;

  return {
    status: "review",
    account,
    foundryResources: resources,
    modelDeployments: deployments,
    containerApp,
    quota,
    networkPosture,
    privateEndpoints,
    appInsightsComponents,
    recentTraces,
    nextChecks: [
      "Run RBAC export for the exact Foundry account or project scope.",
      "Run evals against the actual deployment or agent.",
      "Confirm EU AI Act classification and evidence owner before production."
    ]
  };
}
